import { pool } from ".";
import { FxObj } from "../types/OWOP";
import { clipboardCanvas } from "./implgui";
import { Col, Pos } from "./utils";

export const buildTools = () => {
	OWOP.tools.addToolObject(new OWOP.tools.class("(o) Chunker", OWOP.cursors.erase, OWOP.fx.player.RECT_SELECT_ALIGNED(16), OWOP.RANK.NONE, tool => {
		let pos = new Pos(0, 0);
		let color = new Col(0, 0, 0);
		
		const tick = () => {
			const rgb = color.toInt();
			outer: for (let i = 0; i < 16; ++i) {
				for (let j = 0; j < 16; ++j) {
					const npos = new Pos(pos.x + i, pos.y + j);
					const pixel = OWOP.misc.world.getPixel(npos.x, npos.y);
					if (pixel === null) break outer;
					const pixelColor = new Col(pixel[0], pixel[1], pixel[2]);
					if (color.equals(pixelColor)) continue;
					const client = pool.client;
					if (client === undefined) break outer;
					client.setPixel(npos, color);
					OWOP.misc.world.getChunkAt(pos.chunkX, pos.chunkY).update(npos.x, npos.y, rgb);
				}
			}
			OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(pos.chunkX, pos.chunkY));
		};

		tool.setEvent("mousedown mousemove", (mouse: any) => {
			if (!(mouse.buttons & 0b11)) return;
			pos = Pos.chunkAligned(OWOP.mouse.tileX, OWOP.mouse.tileY);
			color = Col.fromArray(mouse.buttons === 0b10 ? [255, 255, 255] : OWOP.player.selectedColor);
			tool.setEvent("tick", tick);
		});
		tool.setEvent("mouseup deselect", mouse => {
			tool.setEvent("tick", null);
		});
	}));

	OWOP.tools.addToolObject(new OWOP.tools.class("(o) Copy", OWOP.cursors.copy, OWOP.fx.player.NONE, OWOP.RANK.NONE, tool => {
		const drawText = (ctx: CanvasRenderingContext2D, str: string, x: number, y: number, centered: boolean) => {
			ctx.strokeStyle = "#000000", ctx.fillStyle = "#FFFFFF", ctx.lineWidth = 2.5, ctx.globalAlpha = 0.5;
			if (centered) {
				x -= ctx.measureText(str).width >> 1;
			}
			ctx.strokeText(str, x, y);
			ctx.globalAlpha = 1;
			ctx.fillText(str, x, y);
		}

		tool.setFxRenderer((fx: FxObj<any>, ctx, time) => {
			if (!fx.extra.isLocalPlayer) return 1;
			const x = fx.extra.player.x;
			const y = fx.extra.player.y;
			const fxx = (Math.floor(x / 16) - OWOP.camera.x) * OWOP.camera.zoom;
			const fxy = (Math.floor(y / 16) - OWOP.camera.y) * OWOP.camera.zoom;
			const oldlinew = ctx.lineWidth;
			ctx.lineWidth = 1;
			if (tool.extra.end) {
				const s = tool.extra.start as number[];
				const e = tool.extra.end as number[];
				const x = (s[0] - OWOP.camera.x) * OWOP.camera.zoom + 0.5;
				const y = (s[1] - OWOP.camera.y) * OWOP.camera.zoom + 0.5;
				const w = e[0] - s[0];
				const h = e[1] - s[1];
				ctx.beginPath();
				ctx.rect(x, y, w * OWOP.camera.zoom, h * OWOP.camera.zoom);
				ctx.globalAlpha = 1;
				ctx.strokeStyle = "#FFFFFF";
				ctx.stroke();
				ctx.setLineDash([3, 4]);
				ctx.strokeStyle = "#000000";
				ctx.stroke();
				ctx.globalAlpha = 0.25 + Math.sin(time / 500) / 4;
				ctx.fillStyle = OWOP.renderer.patterns.unloaded;
				ctx.fill();
				ctx.setLineDash([]);
				const oldfont = ctx.font;
				ctx.font = "16px sans-serif";
				const txt = (!tool.extra.clicking ? "Right click to copy " : "") + "(" + Math.abs(w) + "x" + Math.abs(h) + ")";
				let txtx = window.innerWidth >> 1;
				let txty = window.innerHeight >> 1;
				txtx = Math.max(x, Math.min(txtx, x + w * OWOP.camera.zoom));
				txty = Math.max(y, Math.min(txty, y + h * OWOP.camera.zoom));

				drawText(ctx, txt, txtx, txty, true);
				ctx.font = oldfont;
				ctx.lineWidth = oldlinew;
				return 0;
			} else {
				ctx.beginPath();
				ctx.moveTo(0, fxy + 0.5);
				ctx.lineTo(window.innerWidth, fxy + 0.5);
				ctx.moveTo(fxx + 0.5, 0);
				ctx.lineTo(fxx + 0.5, window.innerHeight);

				//ctx.lineWidth = 1;
				ctx.globalAlpha = 1;
				ctx.strokeStyle = "#FFFFFF";
				ctx.stroke();
				ctx.setLineDash([3]);
				ctx.strokeStyle = "#000000";
				ctx.stroke();

				ctx.setLineDash([]);
				ctx.lineWidth = oldlinew;
				return 1;
			}
		});

		tool.extra.start = null;
		tool.extra.end = null;
		tool.extra.clicking = false;

		tool.setEvent("mousedown", (mouse, event) => {
			const s = tool.extra.start as number[];
			const e = tool.extra.end as number[];
			const isInside = () => {
				return mouse.tileX >= s[0] && mouse.tileX < e[0] && mouse.tileY >= s[1] && mouse.tileY < e[1];
			};
			if (mouse.buttons === 1 && !tool.extra.end) {
				tool.extra.start = [mouse.tileX, mouse.tileY];
				tool.extra.clicking = true;
				tool.setEvent("mousemove", (mouse, event) => {
					if (tool.extra.start && mouse.buttons === 1) {
						tool.extra.end = [mouse.tileX, mouse.tileY];
						return 1;
					}
				});
				const finish = () => {
					tool.setEvent("mousemove mouseup deselect", null);
					tool.extra.clicking = false;
					const s = tool.extra.start as number[];
					const e = tool.extra.end as number[];
					if (e) {
						if (s[0] === e[0] || s[1] === e[1]) {
							tool.extra.start = null;
							tool.extra.end = null;
						}
						if (s[0] > e[0]) {
							const tmp = e[0];
							e[0] = s[0];
							s[0] = tmp;
						}
						if (s[1] > e[1]) {
							const tmp = e[1];
							e[1] = s[1];
							s[1] = tmp;
						}
					}
					OWOP.renderer.render(OWOP.renderer.rendertype.FX);
				};
				tool.setEvent("deselect", finish);
				tool.setEvent("mouseup", (mouse, event) => {
					if (!(mouse.buttons & 1)) {
						finish();
					}
				});
			} else if (mouse.buttons === 1 && tool.extra.end) {
				if (isInside()) {
					const offx = mouse.tileX;
					const offy = mouse.tileY;
					tool.setEvent("mousemove", (mouse, event) => {
						const dx = mouse.tileX - offx;
						const dy = mouse.tileY - offy;
						tool.extra.start = [s[0] + dx, s[1] + dy];
						tool.extra.end = [e[0] + dx, e[1] + dy];
					});
					const end = () => {
					tool.setEvent("mouseup deselect mousemove", null);
					};
					tool.setEvent("deselect", end);
					tool.setEvent("mouseup", (mouse, event) => {
						if (!(mouse.buttons & 1)) {
							end();
						}
					});
				} else {
					tool.extra.start = null;
					tool.extra.end = null;
				}
			} else if (mouse.buttons === 2 && tool.extra.end && isInside()) {
				tool.extra.start = null;
				tool.extra.end = null;
				const x = s[0];
				const y = s[1];
				const w = e[0] - s[0];
				const h = e[1] - s[1];
				const c = clipboardCanvas;
				c.width = w;
				c.height = h;
				const ctx = c.getContext("2d");
				if (ctx === null) return;
				const d = ctx.createImageData(w, h);
				for (let i = y; i < y + h; i++) {
					for (let j = x; j < x + w; j++) {
						const pix = OWOP.misc.world.getPixel(j, i);
						if (!pix) continue;
						d.data[4 * ((i - y) * w + (j - x))] = pix[0];
						d.data[4 * ((i - y) * w + (j - x)) + 1] = pix[1];
						d.data[4 * ((i - y) * w + (j - x)) + 2] = pix[2];
						d.data[4 * ((i - y) * w + (j - x)) + 3] = 255;
					}
				}
				ctx.putImageData(d, 0, 0);
				OWOP.player.tool = "(o) paste";
			}
		});
	}));

	OWOP.tools.addToolObject(new OWOP.tools.class("(o) Paste", OWOP.cursors.paste, OWOP.fx.player.NONE, OWOP.RANK.NONE, tool => {
		tool.setFxRenderer((fx: FxObj<any>, ctx, time) => {
			const z = OWOP.camera.zoom;
			const x = fx.extra.player.x;
			const y = fx.extra.player.y;
			const fxx = Math.floor(x / 16) - OWOP.camera.x;
			const fxy = Math.floor(y / 16) - OWOP.camera.y;

			const q = pool.chunkedQueue;
			if (q.length) {
				const cs = 16;
				ctx.strokeStyle = "#000000";
				ctx.globalAlpha = 0.8;
				ctx.beginPath();
				for (let i = 0; i < q.length; i++) {
					ctx.rect((q[i].x * cs - OWOP.camera.x) * z, (q[i].y * cs - OWOP.camera.y) * z, z * cs, z * cs);
				}
				ctx.stroke();
				return 0;
			}

			if (clipboardCanvas && fx.extra.isLocalPlayer) {
				ctx.globalAlpha = 0.5 + Math.sin(time / 500) / 4;
				ctx.strokeStyle = "#000000";
				ctx.scale(z, z);
				ctx.drawImage(clipboardCanvas, fxx, fxy);
				ctx.scale(1 / z, 1 / z);
				ctx.globalAlpha = 0.8;
				ctx.strokeRect(fxx * z, fxy * z, clipboardCanvas.width * z, clipboardCanvas.height * z);
				return 0;
			}
		});
		
		tool.setEvent("mousedown", mouse => {
			if (mouse.buttons & 0b1) {
				pool.queueImage(clipboardCanvas, new Pos(OWOP.mouse.tileX, OWOP.mouse.tileY));
			} else if (mouse.buttons & 0b10) {
				pool.chunkedQueue = [];
			}
		});
	}));
};
