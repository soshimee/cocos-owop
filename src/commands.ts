import { Pos } from "./utils";

type CmdObjInner<T> = T | Record<string, T>;
type CmdObj = Record<string, CmdObjInner<(args: string[]) => string>>;

export const registerCommands = () => {
	const prefix = ".";

	const commands = {
		help() {
			OWOP.chat.local("Available commands: help, say, tp, tpto");
			return "";
		},
		say(args: string[]) {
			return args.join(" ");
		},
		tp(args: string[]) {
			const x = Number(args[0]);
			const y = Number(args[1]);
			if (Number.isNaN(x) || Number.isNaN(y)) return OWOP.chat.local("Please provide valid x and y coordinates."), "";
			OWOP.camera.centerCameraTo(x, y);
			return "";
		},
		tpto(args: string[]) {
			const id = args[0];
			const player = OWOP.misc.world.players[id];
			if (player === undefined) return OWOP.chat.local("Player not found."), "";
			const pos = Pos.fromWorldPos(player._x.val, player._y.val);
			return commands.tp([String(pos.x), String(pos.y)]);
		}
	};

	const exec = (cmdObj: CmdObj, args: string[]) => {
		const cmd = cmdObj[args.shift() ?? ""];
		if (typeof cmd === "function") return cmd(args);
		if (typeof cmd === "object") return exec(cmd, args);
		OWOP.chat.local(`Unknown command. Try ${prefix}help or ${prefix}say [your message].`);
		return "";
	};

	const originalSendModifier = OWOP.chat.sendModifier;
	OWOP.chat.sendModifier = (msg, ...args) => {
		if (msg.startsWith(prefix)) {
			const full = msg.slice(prefix.length);
			const args = full.match(/[^\s"']+|"([^"]*)"/g) ?? [];
			return exec(commands, args);
		}
		return originalSendModifier?.(msg, ...args) ?? msg;
	};
};
