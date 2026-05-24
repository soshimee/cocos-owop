import { left } from "./utils";

type TupleOf<T, N extends number, R extends unknown[] = []> = R["length"] extends N ? R : TupleOf<T, N, [T, ...R]>;

class PacketWriter {
	private dv: DataView;
	private index = 0;

	public constructor(buffer: ArrayBuffer) {
		this.dv = new DataView(buffer);
	}

	public writeArray(data: Uint8Array) {
		new Uint8Array(this.dv.buffer).set(data, this.index);
		this.index += data.byteLength;
	}

	public writeUint8(...data: number[]) {
		for (const d of data) {
			this.dv.setUint8(this.index++, d);
		}
	}

	public writeUint16LE(...data: number[]) {
		for (const d of data) {
			this.dv.setUint16(this.index, d, true);
			this.index += 2;
		}
	}

	public writeInt32LE(...data: number[]) {
		for (const d of data) {
			this.dv.setInt32(this.index, d, true);
			this.index += 4;
		}
	}

	public done() {
		return this.index >= this.dv.byteLength;
	}
}

class PacketReader {
	private dv: DataView;
	private index = 0;

	public constructor(buffer: ArrayBuffer) {
		this.dv = new DataView(buffer);
	}

	public readArray(length: number) {
		return left(new Uint8Array(this.dv.buffer.slice(this.index, this.index + length)), this.index += length);
	}

	public readUint8<L extends number>(length: L) {
		return Array.from({ length }, () => this.dv.getUint8(this.index++)) as TupleOf<number, L>;
	}

	public readUint16LE<L extends number>(length: L) {
		return Array.from({ length }, () => left(this.dv.getUint16(this.index, true), this.index += 2)) as TupleOf<number, L>;
	}

	public readUint32LE<L extends number>(length: L) {
		return Array.from({ length }, () => left(this.dv.getUint32(this.index, true), this.index += 4)) as TupleOf<number, L>;
	}

	public readInt32LE<L extends number>(length: L) {
		return Array.from({ length }, () => left(this.dv.getInt32(this.index, true), this.index += 4)) as TupleOf<number, L>;
	}

	public readUint64LE<L extends number>(length: L) {
		return Array.from({ length }, () => left(this.dv.getBigUint64(this.index, true), this.index += 8)) as TupleOf<bigint, L>;
	}

	public done() {
		return this.index >= this.dv.byteLength;
	}
}

export abstract class PacketC2S {
	public abstract data: string | ArrayBuffer;
}

export abstract class PacketC2SBinary extends PacketC2S {
	public abstract data: ArrayBuffer;
}

export abstract class PacketC2SString extends PacketC2S {
	public abstract data: string;
}

export abstract class PacketS2C {
	
}

export class PacketC2SJoinWorld extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(name: string) {
		super();
		const data = new TextEncoder().encode(name);
		this.data = new ArrayBuffer(data.length + 2);
		const writer = new PacketWriter(this.data);
		writer.writeArray(data);
		writer.writeUint16LE(25565);
	}
}

export class PacketC2SUpdatePixel extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(x: number, y: number, r: number, g: number, b: number) {
		super();
		this.data = new ArrayBuffer(11);
		const writer = new PacketWriter(this.data);
		writer.writeInt32LE(x, y);
		writer.writeUint8(r, g, b);
	}
}

export class PacketC2SRequestChunk extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(x: number, y: number) {
		super();
		this.data = new ArrayBuffer(8);
		const writer = new PacketWriter(this.data);
		writer.writeInt32LE(x, y);
	}
}

export class PacketC2SSendUpdates extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(x: number, y: number, r: number, g: number, b: number, tool: number) {
		super();
		this.data = new ArrayBuffer(12);
		const writer = new PacketWriter(this.data);
		writer.writeInt32LE(x, y);
		writer.writeUint8(r, g, b, tool);
	}
}

export class PacketC2SProtectChunk extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(x: number, y: number, newState: number) {
		super();
		this.data = new ArrayBuffer(10);
		const writer = new PacketWriter(this.data);
		writer.writeInt32LE(x, y);
		writer.writeUint8(newState);
	}
}

export class PacketC2SClearChunk extends PacketC2SBinary {
	public data: ArrayBuffer;

	constructor(x: number, y: number, r: number, g: number, b: number) {
		super();
		this.data = new ArrayBuffer(13);
		const writer = new PacketWriter(this.data);
		writer.writeInt32LE(x, y);
		writer.writeUint8(r, g, b);
	}
}

export class PacketC2SSendMessage extends PacketC2SString {
	public data: string;

	constructor(message: string) {
		super();
		this.data = message + "\n";
	}
}

// TODO: setChunk

export class PacketS2CSetId extends PacketS2C {
	public id: number;

	public constructor(reader: PacketReader) {
		super();
		[this.id] = reader.readUint32LE(1);
	}
}

export class PacketS2CTeleport extends PacketS2C {
	public x: number;
	public y: number;

	public constructor(reader: PacketReader) {
		super();
		[this.x, this.y] = reader.readInt32LE(2);
	}
}

export class PacketS2CSetRank extends PacketS2C {
	public rank: number;

	public constructor(reader: PacketReader) {
		super();
		[this.rank] = reader.readUint8(1);
	}
}

export class PacketS2CSetPQuota extends PacketS2C {
	public rate: number;
	public per: number;
	public pmult: number;

	public constructor(reader: PacketReader) {
		super();
		[this.rate, this.per] = reader.readUint16LE(2);
		this.pmult = reader.done() ? 1 : reader.readUint8(1)[0] / 10;
	}
}

export class PacketS2CChunkProtected extends PacketS2C {
	public cx: number;
	public cy: number;
	public newState: number;

	public constructor(reader: PacketReader) {
		super();
		[this.cx, this.cy] = reader.readInt32LE(2);
		[this.newState] = reader.readUint8(1);
	}
}

export class PacketS2CMaxCount extends PacketS2C {
	public maxCount: number;

	public constructor(reader: PacketReader) {
		super();
		[this.maxCount] = reader.readUint16LE(1);
	}
}

export class PacketS2CDonUntil extends PacketS2C {
	public donUntilTs: number;

	public constructor(reader: PacketReader) {
		super();
		this.donUntilTs = Number(reader.readUint64LE(1)[0]);
	}
}

// TODO: worldUpdate, chunkLoad, captcha

export const parseS2C = (data: ArrayBuffer) => {
	const reader = new PacketReader(data);
	return {
		c: [PacketS2CSetId, /* PacketS2CWorldUpdate */, /* PacketS2CChunkLoad */, PacketS2CTeleport, PacketS2CSetRank, /* PacketS2CCaptcha */, PacketS2CSetPQuota, PacketS2CChunkProtected, PacketS2CMaxCount, PacketS2CDonUntil][reader.readUint8(1)[0]],
		reader
	};
};
