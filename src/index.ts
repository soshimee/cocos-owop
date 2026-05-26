import { ClientPool } from "./clientpool";
import { registerCommands } from "./commands";
import { Config } from "./config";
import { Desync } from "./desync";
import { tickFollow } from "./implfollow";
import { buildWindow, tickGui } from "./implgui";
import { buildTools } from "./impltool";
import { Pos } from "./utils";

export const config = new Config();
export const desync = new Desync();
export const pool = new ClientPool();

buildWindow();
buildTools();
registerCommands();

OWOP.on(OWOP.events.tick, () => {
	tickGui();
	tickFollow();
});

OWOP.on(OWOP.events.net.sec.rank, () => {
	OWOP.showPlayerList(true);
});

OWOP.on(OWOP.events.net.world.tilesUpdated, updates => {
	for (const update of updates) {
		desync.removePixel(new Pos(update.x, update.y));
	}
});
