import { config } from ".";
import { Client, ClientState } from "./client";
import { ClientPool } from "./clientpool";
import { Pos } from "./utils";

export abstract class Follow {
	private _radius: number;
	private _steps: number;
	protected abstract clients: Map<Client, Pos[]>;
	protected step = 0;

	public constructor(radius: number, steps: number) {
		this._radius = radius;
		this._steps = steps;
	}

	public follow() {
		++this.step;
		this.step %= this._steps;
		const pos = Pos.fromWorldPos(OWOP.mouse.worldX, OWOP.mouse.worldY);
		for (const [client, ps] of this.clients.entries()) {
			client.move(pos.add(ps[this.step]));
		}
	}

	public isApplicable(pool: ClientPool) {
		const clients = [...pool.clients].filter(client => client.state === ClientState.Ready);
		if (clients.length !== this.clients.size) return false;
		if (!clients.every(client => this.clients.has(client))) return false;
		return true;
	}

	get radius() {
		return this._radius;
	}

	get steps() {
		return this._steps;
	}
}

export class FollowCircle extends Follow {
	protected clients: Map<Client, Pos[]>;

	public constructor(radius: number, steps: number, pool: ClientPool) {
		super(radius, steps);
		this.clients = new Map();
		const clients = [...pool.clients].filter(client => client.state === ClientState.Ready);
		const r = this.radius;
		const tau = Math.PI * 2;
		const diffClient = tau / clients.length;
		const diffStep = tau / this.steps;
		for (let i = 0; i < clients.length; ++i) {
			const ps: Pos[] = [];
			this.clients.set(clients[i], ps);
			for (let j = 0; j < this.steps; ++j) {
				const rad = diffClient * i + diffStep * j;
				const x = r * Math.cos(rad);
				const y = r * Math.sin(rad);
				ps.push(new Pos(x, y));
			}
		}
	}
}

export class FollowAtom extends Follow {
	protected clients: Map<Client, Pos[]>;

	public constructor(radius: number, steps: number, pool: ClientPool) {
		super(radius, steps);
		this.clients = new Map();
		const clients = [...pool.clients].filter(client => client.state === ClientState.Ready);
		const tau = Math.PI * 2;
		const middle = clients.length / 2
		const clients1 = clients.slice(middle);
		const clients2 = clients.slice(0, middle);
		const rx = this.radius * 0.6;
		const ry = this.radius * 1.4;
		const diffClient1 = tau / clients1.length;
		const diffClient2 = tau / clients2.length;
		const theta1 = Math.PI / 4;
		const theta2 = -Math.PI / 4;
		const sinTheta1 = Math.sin(theta1);
		const cosTheta1 = Math.cos(theta1);
		const sinTheta2 = Math.sin(theta2);
		const cosTheta2 = Math.cos(theta2);
		const diffStep = tau / this.steps;
		for (let i = 0; i < clients1.length; ++i) {
			const ps: Pos[] = [];
			this.clients.set(clients1[i], ps);
			for (let j = 0; j < this.steps; ++j) {
				const rad = diffClient1 * i + diffStep * j;
				const x = rx * Math.cos(rad) * cosTheta1 - ry * Math.sin(rad) * sinTheta1;
				const y = rx * Math.cos(rad) * sinTheta1 + ry * Math.sin(rad) * cosTheta1;
				ps.push(new Pos(x, y));
			}
		}
		for (let i = 0; i < clients2.length; ++i) {
			const ps: Pos[] = [];
			this.clients.set(clients2[i], ps);
			for (let j = 0; j < this.steps; ++j) {
				const rad = diffClient2 * i + diffStep * j;
				const x = rx * Math.cos(rad) * cosTheta2 - ry * Math.sin(rad) * sinTheta2;
				const y = rx * Math.cos(rad) * sinTheta2 + ry * Math.sin(rad) * cosTheta2;
				ps.push(new Pos(x, y));
			}
		}
	}
}
