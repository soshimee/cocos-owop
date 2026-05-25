import { config, pool } from ".";
import { Follow, FollowAtom, FollowCircle } from "./follow";

export const setupFollow = () => {
	let follow: Follow | null = null;

	OWOP.on(OWOP.events.tick, () => {
		if (config.follow === "circle") {
			if (!(follow instanceof FollowCircle) || !follow.isApplicable(pool) || follow.steps !== config.followSteps || follow.radius !== config.followRadius) follow = new FollowCircle(config.followRadius, config.followSteps, pool);
			follow.follow();
		} else if (config.follow === "atom") {
			if (!(follow instanceof FollowAtom) || !follow.isApplicable(pool) || follow.steps !== config.followSteps || follow.radius !== config.followRadius) follow = new FollowAtom(config.followRadius, config.followSteps, pool);
			follow.follow();
		} else {
			follow = null;
		}
	});
};
