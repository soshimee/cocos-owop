import { config, pool } from ".";
import { Client, ClientState } from "./client";
import { OWOPWindow, TabbedWindow } from "./gui";

export const clipboardCanvas = document.createElement("canvas");

const buildWindowConnTab = (container: HTMLDivElement) => {
	const urlLabel = document.createElement("label");
	urlLabel.style.display = "block";
	const urlText = document.createTextNode("URL ");
	const urlInput = document.createElement("input");
	urlInput.type = "url";
	urlInput.value = "wss://ourworldofpixels.com";
	urlLabel.append(urlText, urlInput);
	const connsLabel = document.createElement("label");
	connsLabel.style.display = "block";
	const connsText = document.createTextNode("Connections ");
	const connsInput = document.createElement("input");
	connsInput.type = "number";
	connsInput.min = "1";
	connsInput.value = "1";
	connsLabel.append(connsText, connsInput);
	const btnsDiv = document.createElement("div");
	const connBtn = document.createElement("button");
	connBtn.textContent = "Connect";
	const dcBtn = document.createElement("button");
	dcBtn.textContent = "Disconnect";
	btnsDiv.append(connBtn, dcBtn);
	const statusDiv = document.createElement("div");
	container.append(urlLabel, connsLabel, btnsDiv, statusDiv);
	connBtn.addEventListener("click", () => {
		const url = urlInput.value;
		const conns = Number(connsInput.value);
		for (let i = 0; i < conns; ++i) {
			pool.add(new Client(url, OWOP.world.name));
		}
	});
	dcBtn.addEventListener("click", () => {
		const conns = Number(connsInput.value);
		const it = pool.clients.values();
		for (let i = 0; i < conns; ++i) {
			const next = it.next();
			if (next.done) break;
			const client = next.value;
			client.destroy();
			pool.clients.delete(client);
		}
	});
	OWOP.on(OWOP.events.tick, () => {
		statusDiv.textContent = `Active: ${[...pool.clients].filter(c => c.state === ClientState.Ready).length} | Connections: ${[...pool.clients].filter(c => c.state !== ClientState.Disconnected).length}`;
	});
};

const buildWindowClipTab = (container: HTMLDivElement) => {
	const clipboardInput = document.createElement("input");
	clipboardInput.type = "file";
	clipboardInput.accept = "image/*";
	clipboardInput.addEventListener("change", () => {
		if (clipboardInput.files === null) return;
		const context = clipboardCanvas.getContext("2d");
		if (context === null) return;
		const clipboard = clipboardInput.files[0];
		const url = URL.createObjectURL(clipboard);
		const image = new Image();
		image.src = url;
		image.addEventListener("load", () => {
			clipboardCanvas.width = image.width;
			clipboardCanvas.height = image.height;
			context.drawImage(image, 0, 0);
			URL.revokeObjectURL(url);
			clipboardInput.value = "";
		});
	});
	clipboardCanvas.width = 1;
	clipboardCanvas.height = 1;
	clipboardCanvas.style.display = "block";
	clipboardCanvas.style.maxWidth = "200px";
	clipboardCanvas.style.maxHeight = "200px";
	container.append(clipboardInput, clipboardCanvas);
};

const buildWindowConfTab = (container: HTMLDivElement) => {
	const sneakyLabel = document.createElement("label");
	sneakyLabel.style.display = "block";
	const sneakyText = document.createTextNode("Sneaky ");
	const sneakyInput = document.createElement("input");
	sneakyInput.type = "checkbox";
	sneakyInput.checked = config.sneaky;
	sneakyLabel.append(sneakyText, sneakyInput);
	const followLabel = document.createElement("label");
	followLabel.style.display = "block";
	const followText = document.createTextNode("Follow ");
	const followSelect = document.createElement("select");
	const followSelectOptions = Array.from({ length: 3 }, () => document.createElement("option"));
	followSelectOptions[0].textContent = "None";
	followSelectOptions[0].value = "";
	followSelectOptions[1].textContent = "Circle";
	followSelectOptions[1].value = "circle";
	followSelectOptions[2].textContent = "Atom";
	followSelectOptions[2].value = "atom";
	followSelect.append(...followSelectOptions);
	followSelect.value = config.follow;
	followLabel.append(followText, followSelect);
	const followStepsLabel = document.createElement("label");
	followStepsLabel.style.display = "block";
	const followStepsText = document.createTextNode("Follow steps ");
	const followStepsInput = document.createElement("input");
	followStepsInput.type = "number";
	followStepsInput.min = "0";
	followStepsInput.value = String(config.followSteps);
	followStepsLabel.append(followStepsText, followStepsInput);
	const followRadiusLabel = document.createElement("label");
	followRadiusLabel.style.display = "block";
	const followRadiusText = document.createTextNode("Follow radius ");
	const followRadiusInput = document.createElement("input");
	followRadiusInput.type = "number";
	followRadiusInput.min = "0";
	followRadiusInput.value = String(config.followRadius);
	followRadiusLabel.append(followRadiusText, followRadiusInput);
	const btnsDiv = document.createElement("div");
	const saveBtn = document.createElement("button");
	saveBtn.textContent = "Save";
	btnsDiv.append(saveBtn);
	container.append(sneakyLabel, followLabel, followStepsLabel, followRadiusLabel, btnsDiv);
	sneakyInput.addEventListener("change", () => {
		config.sneaky = sneakyInput.checked;
	});
	followSelect.addEventListener("change", () => {
		config.follow = followSelect.value;
	});
	followStepsInput.addEventListener("change", () => {
		config.followSteps = Number(followStepsInput.value);
	});
	followRadiusInput.addEventListener("change", () => {
		config.followRadius = Number(followRadiusInput.value);
	});
	saveBtn.addEventListener("click", () => {
		config.save();
	});
};

export const buildWindow = () => {
	const win = new TabbedWindow("cocos");
	win.getContainer().style.width = "300px";
	win.addTab("conn", "Connections");
	win.addTab("clip", "Clipboard");
	win.addTab("conf", "Options");
	win.setTab("conn");
	buildWindowConnTab(win.getTabContainer("conn")!);
	buildWindowClipTab(win.getTabContainer("clip")!);
	buildWindowConfTab(win.getTabContainer("conf")!);
	win.open();
};
