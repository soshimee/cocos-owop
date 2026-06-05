export class Config {
	public sneaky: boolean;
	public bucketThreshold: number;
	public desyncTimeout: number;
	public follow: string;
	public followColor: boolean;
	public followTool: boolean;
	public followSteps: number;
	public followRadius: number;
	public target: string;
	public targetFollow: boolean;
	public targetChunker: boolean;

	public constructor() {
		const item = localStorage.getItem("cocosconfig");
		const conf = item && JSON.parse(item);
		this.sneaky = conf?.sneaky ?? false;
		this.bucketThreshold = conf?.bucketThreshold ?? 0.5;
		this.desyncTimeout = conf?.desyncTimeout ?? 2000;
		this.follow = conf?.follow ?? "";
		this.followColor = conf?.followColor ?? false;
		this.followTool = conf?.followTool ?? false;
		this.followSteps = conf?.followSteps ?? 40;
		this.followRadius = conf?.followRadius ?? 10;
		this.target = conf?.target ?? "";
		this.targetFollow = conf?.targetFollow ?? false;
		this.targetChunker = conf?.targetChunker ?? false;
	}

	public save() {
		localStorage.setItem("cocosconfig", JSON.stringify(this));
	}
}
