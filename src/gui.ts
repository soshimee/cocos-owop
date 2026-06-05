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
	private currentTab = "";
	private tabs = new Map<string, { id: string, name: string, button: HTMLButtonElement, container: HTMLDivElement }>();
	private tabsContainer = document.createElement("div");
	private contentContainer = document.createElement("div");

	public constructor(title: string, closeable?: boolean) {
		super(title, closeable);
		this.window.container.appendChild(this.tabsContainer);
		this.window.container.appendChild(this.contentContainer);
	}

	public get tab() {
		return this.currentTab;
	}

	public set tab(id: string) {
		const tab = this.tabs.get(id);
		if (tab === undefined) return;
		for (const element of this.contentContainer.children) {
			if (!(element instanceof HTMLElement)) return;
			element.style.display = "none";
		}
		tab.container.style.display = "block";
		this.currentTab = tab.id;
	}

	public addTab(id: string, name: string) {
		const container = document.createElement("div");
		this.contentContainer.appendChild(container);
		const button = document.createElement("button");
		button.textContent = name;
		button.addEventListener("click", () => this.tab = id);
		this.tabsContainer.appendChild(button);
		this.tabs.set(id, { id, name, button, container });
	}

	public getTabContainer(id: string) {
		return this.tabs.get(id)?.container;
	}
}

abstract class ConfigInput {
	protected onChange: (value: any) => void;

	public constructor(onChange: (value: any) => void) {
		this.onChange = onChange;
	}

	public abstract get element(): Element;
}

abstract class ConfigInputInput extends ConfigInput {
	protected label: HTMLLabelElement;
	protected input: HTMLInputElement;

	public constructor(label: string, onChange: (value: any) => void) {
		super(onChange);
		this.label = document.createElement("label");
		this.input = document.createElement("input");
		this.label.append(document.createTextNode(label + " "), this.input);
	}

	public get element() {
		const div = document.createElement("div");
		div.append(this.label);
		return div;
	}
}

export class ConfigInputSelect extends ConfigInput {
	protected label: HTMLLabelElement;
	protected select: HTMLSelectElement;

	public constructor(label: string, value: string, options: { text: string, value: string }[], onChange: (value: string) => void) {
		super(onChange);
		this.label = document.createElement("label");
		this.select = document.createElement("select");
		for (const option of options) {
			const optionEl = document.createElement("option");
			optionEl.textContent = option.text;
			optionEl.value = option.value;
			this.select.append(optionEl);
		}
		this.select.value = value;
		this.label.append(document.createTextNode(label + " "), this.select);
		this.select.addEventListener("change", () => this.onChange(this.select.value));
	}

	public get element() {
		const div = document.createElement("div");
		div.append(this.label);
		return div;
	}
}

export class ConfigInputText extends ConfigInputInput {
	public constructor(label: string, value: string, onChange: (value: string) => void) {
		super(label, onChange);
		this.input.type = "text";
		this.input.value = value;
		this.input.addEventListener("change", () => this.onChange(this.input.value));
	}
}

export class ConfigInputNumber extends ConfigInputInput {
	public constructor(label: string, value: number, options: { min?: number, max?: number, step?: number }, onChange: (value: number) => void) {
		super(label, onChange);
		this.input.type = "number";
		this.input.min = String(options.min);
		this.input.max = String(options.max);
		this.input.step = String(options.step);
		this.input.value = String(value);
		this.input.addEventListener("change", () => this.onChange(Number(this.input.value)));
	}
}

export class ConfigInputCheckbox extends ConfigInputInput {
	public constructor(label: string, value: boolean, onChange: (value: boolean) => void) {
		super(label, onChange);
		this.input.type = "checkbox";
		this.input.checked = value;
		this.input.addEventListener("change", () => this.onChange(this.input.checked));
	}
}
