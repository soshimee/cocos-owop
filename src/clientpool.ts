import { config, desync } from ".";
import { Client, ClientState } from "./client";
import { CHUNK_SIZE, Col, Pos } from "./utils";

export class ClientPool {
	public clients = new Set<Client>();
	public chunkedQueue: { x: number, y: number, index: number, data: Uint8Array }[] = [];

	public constructor() {
		OWOP.on(OWOP.events.tick, () => {
			const task = this.chunkedQueue[0];
			if (task === undefined) return;
			const pos = Pos.fromChunkPos(task.x, task.y);
			const chunk = OWOP.misc.world.getChunkAt(task.x, task.y);
			for (; task.index < 256; ++task.index) {
				const dx = task.index % 16;
				const dy = Math.floor(task.index / 16);
				const newPos = new Pos(pos.x + dx, pos.y + dy);
				const newCol = new Col(task.data[task.index * 4], task.data[task.index * 4 + 1], task.data[task.index * 4 + 2], task.data[task.index * 4 + 3]);
				const pixel = OWOP.misc.world.getPixel(newPos.x, newPos.y);
				if (pixel === null) break;
				const bgCol = new Col(pixel[0], pixel[1], pixel[2]);
				const blendedCol = newCol.blendOn(bgCol);
				if (bgCol.equals(blendedCol)) continue;
				const client = this.client;
				if (client === undefined) break;
				client.setPixel(newPos, blendedCol);
				chunk.update(newPos.x, newPos.y, blendedCol.toABGR());
				desync.addPixel(newPos, bgCol);
			}
			if (task.index >= 256) this.chunkedQueue.shift();
			OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(task.x, task.y));
		});
	}

	public add(client: Client) {
		this.clients.add(client);
	}

	public get client() {
		for (const client of this.clients.values()) {
			if (client.state === ClientState.Disconnected) client.destroy(), this.clients.delete(client);
			if (client.state === ClientState.Ready && client.bucket.value / client.bucket.rate > config.bucketThreshold) return client;
		}
	}

	public queueImage(canvas: HTMLCanvasElement, pos: Pos) {
		const context = canvas.getContext("2d");
		if (context === null) return;
		const [chunkX, chunkY] = [pos.chunkX, pos.chunkY];
		const chunkAligned = Pos.fromChunkPos(chunkX, chunkY);
		const offset = new Pos(pos.x - chunkAligned.x, pos.y - chunkAligned.y);
		const chunkWidth = Math.ceil((canvas.width + offset.x) / CHUNK_SIZE);
		const chunkHeight = Math.ceil((canvas.height + offset.y) / CHUNK_SIZE);
		for (let i = 0; i < chunkWidth; ++i) {
			for (let j = 0; j < chunkHeight; ++j) {
				const cx = chunkX + i;
				const cy = chunkY + j;
				const vPos = Pos.fromChunkPos(i, j);
				this.chunkedQueue.push({
					x: cx,
					y: cy,
					index: 0,
					data: new Uint8Array(context.getImageData(vPos.x - offset.x, vPos.y - offset.y, 16, 16).data)
				});
			}
		}
	}
}
