import { config, pool } from ".";
import { CHUNK_SIZE, Col, Pos } from "./utils";

export const tickTarget = () => {
	if (config.target === "") return;
	if (!config.targetFollow) return;
	const player = OWOP.misc.world.players[config.target];
	if (player === undefined) return;
	const pos = Pos.fromWorldPos(player._x.val, player._y.val);
	OWOP.camera.centerCameraTo(pos.x, pos.y);
};

export const tilesUpdateTarget = (updates: { x: number; y: number; rgb: number; id: number; }[]) => {
	if (config.target === "") return;
	if (!config.targetChunker) return;
	for (const update of updates) {
		if (String(update.id) !== config.target) continue;
		const pos = new Pos(update.x, update.y);
		const col = Col.fromBGR(update.rgb);
		pool.chunkedQueue.push({
			x: pos.chunkX,
			y: pos.chunkY,
			index: 0,
			data: new Uint8Array(new Uint32Array(CHUNK_SIZE ** 2).fill(col.toABGR()).buffer)
		});
	}
};
