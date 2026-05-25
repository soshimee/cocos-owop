import { config } from ".";
import { PacketC2S, PacketC2SJoinWorld, PacketC2SSendUpdates, PacketC2SUpdatePixel, PacketS2CSetId, PacketS2CSetPQuota, parseS2C } from "./proto";
import { Bucket, Col, Pos } from "./utils";

const WebSocket = OWOP.global.AnnoyingAPI.ws;

export enum ClientState {
	Connecting,
	Joining,
	Ready,
	Disconnected
}

export class Client {
	public ws: WebSocket;
	public pos = new Pos(0, 0);
	public bucket = new Bucket(0, 0);
	public state = ClientState.Connecting;

	public constructor(url: string, world: string) {
		this.ws = new WebSocket(url);
		this.ws.binaryType = "arraybuffer";
		
		this.ws.addEventListener("open", () => {
			this.send(new PacketC2SJoinWorld(world));
			this.state = ClientState.Joining;
		});

		this.ws.addEventListener("message", event => {
			if (event.data instanceof ArrayBuffer) {
				const { c, reader } = parseS2C(event.data);
				if (c === undefined) return;
				if (c === PacketS2CSetId) {
					this.state = ClientState.Ready;
				} else if (c === PacketS2CSetPQuota) {
					const packet = new c(reader);
					this.bucket.per = packet.per;
					this.bucket.rate = packet.rate;
					this.bucket.value = 0;
				}
			}
		});

		(fn => {
			this.ws.addEventListener("close", fn);
			this.ws.addEventListener("error", fn);
		})(() => {
			this.state = ClientState.Disconnected;
		});
	}

	public move(pos: Pos) {
		this.pos = pos;
		this.send(new PacketC2SSendUpdates(this.pos.worldX, this.pos.worldY, 0, 0, 0, 0));
	}

	public setPixel(pos: Pos, col: Col) {
		const oldPos = this.pos;
		const newPos = pos;
		const chunkSqDist = (newPos.chunkX - oldPos.chunkX) ** 2 + (newPos.chunkY - oldPos.chunkY) ** 2;
		const shouldMove = chunkSqDist >= 4 ** 2;
		if (shouldMove) this.move(newPos);
		this.send(new PacketC2SUpdatePixel(pos.x, pos.y, col.r, col.g, col.b));
		if (shouldMove && config.sneaky) this.move(oldPos);
		--this.bucket.value;
	}

	public send(packet: PacketC2S) {
		this.ws.send(packet.data);
	}

	public destroy() {
		this.ws.close();
	}
}
