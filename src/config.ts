class Config {
	public sneaky: boolean;

	public constructor() {
		const item = localStorage.getItem("cocosconfig");
		const conf = item && JSON.parse(item);
		this.sneaky = conf?.sneaky ?? false;
	}

	public save() {
		localStorage.setItem("cocosconfig", JSON.stringify(this));
	}
}

export const config = new Config();
