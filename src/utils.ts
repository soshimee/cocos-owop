export const CHUNK_SIZE = 16;
export const WORLD_POS_MULT = 16;

export function left<T>(left: T, ..._: unknown[]) {
	return left;
}

export class Pos {
	public x: number;
	public y: number;

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public static fromWorldPos(worldX: number, worldY: number) {
		return new this(worldX / WORLD_POS_MULT, worldY / WORLD_POS_MULT);
	}

	public static fromChunkPos(chunkX: number, chunkY: number) {
		return new this(chunkX * CHUNK_SIZE, chunkY * CHUNK_SIZE);
	}

	public static chunkAligned(x: number, y: number) {
		return this.fromChunkPos(Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE));
	}

	public get worldX() {
		return this.x * WORLD_POS_MULT;
	}

	public get worldY() {
		return this.y * WORLD_POS_MULT;
	}

	public set worldX(worldX: number) {
		this.x = worldX / WORLD_POS_MULT;
	}

	public set worldY(worldY: number) {
		this.y = worldY / WORLD_POS_MULT;
	}

	public get chunkX() {
		return this.x / CHUNK_SIZE;
	}

	public get chunkY() {
		return this.y / CHUNK_SIZE;
	}

	public set chunkX(chunkX: number) {
		this.x = chunkX * CHUNK_SIZE;
	}

	public set chunkY(chunkY: number) {
		this.y = chunkY * CHUNK_SIZE;
	}

	public get chunkXFloor() {
		return Math.floor(this.chunkX);
	}

	public get chunkYFloor() {
		return Math.floor(this.chunkY);
	}

	public add(pos: Pos) {
		return new Pos(this.x + pos.x, this.y + pos.y);
	}

	public equals(pos: Pos) {
		return this.x === pos.x && this.y === pos.y;
	}
}

export class Col {
	public r: number;
	public g: number;
	public b: number;

	public constructor(r: number, g: number, b: number) {
		this.r = r;
		this.g = g;
		this.b = b;
	}

	public static fromArray(rgb: [number, number, number]) {
		return new this(rgb[0], rgb[1], rgb[2]);
	}

	public static fromInt(rgb: number) {
		return new this(rgb & 0xFF, rgb >> 8 & 0xFF, rgb >> 16 & 0xFF);
	}

	public equals(col: Col) {
		return this.r === col.r && this.g === col.g && this.b === col.b;
	}

	public toInt() {
		return this.b << 16 | this.g << 8 | this.r;
	}
}

export class ColAlpha extends Col {
	public a: number;

	public constructor(r: number, g: number, b: number, a: number) {
		super(r, g, b);
		this.a = a;
	}

	public blendOn(bg: Col) {
		const a = this.a / 255;
		const z = 1 - a;
		return new Col(Math.round(this.r * a + bg.r * z), Math.round(this.g * a + bg.g * z), Math.round(this.b * a + bg.b * z));
	}

	public equals(col: ColAlpha) {
		return this.r === col.r && this.g === col.g && this.b === col.b && this.a === col.a;
	}
}

export class Bucket {
	public rate: number;
	public per: number;
	private lastValue: number;
	private lastDate: number;

	constructor(rate: number, per: number) {
		this.rate = rate;
		this.per = per;
		this.lastValue = 0;
		this.lastDate = Date.now();
	}

	get value() {
		return Math.min(this.lastValue + this.rate / this.per / 1000 * (Date.now() - this.lastDate), this.rate);
	}

	set value(value: number) {
		this.lastValue = value;
		this.lastDate = Date.now();
	}
}
