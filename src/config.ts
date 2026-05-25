export class Config {
	public sneaky: boolean;
	public follow: string;
	public followSteps: number;
	public followRadius: number;

	public constructor() {
		const item = localStorage.getItem("cocosconfig");
		const conf = item && JSON.parse(item);
		this.sneaky = conf?.sneaky ?? false;
		this.follow = conf?.follow ?? "";
		this.followSteps = conf?.followSteps ?? 40;
		this.followRadius = conf?.followRadius ?? 10;
	}

	public save() {
		localStorage.setItem("cocosconfig", JSON.stringify(this));
	}
}
