import { config } from ".";
import { Col, Pos } from "./utils";

export class Desync {
	private map = new Map<string, ReturnType<typeof setTimeout>>();
	
	public addPixel(pos: Pos, prevCol: Col) {
		if (config.desyncTimeout < 1) return;
		this.removePixel(pos);
		const [cx, cy] = [pos.chunkX, pos.chunkY];
		this.map.set(`${pos.x},${pos.y}`, setTimeout(() => {
			OWOP.misc.world.getChunkAt(cx, cy).update(pos.x, pos.y, prevCol.toABGR());
			OWOP.emit(OWOP.events.renderer.updateChunk, OWOP.misc.world.getChunkAt(cx, cy));
		}, config.desyncTimeout));
	}

	public removePixel(pos: Pos) {
		const k = `${pos.x},${pos.y}`;
		const t = this.map.get(k);
		if (t === undefined) return;
		clearTimeout(t);
		this.map.delete(k);
	}
}
