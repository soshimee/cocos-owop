import { GUIWindow } from "../types/OWOP";

export class OWOPWindow {
	protected window: GUIWindow;

	public constructor(title: string, closeable = false) {
		this.window = new OWOP.windowSys.class.window(title, { closeable }, () => {});
	}

	public getContainer() {
		return this.window.container;
	}

	public open() {
		OWOP.windowSys.addWindow(this.window);
	}

	public close() {
		OWOP.windowSys.delWindow(this.window);
	}
}

export class TabbedWindow extends OWOPWindow {
	private tabs = new Map<string, { id: string, name: string, button: HTMLButtonElement, container: HTMLDivElement }>();
	private tabsContainer = document.createElement("div");
	private contentContainer = document.createElement("div");

	public constructor(title: string, closeable?: boolean) {
		super(title, closeable);
		this.window.container.appendChild(this.tabsContainer);
		this.window.container.appendChild(this.contentContainer);
	}

	public setTab(id: string) {
		const tab = this.tabs.get(id);
		if (tab === undefined) return;
		for (const element of this.contentContainer.children) {
			if (!(element instanceof HTMLElement)) return;
			element.style.display = "none";
		}
		tab.container.style.display = "block";
	}

	public addTab(id: string, name: string) {
		const container = document.createElement("div");
		this.contentContainer.appendChild(container);
		const button = document.createElement("button");
		button.textContent = name;
		button.addEventListener("click", () => this.setTab(id));
		this.tabsContainer.appendChild(button);
		this.tabs.set(id, { id, name, button, container });
	}

	public getTabContainer(id: string) {
		return this.tabs.get(id)?.container;
	}
}
