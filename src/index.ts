import { ClientPool } from "./clientpool";
import { Config } from "./config";
import { setupFollow } from "./implfollow";
import { buildWindow } from "./implgui";
import { buildTools } from "./impltool";

export const config = new Config();
export const pool = new ClientPool();

buildWindow();
buildTools();
setupFollow();

OWOP.on(OWOP.events.net.sec.rank, () => {
	OWOP.showPlayerList(true);
});
