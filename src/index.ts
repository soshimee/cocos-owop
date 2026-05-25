import { ClientPool } from "./clientpool";
import { Config } from "./config";
import { tickFollow } from "./implfollow";
import { buildWindow, tickGui } from "./implgui";
import { buildTools } from "./impltool";

export const config = new Config();
export const pool = new ClientPool();

buildWindow();
buildTools();

OWOP.on(OWOP.events.tick, () => {
	tickGui();
	tickFollow();
});

OWOP.on(OWOP.events.net.sec.rank, () => {
	OWOP.showPlayerList(true);
});
