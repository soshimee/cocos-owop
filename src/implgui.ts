import { config, pool } from ".";
import { Client, ClientState } from "./client";
import { TabbedWindow } from "./gui";

export const clipboardCanvas = document.createElement("canvas");

export let tickGui = () => {};

const buildWindowConnTab = (container: HTMLDivElement, win: TabbedWindow) => {
	const headerDiv = document.createElement("div");
	const urlInput = document.createElement("input");
	urlInput.type = "url";
	urlInput.value = "wss://ourworldofpixels.com";
	const connsInput = document.createElement("input");
	connsInput.style.width = "50px";
	connsInput.type = "number";
	connsInput.min = "1";
	connsInput.value = "1";
	const connBtn = document.createElement("button");
	connBtn.textContent = "+";
	headerDiv.append(urlInput, connsInput, connBtn);
	const connsTableDiv = document.createElement("div");
	connsTableDiv.style.height = "250px";
	connsTableDiv.style.overflowY = "scroll";
	const connsTable = document.createElement("table");
	const thead = document.createElement("thead");
	thead.style.top = "0";
	const tr = document.createElement("tr");
	const columns = Array.from({ length: 5 }, () => document.createElement("th"));
	const selectAllInput = document.createElement("input");
	selectAllInput.type = "checkbox";
	columns[0].append(selectAllInput);
	columns[0].style.width = "15px";
	columns[1].textContent = "?";
	columns[1].style.width = "15px";
	columns[2].textContent = "id";
	columns[2].style.width = "30px";
	columns[3].textContent = "x";
	columns[3].style.width = "70px";
	columns[4].textContent = "y";
	columns[4].style.width = "70px";
	tr.append(...columns);
	thead.append(tr);
	const tbody = document.createElement("tbody");
	connsTable.append(thead, tbody);
	connsTableDiv.append(connsTable);
	const footerDiv = document.createElement("div");
	const dcBtn = document.createElement("button");
	dcBtn.textContent = "Disconnect";
	footerDiv.append(dcBtn);
	const statusDiv = document.createElement("div");
	container.append(headerDiv, connsTableDiv, footerDiv, statusDiv);
	connBtn.addEventListener("click", () => {
		const url = urlInput.value;
		const conns = Number(connsInput.value);
		for (let i = 0; i < conns; ++i) {
			pool.add(new Client(url, OWOP.world.name));
		}
	});
	const rowMap = new Map<Client, { row: HTMLTableRowElement, columns: HTMLTableCellElement[], checkbox: HTMLInputElement }>();
	selectAllInput.addEventListener("change", () => {
		for (const row of rowMap.values()) {
			row.checkbox.checked = selectAllInput.checked;
		}
	});
	dcBtn.addEventListener("click", () => {
		for (const [client, row] of rowMap.entries()) {
			if (!row.checkbox.checked) continue;
			client.destroy();
			pool.clients.delete(client);
		}
	});
	tickGui = () => {
		if (win.tab !== "conn") return;
		const clients = [...pool.clients];
		statusDiv.textContent = `Active: ${clients.filter(c => c.state === ClientState.Ready).length} | Connections: ${clients.filter(c => c.state !== ClientState.Disconnected).length}`;
		for (const [client, { row, columns }] of rowMap.entries()) {
			if (!pool.clients.has(client)) {
				row.remove();
				rowMap.delete(client);
				continue;
			}
			columns[1].textContent = (() => {
				switch (client.state) {
					case ClientState.Connecting: return "🌐";
					case ClientState.Joining: return "⏳";
					case ClientState.Ready: return "✅️";
					case ClientState.Disconnected: return "❌";
				}
			})();
			columns[2].textContent = client.id ? String(client.id) : "-";
			columns[3].textContent = client.pos.x.toFixed(2);
			columns[4].textContent = client.pos.y.toFixed(2);
		}
		if (pool.clients.size > rowMap.size) {
			for (const client of pool.clients.values()) {
				if (rowMap.has(client)) continue;
				const tr = document.createElement("tr");
				const columns = Array.from({ length: 5 }, () => document.createElement("td"));
				const selectInput = document.createElement("input");
				selectInput.type = "checkbox";
				selectInput.checked = selectAllInput.checked;
				columns[0].append(selectInput);
				tr.append(...columns);
				tbody.append(tr);
				const row = { row: tr, columns, checkbox: selectInput };
				rowMap.set(client, row);
				selectInput.addEventListener("change", () => {
					selectAllInput.checked = [...rowMap.values()].every(row => row.checkbox.checked);
				});
			}
		}
	};
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
	win.tab = "conn";
	buildWindowConnTab(win.getTabContainer("conn")!, win);
	buildWindowClipTab(win.getTabContainer("clip")!);
	buildWindowConfTab(win.getTabContainer("conf")!);
	win.open();
};
