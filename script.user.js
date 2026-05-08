// ==UserScript==
// @name cocos-owop
// @namespace https://meowing.net
// @version 0.2
// @description A helpful script for Our World of Pixels
// @author catcake43
// @match https://ourworldofpixels.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=ourworldofpixels.com
// @grant none
// ==/UserScript==

window.addEventListener("load", () => {
	const OWOP = window.OWOP;

	OWOP.on(OWOP.events.net.sec.rank, () => {
		OWOP.showPlayerList(true);
	});

	OWOP.once(OWOP.events.misc.toolsInitialized, () => {
		/** @type {typeof window.WebSocket} */
		const WebSocket = OWOP.global.AnnoyingAPI.ws;

		{
			const prefix = ".";

			const commands = {
				help() {
					OWOP.chat.local("Available commands: help, say, tp, tpto");
					return "";
				},
				say(args) {
					return args.split(" ");
				},
				tp(args) {
					const x = Number(args[0]);
					const y = Number(args[1]);
					if (Number.isNaN(x) || Number.isNaN(y)) return OWOP.chat.local("Please provide valid x and y coordinates."), "";
					OWOP.camera.centerCameraTo(x, y);
					return "";
				},
				tpto(args) {
					const id = args[0];
					const player = OWOP.misc.world.players[id];
					if (player === undefined) return OWOP.chat.local("Player not found."), "";
					return commands.tp([player._x.val / 16, player._y.val / 16]);
				}
			};

			const exec = (cmdObj, args) => {
				const cmd = cmdObj[args.shift()];
				if (typeof cmd === "function") return cmd(args);
				if (typeof cmd === "object") return exec(cmd, args);
				OWOP.chat.local(`Unknown command. Try ${prefix}help or ${prefix}say [your message].`);
				return "";
			};

			const originalSendModifier = OWOP.chat.sendModifier;
			OWOP.chat.sendModifier = (msg, ...args) => {
				if (msg.startsWith(prefix)) {
					const full = msg.slice(prefix.length);
					const args = full.match(/[^\s"']+|"([^"]*)"/g);
					return exec(commands, args);
				}
				return originalSendModifier?.(msg, ...args) ?? msg;
			};
		}

		const proto = {
			serverbound: {
				/**
				 * joinWorld
				 * @param {string} name world name
				 * @returns packet
				 */
				joinWorld(name) {
					const data = new TextEncoder().encode(name);
					const ab = new ArrayBuffer(data.length + 2);
					const dv = new DataView(ab);
					new Uint8Array(ab).set(data, 0);
					dv.setUint16(data.length, 25565, true);
					return ab;
				},
				/**
				 * updatePixel
				 * @param {number} x pixel x
				 * @param {number} y pixel y
				 * @param {number} r red
				 * @param {number} g green
				 * @param {number} b blue
				 * @returns packet
				 */
				updatePixel(x, y, r, g, b) {
					const ab = new ArrayBuffer(11);
					const dv = new DataView(ab);
					dv.setInt32(0, x, true);
					dv.setInt32(4, y, true);
					dv.setUint8(8, r);
					dv.setUint8(9, g);
					dv.setUint8(10, b);
					return ab;
				},
				/**
				 * requestChunk
				 * @param {number} x chunk x
				 * @param {number} y chunk y
				 * @returns packet
				 */
				requestChunk(x, y) {
					const ab = new ArrayBuffer(8);
					const dv = new DataView(ab);
					dv.setInt32(0, x, true);
					dv.setInt32(4, y, true);
					return ab;
				},
				/**
				 * sendUpdates
				 * @param {number} x world x
				 * @param {number} y world y
				 * @param {number} r red
				 * @param {number} g green
				 * @param {number} b blue
				 * @param {number} tool tool
				 * @returns packet
				 */
				sendUpdates(x, y, r, g, b, tool) {
					const ab = new ArrayBuffer(12);
					const dv = new DataView(ab);
					dv.setInt32(0, x, true);
					dv.setInt32(4, y, true);
					dv.setUint8(8, r);
					dv.setUint8(9, g);
					dv.setUint8(10, b);
					dv.setUint8(11, tool);
					return ab;
				}
				// TODO: sendMessage, protectChunk, setChunk, clearChunk
			},
			clientbound: {
				/**
				 * Get function name for packet
				 * @param {ArrayBuffer} ab packet
				 * @returns function name
				 */
				gfn(ab) {
					const dv = new DataView(ab);
					return ["setId", "worldUpdate", "chunkLoad", "teleport", "setRank", "captcha", "setPQuota", "chunkProtected", "maxCount", "donUntil"][dv.getUint8(0)];
				},
				/**
				 * setId
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				setId(ab) {
					const dv = new DataView(ab);
					return {
						id: dv.getUint32(1, true)
					};
				},
				/**
				 * teleport
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				teleport(ab) {
					const dv = new DataView(ab);
					return {
						x: dv.getInt32(1, true),
						y: dv.getInt32(5, true)
					};
				},
				/**
				 * setRank
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				setRank(ab) {
					const dv = new DataView(ab);
					return {
						rank: dv.getUint8(1)
					};
				},
				/**
				 * setPQuota
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				setPQuota(ab) {
					const dv = new DataView(ab);
					return {
						rate: dv.getUint16(1, true),
						per: dv.getUint16(3, true),
						pmult: dv.byteLength >= 6 ? dv.getUint8(5) / 10 : 1
					};
				},
				/**
				 * chunkProtected
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				chunkProtected(ab) {
					const dv = new DataView(ab);
					return {
						cx: dv.getInt32(1, true),
						cy: dv.getInt32(5, true),
						newState: dv.getUint8(9)
					};
				},
				/**
				 * maxCount
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				maxCount(ab) {
					const dv = new DataView(ab);
					return {
						maxCount: dv.getUint16(1, true)
					};
				},
				/**
				 * donUntil
				 * @param {ArrayBuffer} ab packet
				 * @returns data
				 */
				donUntil(ab) {
					const dv = new DataView(ab);
					return {
						donUntilTs: dv.getUint32(5, true) * 2 ** 32 + dv.getUint32(1, true)
					};
				},
				// TODO: worldUpdate, chunkLoad, captcha
			}
		};

		const fromChunkPos = (x, y) => [x * 16, y * 16];
		const toChunkPos = (x, y) => [Math.floor(x / 16), Math.floor(y / 16)];
		const setPixelClient = (x, y, rgb) => OWOP.misc.world.getChunkAt(...toChunkPos(x, y)).update(x, y, rgb);
		const updateChunkClient = (x, y) => OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(x, y));
		const blend = (r1, g1, b1, r2, g2, b2, a) => {
			a /= 255;
			const z = 1 - a;
			return [Math.round(r2 * a + r1 * z), Math.round(g2 * a + g1 * z), Math.round(b2 * a + b1 * z)];
		};

		class Client {
			constructor(url, world) {
				this.ws = new WebSocket(url);
				this.ws.binaryType = "arraybuffer";
				this.chunkPos = [0, 0];
				this.pQuota = [48, 4];
				this.ready = false;
				this.dead = false;
				this.bucketState = [0, Date.now()];
				this.ws.addEventListener("open", () => {
					this.ws.send(proto.serverbound.joinWorld(world));
				});
				this.ws.addEventListener("message", event => {
					if (event.data instanceof ArrayBuffer) {
						const name = proto.clientbound.gfn(event.data);
						if (name === "setId") {
							this.ready = true;
						} else if (name === "setPQuota") {
							const data = proto.clientbound.setPQuota(event.data);
							this.pQuota = [data.rate, data.per];
						}
					}
				});
				((fn) => {
					this.ws.addEventListener("close", fn);
					this.ws.addEventListener("error", fn);
				})(() => {
					this.ready = false;
					this.dead = true;
				});
			}

			get bucket() {
				return Math.min(this.bucketState[0] + this.pQuota[0] / this.pQuota[1] / 1000 * (Date.now() - this.bucketState[1]), this.pQuota[0]);
			}

			set bucket(value) {
				this.bucketState = [value, Date.now()];
			}

			setPixel(x, y, r, g, b) {
				const chunkPos = toChunkPos(x, y);
				if (chunkPos[0] !== this.chunkPos[0] || chunkPos[1] !== this.chunkPos[1]) {
					this.chunkPos = chunkPos;
					this.ws.send(proto.serverbound.sendUpdates(...fromChunkPos(...chunkPos).map(p => p * 16), 0, 0, 0, 0));
				}
				this.ws.send(proto.serverbound.updatePixel(x, y, r, g, b));
				--this.bucket;
			}

			destroy() {
				this.ws.close();
			}
		}

		class ClientPool {
			constructor() {
				/** @type {Client[]} */
				this.clients = [];
				this.index = 0;
				/** @type {{ x: number, y: number, index: number, data: Uint8Array | Uint8ClampedArray }[]} */
				this.chunkedQueue = [];
				OWOP.on(OWOP.events.tick, () => {
					const task = this.chunkedQueue[0];
					if (task === undefined) return;
					const chunkPos = [task.x, task.y];
					const pos = fromChunkPos(...chunkPos);
					for (; task.index < 256; ++task.index) {
						const dx = task.index % 16;
						const dy = Math.floor(task.index / 16);
						const npos = [pos[0] + dx, pos[1] + dy];
						const raw = [task.data[task.index * 4], task.data[task.index * 4 + 1], task.data[task.index * 4 + 2], task.data[task.index * 4 + 3]];
						const pixel = OWOP.misc.world.getPixel(...npos);
						if (pixel === null) break;
						const color = blend(pixel[0], pixel[1], pixel[2], ...raw);
						if (color[0] === pixel[0] && color[1] === pixel[1] && color[2] === pixel[2]) continue;
						const client = pool.client;
						if (client === undefined) break;
						client.setPixel(...npos, ...color);
						OWOP.misc.world.getChunkAt(...chunkPos).update(...npos, OWOP.util.colorUtils.u24_888(...color));
					}
					if (task.index >= 256) this.chunkedQueue.shift();
					OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(...chunkPos));
				});
			}

			/**
			 * Add a client
			 * @param {Client} client Client to be added
			 */
			add(client) {
				this.clients.push(client);
			}

			get client() {
				for (let i = 0; i < this.clients.length; ++i) {
					const client = this.clients[this.index];
					if (client === undefined) return;
					if (client.dead) {
						client.destroy();
						this.clients.splice(this.index, 1);
					} else if (client.ready && client.bucket > 10) return client;
					++this.index;
					this.index %= this.clients.length;
				}
			}

			/**
			 * Queue an image to be drawn
			 * @param {HTMLCanvasElement} canvas Canvas containing the image to draw
			 * @param {number} x 
			 * @param {number} y
			 */
			queueImage(canvas, x, y) {
				const [chunkX, chunkY] = toChunkPos(x, y);
				const chunkAligned = fromChunkPos(chunkX, chunkY);
				const offsetX = x - chunkAligned[0];
				const offsetY = y - chunkAligned[1];
				const chunkWidth = Math.ceil((canvas.width + offsetX) / 16);
				const chunkHeight = Math.ceil((canvas.height + offsetY) / 16);
				const context = canvas.getContext("2d");
				for (let i = 0; i < chunkWidth; ++i) {
					for (let j = 0; j < chunkHeight; ++j) {
						const cx = chunkX + i;
						const cy = chunkY + j;
						const [vx, vy] = fromChunkPos(i, j);
						this.chunkedQueue.push({
							x: cx,
							y: cy,
							index: 0,
							data: context.getImageData(vx - offsetX, vy - offsetY, 16, 16).data
						});
					}
				}
			}
		}

		const pool = new ClientPool();

		const clipboardCanvas = document.createElement("canvas");

		OWOP.windowSys.addWindow(new OWOP.windowSys.class.window("cocos", {}, win => {
			const form = document.createElement("form");
			const connBtn = document.createElement("input");
			connBtn.type = "button";
			connBtn.value = "Connect";
			connBtn.addEventListener("click", () => {
				const data = new FormData(form);
				const url = data.get("url");
				const conns = Number(data.get("conns"));
				for (let i = 0; i < data.get("conns"); ++i) {
					pool.add(new Client(url, OWOP.world.name));
				}
			});
			const dcBtn = document.createElement("input");
			dcBtn.type = "button";
			dcBtn.value = "Disconnect";
			dcBtn.addEventListener("click", () => {
				const data = new FormData(form);
				const conns = Number(data.get("conns"));
				for (let i = 0; i < data.get("conns"); ++i) {
					pool.clients.pop()?.destroy();
				}
			});
			const clipboardInput = document.createElement("input");
			clipboardInput.type = "file";
			clipboardInput.accept = "image/*";
			clipboardInput.addEventListener("change", () => {
				const clipboard = clipboardInput.files[0];
				const url = URL.createObjectURL(clipboard);
				const image = new Image();
				image.src = url;
				image.addEventListener("load", () => {
					clipboardCanvas.width = image.width;
					clipboardCanvas.height = image.height;
					clipboardCanvas.getContext("2d").drawImage(image, 0, 0);
					URL.revokeObjectURL(url);
					clipboardInput.value = null;
				});
			});
			clipboardCanvas.width = 0;
			clipboardCanvas.height = 0;
			clipboardCanvas.style.maxWidth = "200px";
			clipboardCanvas.style.maxHeight = "200px";
			const status = document.createElement("span");
			OWOP.on(OWOP.events.tick, () => {
				status.textContent = `Active: ${pool.clients.filter(c => c.ready).length} | Connections: ${pool.clients.filter(c => !c.dead).length}`;
			});
			form.insertAdjacentHTML("beforeend", `
				<label>
					URL:
					<input type="url" name="url" value="wss://ourworldofpixels.com/" required />
				</label>
				<br />
				<label>
					Connections:
					<input type="number" name="conns" min="1" value="1" required />
				</label>
				<br />
			`);
			form.append(connBtn, dcBtn);
			form.insertAdjacentHTML("beforeend", "<hr />");
			form.append(clipboardInput);
			form.insertAdjacentHTML("beforeend", "<br />");
			form.append(clipboardCanvas);
			form.insertAdjacentHTML("beforeend", "<hr />");
			form.append(status);
			win.container.append(form);
			getForm = () => new FormData(form);
		}));

		OWOP.tools.addToolObject(new OWOP.tools.class("(o) Chunker", OWOP.cursors.erase, OWOP.fx.player.RECT_SELECT_ALIGNED(16), OWOP.RANK.NONE, tool => {
			let chunkPos = [0, 0];
			let color = [0, 0, 0];
			
			const tick = () => {
				const pos = fromChunkPos(...chunkPos);
				const rgb = OWOP.util.colorUtils.u24_888(...color);
				outer: for (let i = 0; i < 16; ++i) {
					for (let j = 0; j < 16; ++j) {
						const npos = [pos[0] + i, pos[1] + j];
						const pixel = OWOP.misc.world.getPixel(...npos);
						if (pixel === null) break outer;
						if (color[0] === pixel[0] && color[1] === pixel[1] && color[2] === pixel[2]) continue;
						const client = pool.client;
						if (client === undefined) break outer;
						client.setPixel(...npos, ...color);
						OWOP.misc.world.getChunkAt(...chunkPos).update(...npos, rgb);
					}
				}
				OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(...chunkPos));
			};

			tool.setEvent("mousedown mousemove", mouse => {
				if (!(mouse.buttons & 0b11)) return;
				chunkPos = toChunkPos(OWOP.mouse.tileX, OWOP.mouse.tileY);
				color = mouse.buttons === 0b10 ? [255, 255, 255] : OWOP.player.selectedColor;
				tool.setEvent("tick", tick);
			});
			tool.setEvent("mouseup deselect", mouse => {
				tool.setEvent("tick", null);
			});
		}));

		OWOP.tools.addToolObject(new OWOP.tools.class("(o) Copy", OWOP.cursors.copy, OWOP.fx.player.NONE, OWOP.RANK.NONE, tool => {
			const drawText = (ctx, str, x, y, centered) => {
				ctx.strokeStyle = "#000000", ctx.fillStyle = "#FFFFFF", ctx.lineWidth = 2.5, ctx.globalAlpha = 0.5;
				if (centered) {
					x -= ctx.measureText(str).width >> 1;
				}
				ctx.strokeText(str, x, y);
				ctx.globalAlpha = 1;
				ctx.fillText(str, x, y);
			}

			tool.setFxRenderer((fx, ctx, time) => {
				if (!fx.extra.isLocalPlayer) return 1;
				const x = fx.extra.player.x;
				const y = fx.extra.player.y;
				const fxx = (Math.floor(x / 16) - OWOP.camera.x) * OWOP.camera.zoom;
				const fxy = (Math.floor(y / 16) - OWOP.camera.y) * OWOP.camera.zoom;
				const oldlinew = ctx.lineWidth;
				ctx.lineWidth = 1;
				if (tool.extra.end) {
					const s = tool.extra.start;
					const e = tool.extra.end;
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
				const s = tool.extra.start;
				const e = tool.extra.end;
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
						const s = tool.extra.start;
						const e = tool.extra.end;
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
			tool.setFxRenderer((fx, ctx, time) => {
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
					pool.queueImage(clipboardCanvas, OWOP.mouse.tileX, OWOP.mouse.tileY);
				} else if (mouse.buttons & 0b10) {
					pool.chunkedQueue = [];
				}
			});
		}));
	});
});
