// util/misc.js
type KeyCode = { A: number; B: number; C: number; D: number; E: number; F: number; G: number; H: number; I: number; J: number; K: number; L: number; M: number; N: number; O: number; P: number; Q: number; R: number; S: number; T: number; U: number; V: number; W: number; X: number; Y: number; Z: number; ZERO: number; ONE: number; TWO: number; THREE: number; FOUR: number; FIVE: number; SIX: number; SEVEN: number; EIGHT: number; NINE: number; BACKTICK: number; TILDE: number; MINUS: number; UNDERSCORE: number; EQUALS: number; PLUS: number; L_BRACKET: number; L_CURLY: number; R_BRACKET: number; R_CURLY: number; BACKSLASH: number; PIPE: number; SEMICOLON: number; COLON: number; APOSTROPHE: number; QUOTE: number; COMMA: number; LESS_THAN: number; PERIOD: number; GREATER_THAN: number; SLASH: number; QUESTION: number; EXCLAMATION: number; AT: number; HASH: number; DOLLAR: number; PERCENT: number; CARET: number; AMPERSAND: number; ASTERISK: number; LEFT_PAREN: number; RIGHT_PAREN: number; F1: number; F2: number; F3: number; F4: number; F5: number; F6: number; F7: number; F8: number; F9: number; F10: number; F11: number; F12: number; ENTER: number; SPACE: number; ESCAPE: number; BACKSPACE: number; TAB: number; SHIFT: number; CTRL: number; ALT: number; CAPS_LOCK: number; PAUSE: number; INSERT: number; HOME: number; DELETE: number; END: number; PAGE_UP: number; PAGE_DOWN: number; ARROW_UP: number; ARROW_DOWN: number; ARROW_LEFT: number; ARROW_RIGHT: number; NUMPAD_0: number; NUMPAD_1: number; NUMPAD_2: number; NUMPAD_3: number; NUMPAD_4: number; NUMPAD_5: number; NUMPAD_6: number; NUMPAD_7: number; NUMPAD_8: number; NUMPAD_9: number; NUMPAD_MULTIPLY: number; NUMPAD_ADD: number; NUMPAD_SUBTRACT: number; NUMPAD_DECIMAL: number; NUMPAD_DIVIDE: number; NUMPAD_ENTER: number; } & Record<string, number>;
type KeyName = { "8": string; "9": string; "13": string; "16": string; "17": string; "18": string; "19": string; "20": string; "27": string; "32": string; "33": string; "34": string; "35": string; "36": string; "37": string; "38": string; "39": string; "40": string; "45": string; "46": string; "48": string; "49": string; "50": string; "51": string; "52": string; "53": string; "54": string; "55": string; "56": string; "57": string; "59": string; "65": string; "66": string; "67": string; "68": string; "69": string; "70": string; "71": string; "72": string; "73": string; "74": string; "75": string; "76": string; "77": string; "78": string; "79": string; "80": string; "81": string; "82": string; "83": string; "84": string; "85": string; "86": string; "87": string; "88": string; "89": string; "90": string; "96": string; "97": string; "98": string; "99": string; "100": string; "101": string; "102": string; "103": string; "104": string; "105": string; "106": string; "107": string; "109": string; "110": string; "111": string; "112": string; "113": string; "114": string; "115": string; "116": string; "117": string; "118": string; "119": string; "120": string; "121": string; "122": string; "123": string; "187": string; "188": string; "189": string; "190": string; "191": string; "192": string; "219": string; "220": string; "221": string; "222": string; } & Record<string | number, string>;

interface Util {
	getTime(update: boolean): number;
	cookiesEnabled(): boolean;
	storageEnabled(): boolean;
	absMod(n1: number, n2: number): number;
	escapeHTML(text: string): string;
	mkHTML<K extends keyof HTMLElementTagNameMap>(tag: K, opts: Partial<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
	setTooltip(element: Element, message: string, immediate?: boolean): void;
	waitFrames(n: number, cb: () => void): void;
	line(x1: number, y1: number, x2: number, y2: number, size: number, plot: (x: number, y: number) => void): void;
	loadScript(name: string, callback: (event: Event) => void): void;
	setCookie(name: string, value: string): void;
	getCookie(name: string): string | null;
	propertyDefaults<T>(obj: T, defaults: T): T;
	htmlToElement(html: string): Element;
	decompress(u8arr: Uint8Array): Uint8Array;
	KeyCode: KeyCode;
	KeyName: KeyName;
	colorUtils: ColorUtils;
}

// util/color.js
interface ColorUtils {
	to888(R: number, G: number, B: number): [number, number, number];
	to565(R: number, G: number, B: number): [number, number, number];
	u16_565(R: number, G: number, B: number): number;
	u24_888(R: number, G: number, B: number): number;
	u32_888(R: number, G: number, B: number): number;
	u16_565_to_888(color: number): number;
	arrFrom565(color: number): [number, number, number];
	toHTML(color: number): string;
}

// util/Bucket.js
export declare class Bucket {
	constructor(rate: number, time: number);
	canSpend(count: number): boolean;
	update(): number | void;
	lastCheck: number;
	allowance: number;
	rate: number;
	time: number;
	infinite: boolean;
}

// util/Lerp.js
export declare class Lerp {
	constructor(start: number, end: number, ms: number);
	get val(): number;
	set val(v: number);
	start: number;
	end: number;
	ms: number;
	time: number
}

// protocol/Protocol.js
export declare class Protocol {
	constructor(ws: WebSocket);
	hookEvents(subClass: Protocol): void;
	isConnected(): boolean;
	openHandler(): void;
	// errorHandler(err: Event): void;
	// closeHandler(): void;
	// messageHandler(message: MessageEvent): void;
	// joinWorld(name: string): void;
	// requestChunk(x: number, y: number): void;
	// updatePixel(x: number, y: number, rgb: [number, number, number]): void;
	// sendUpdates(): void;
	// sendMessage(str: string): void;
	lasterr: Event | null;
}

// protocol/old.js
export declare class OldProtocolImpl extends Protocol {
	constructor(ws: WebSocket, worldName: string, captcha?: string);
	errorHandler(err: Event): void;
	closeHandler(): void;
	messageHandler(message: MessageEvent): void;
	joinWorld(name: string): string;
	requestChunk(x: number, y: number): void;
	allChunksLoaded(): boolean;
	updatePixel(x: number, y: number, rgb: [number, number, number], undocb: () => void): boolean;
	sendUpdates(): void;
	sendMessage(str: string): boolean;
	protectChunk(x: number, y: number, newState: number): void;
	setChunk(x: number, y: number, data: number[]): boolean;
	clearChunk(x: number, y: number, rgb: [number, number, number]): boolean;
	lastSentX: number;
	lastSentY: number;
	playercount: number;
	worldName: string;
	players: Record<string, true>;
	chunksLoading: Record<string, true>;
	waitingForChunks: number;
	pendingEdits: Record<string, ReturnType<typeof setTimeout>>;
	id: number | null;
	captcha: string;
	chatBucket: Bucket;
	placeBucket: Bucket;
	placeBucketMult: number;
	donUntilTs: number;
	interval: ReturnType<typeof setInterval> | null;
	clet: ReturnType<typeof setTimeout> | null;
	joinFunc: () => void;
	leaveFunc: () => void;
}

interface OldProtocol {
	class: typeof OldProtocolImpl;
	chunkSize: number;
	netUpdateSpeed: number;
	clusterChunkAmount: number;
	maxWorldNameLength: number;
	worldBorder: number;
	chatBucket: [number, number];
	placeBucket: Record<number, [number, number]>;
	maxMessageLength: Record<number, number>;
	tools: Record<string | number, string> & { id: Record<string, number> };
	misc: {
		worldVerification: number;
		chatVerification: string;
		tokenVerification: string;
	};
	opCode: {
		client: Record<string, number>;
		server: Record<string, number>;
	};
}

// canvas_renderer.js
export declare class BufView {
	constructor(u32data: Uint32Array, x: number, y: number, w: number, h: number, realw: number);
	get(x: number, y: number): number;
	set(x: number, y: number, data: number): void;
	fill(data: number): void;
	fillFromBuf(u32buf: Uint32Array): void;
	data: Uint32Array;
	changes?: [number, number, number, number][];
	offx: number;
	offy: number;
	realwidth: number;
	width: number;
	height: number;
}

interface Camera {
	isVisible(x: number, y: number, w: number, h: number): boolean | void;
	centerCameraTo(x: number, y: number): void;
	moveCameraBy(x: number, y: number): void;
	moveCameraTo(x: number, y: number): void;
	alignCamera(): void;
	get x(): number;
	get y(): number;
	get zoom(): number;
	set zoom(z: number);
}

interface Renderer {
	rendertype: {
		ALL: number;
		FX: number;
		WORLD: number;
	} & Record<string, number>;
	patterns: {
		get unloaded(): CanvasPattern;
	} & Record<string, CanvasPattern>;
	render(type: number): void;
	showGrid(enabled: boolean): void;
	get gridShown(): boolean;
	updateCamera(): void;
	unloadFarClusters(): void;
	drawText(ctx: CanvasRenderingContext2D, str: string, x: number, y: number, centered: boolean): void;
	renderPlayer(targetPlayer: PlayerObj, fontSize: number): void;
	renderPlayerId(ctx: CanvasRenderingContext2D, fontsize: number, zoom: number, x: number, y: number, id: string, color: string): void;
}

export declare class ChunkCluster {
	constructor(x: number, y: number);
	render(): void;
	remove(): void;
	addChunk(chunk: Chunk): void;
	delChunk(chunk: Chunk): void;
	removed: boolean;
	toUpdate: boolean;
	shown: boolean;
	x: number;
	y: number;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	data: ImageData;
	u32data: Uint32Array;
	chunks: Chunk[];
	currentColor?: number;
}

interface RendererValues {
	updateRequired: number;
	animContext: CanvasRenderingContext2D | null;
	gridShown: boolean;
	gridPattern: CanvasPattern | null;
	unloadedPattern: CanvasPattern | null;
	worldBackground: CanvasPattern | null;
	minGridZoom: number;
	updatedClusters: ChunkCluster[];
	clusters: Record<string, ChunkCluster>;
	visibleClusters: ChunkCluster[];
	currentFontSize: number;
}

// tool_renderer.js
interface Cursor {
	imgpos: [number, number];
	hotspot: [number, number];
	img: {
		shadowed: HTMLCanvasElement;
		shadowblob: string;
	};
}

type Cursors = Record<string, Cursor> & { set: HTMLImageElement };

// Fx.js
type FxRenderFunc<T> = ((fx: FxObj<T>, ctx: CanvasRenderingContext2D, time: number) => number | void) | null;

export declare class FxObj<T> {
	constructor(renderFunc: FxRenderFunc<T>, extra?: T);
	render(ctx: CanvasRenderingContext2D, time: number): number;
	setVisibleFunc(func: () => boolean): void;
	setVisible(bool: boolean): void;
	setRenderer(func: FxRenderFunc<T>): void;
	update(extra: T): void;
	delete(): void;
	visible: boolean;
	renderFunc: FxRenderFunc<T>;
	extra: T;
}

interface Fx {
	world: {
		NONE: null;
		RECT_FADE_ALIGNED<T>(size: number, x: number, y: number, startTime?: number): FxRenderFunc<T>;
	};
	player: {
		NONE: null;
		RECT_SELECT_ALIGNED<T>(pixelSize: number, htmlColor?: string): FxRenderFunc<T>;
	};
	class: typeof FxObj;
}

// main.js
interface Mouse {
	x: number;
	y: number;
	lastX: number;
	lastY: number;
	get worldX(): number;
	get worldY(): number;
	mouseDownWorldX: number;
	mouseDownWorldY: number;
	get tileX(): number;
	get tileY(): number;
	buttons: number;
	validTile: boolean;
	insideViewport: boolean;
	touches: never[],
	cancelMouseDown: () => void;
}

interface Chat {
	send(msg: string): boolean | void;
	clear(): void;
	receiveMessage(rawText: string): void;
	local(msg: string): void;
	get onDevMsg(): (msg: string) => void;
	set onDevMsg(fn: (msg: string) => void);
	get postFormatRecvModifier(): (msg: string) => string;
	set postFormatRecvModifier(fn: (msg: string) => string);
	get recvModifier(): (msg: string) => string;
	set recvModifier(fn: (msg: string) => string);
	get sendModifier(): (msg: string) => string;
	set sendModifier(fn: (msg: string) => string);
}

interface Context {
	createContextMenu(x: number, y: number, buttons: [string, (event: MouseEvent) => void][]): void;
}

interface Elements {
	viewport: Element;
	xyDisplay: Element;
	chatInput: Element;
	chat: Element;
	devChat: Element;
}

interface LastMessage {
	get text(): string;
	incCount: () => void;
	ignore: () => boolean;
}

interface Misc {
	localStorage: Storage | false;
	_world: WorldObj | null;
	lastXYDisplay: [number, number];
	devRecvReader: (msg: string) => void;
	chatPostFormatRecvModifier: (msg: string) => string;
	chatRecvModifier: (msg: string) => string;
	chatSendModifier: (msg: string) => string;
	exceptionTimeout: ReturnType<typeof setTimeout> | null;
	worldPasswords: Record<string, string>;
	tick: number;
	urlWorldName: string | null;
	connecting: boolean;
	tickInterval: ReturnType<typeof setInterval> | null;
	lastMessage: LastMessage;
	lastCleanup: number;
	set world(value: WorldObj);
	get world(): WorldObj;
	guiShown: boolean;
	cookiesEnabled: boolean;
	storageEnabled: boolean;
	showEUCookieNag: boolean;
	usingFirefox: boolean;
	donTimer: ReturnType<typeof setInterval>;
	keybinds: Record<string, number>;
	palettes: Record<string, [number, number, number][]>;
	attemptedPassword: string | null;
}

type Sounds = {
	play(sound: HTMLAudioElement): Promise<void>;
	launch: HTMLAudioElement;
	place: HTMLAudioElement;
	click: HTMLAudioElement;
} & Record<string, HTMLAudioElement>;

interface World {
	get name(): string;
	get getPixel(): (x: number, y: number, chunk?: Chunk) => [number, number, number] | null;
	get setPixel(): (x: number, y: number, color: [number, number, number], noUndo: boolean) => boolean;
	get undo(): (bulkUndo: boolean) => boolean | void;
}

// util/normalizeWheel.js
interface NormalizedWheel {
	spinX: number;
	spinY: number;
	pixelX: number;
	pixelY: number;
}

// tools.js
type ToolEventMouse = ((mouse: Mouse, event: MouseEvent) => void) | null;
type ToolEventTouch = ((mouse: Mouse, event: TouchEvent) => void) | null;
type ToolEventSelect = (() => void) | null;
type ToolEventKey = ((keysDown: Record<number, true>, event: KeyboardEvent) => void) | null;
type ToolEventScroll = ((mouse: Mouse, nevt: NormalizedWheel, event: WheelEvent) => void) | null;
type ToolEventTick = ((mouse: Mouse) => void) | null;

export declare class Tool<T> {
	constructor(name: string, cursor: Cursor, fxRenderer: FxRenderFunc<T>, rankNeeded: number, onInit: (tool: Tool<T>) => void);
	setFxRenderer(func: FxRenderFunc<T>): void;
	isEventDefined(type: string): boolean;
	setEvent(type: "mouseup", func: ToolEventMouse): void;
	setEvent(type: "mousedown", func: ToolEventMouse): void;
	setEvent(type: "mousemove", func: ToolEventMouse): void;
	setEvent(type: "touchstart", func: ToolEventTouch): void;
	setEvent(type: "touchmove", func: ToolEventTouch): void;
	setEvent(type: "touchend", func: ToolEventTouch): void;
	setEvent(type: "touchcancel", func: ToolEventTouch): void;
	setEvent(type: "select", func: ToolEventSelect): void;
	setEvent(type: "deselect", func: ToolEventSelect): void;
	setEvent(type: "keydown", func: ToolEventKey): void;
	setEvent(type: "keyup", func: ToolEventKey): void;
	setEvent(type: "scroll", func: ToolEventScroll): void;
	setEvent(type: "tick", func: ToolEventTick): void;
	setEvent(type: string, func: ((...args: unknown[]) => void) | null): void;
	call(type: string, data: unknown[]): void;
	defaultTouchHandler(type: string, data: unknown[]): void;
	name: string;
	id: string | null;
	fxRenderer: FxRenderFunc<T>;
	cursorblob: string;
	cursor: HTMLCanvasElement;
	setposition: string;
	offset: [number, number];
	rankRequired: number;
	extra: Record<string, unknown>;
	events: {
		mouseup: ToolEventMouse;
		mousedown: ToolEventMouse;
		mousemove: ToolEventMouse;
		touchstart: ToolEventTouch;
		touchmove: ToolEventTouch;
		touchend: ToolEventTouch;
		touchcancel: ToolEventTouch;
		select: ToolEventSelect;
		deselect: ToolEventSelect;
		keydown: ToolEventKey;
		keyup: ToolEventKey;
		scroll: ToolEventScroll;
		tick: ToolEventTick;
	};
}

interface ToolsApi {
	class: typeof Tool;
	addToolObject<T>(tool: Tool<T>): void;
	updateToolbar(win?: GUIWindow): void;
	allTools: Record<string, Tool<unknown>>;
}

// Player.js
export declare class PlayerObj {
	constructor(x: number, y: number, rgb: [number, number, number], tool: string, id: number);
	get tileX(): number;
	get tileY(): number;
	get endX(): number;
	get endY(): number;
	get x(): number;
	get y(): number;
	update(x: number, y: number, rgb: [number, number, number], tool: string): void;
	disconnect(): void;
	id: string;
	_x: Lerp;
	_y: Lerp;
	tool: Tool<{ player: PlayerObj }>;
	fx: FxObj<{ player: PlayerObj }>;
	rgb: [number, number, number];
	htmlRgb: string;
	clr: string;
}

// World.js
export declare class Chunk {
	constructor(x: number, y: number, netdata: Uint32Array, locked: boolean);
	update(x: number, y: number, color: number): void;
	forEach(cb: (x: number, y: number, color: number) => boolean): boolean;
	get(x: number, y: number): number;
	set(data: number | Uint32Array): void;
	remove(): void;
	needsRedraw: boolean;
	x: number;
	y: number;
	tmpChunkBuf: Uint32Array | null;
	view: BufView | null;
	locked: boolean;
	lockedNeighbors: number;
}

export declare class WorldObj {
	constructor(worldName: string);
	makeLockedChunksPath(): Path2D | null;
	findNeighborLockedChunks(chunk: Chunk, newState: number): void;
	loadChunk(x: number, y: number): void;
	allChunksLoaded(): boolean;
	tilesUpdated(tiles: { x: number, y: number, rgb: number, id: number }[]): void;
	playersMoved(players: Record<string, { x: number, y: number, rgb: [number, number, number], tool: string }>): void;
	playersLeft(ids: string[]): void;
	setPixel(x: number, y: number, color: [number, number, number], noUndo: boolean): boolean;
	undo(bulkUndo: boolean): boolean | void;
	getChunkAt(x: number, y: number): Chunk;
	getPixel(x: number, y: number, chunk?: Chunk): [number, number, number] | null;
	validMousePos(tileX: number, tileY: number): boolean;
	chunkLocked(x: number, y: number, newState: number): void;
	chunkLoaded(chunk: Chunk): void;
	chunkUnloaded(chunk: Chunk): void;
	chunkPasted(x: number, y: number, data: number | Uint32Array): void;
	unloadAllChunks(): void;
	name: string;
	chunks: Record<string, Chunk>;
	protectedChunks: Record<string, Chunk>;
	players: Record<string, PlayerObj>;
	undoHistory: [number, number, number, number, number, number][];
	pathUpdaterTimeout: ReturnType<typeof setTimeout>;
	pathFx: FxObj<{ path?: Path2D | null }>;
}

// windowsys.js
interface WindowSys {
	windows: Record<string, GUIWindow>;
	class: {
		input: typeof UtilInput;
		dialog: typeof UtilDialog;
		dropDown: typeof OWOPDropDown;
		window: typeof GUIWindow;
	},
	addWindow<T extends UtilInput | UtilDialog | OWOPDropDown | GUIWindow>(window: T): T;
	delWindow<T extends UtilInput | UtilDialog | OWOPDropDown | GUIWindow>(window: T): T;
	centerWindow(window: UtilInput | UtilDialog | OWOPDropDown | GUIWindow): void;
	closeAllWindows(): void;
	getWindow(windowName: string): GUIWindow;
}

interface WindowOptions {
	centerOnce?: boolean;
	closeable?: boolean;
	immobile?: boolean;
}

export declare class UtilInput {
	constructor(title: string | undefined | null, message: string, inputType: string, cb: (value: string) => void);
	getWindow(): GUIWindow;
	win: GUIWindow;
	inputField: HTMLInputElement;
	okButton: HTMLButtonElement;
}

export declare class UtilDialog {
	constructor(title: string | undefined | null, message: string, canClose: boolean, cb: () => void);
	getWindow(): GUIWindow;
	win: GUIWindow;
	messageBox: HTMLSpanElement;
	okButton: HTMLButtonElement;
}

export declare class OWOPDropDown {
	constructor();
	getWindow(): GUIWindow;
	win: GUIWindow;
}

export declare class GUIWindow {
	constructor(title: string | undefined | null, options: WindowOptions | undefined | null, initfunc: (window: GUIWindow) => void);
	getWindow(): this;
	addObj<T extends Element>(object: T): T;
	delObj(object: Element): void;
	move(x: number, y: number): this;
	resize(w: number, h: number): this;
	close(): void;
	wm: WindowSys;
	opt: WindowOptions;
	title: string;
	frame: HTMLDivElement;
	container: HTMLDivElement;
	x: number;
	y: number;
	titlespan?: HTMLSpanElement;
	get realw(): number;
	get realh(): number;
	elements: Element[];
	creationtime: number;
	currentaction: ((x: number, y: number) => void) | null;
	mdownfunc: (e: MouseEvent) => void;
	mupfunc: (e: MouseEvent) => void;
	mmovefunc: (e: MouseEvent) => void;
	touchfuncbuilder: (type: string) => (e: TouchEvent) => void;
}

// EventEmitter
type Listener<T extends unknown[]> = (...args: T) => void;

interface EventEmitterTypeListener {
	(type: string | number, listener: Listener<unknown[]>): this;
}

interface EventEmitterTypeEmit {
	(type: string | number, ...args: unknown[]): boolean;
}

export declare class EventEmitter {
	constructor();
	addListener: EventEmitterTypeListener;
	emit: EventEmitterTypeEmit;
	eventNames(): string[];
	getMaxListeners(): number;
	listenerCount(type: string | number): number;
	listeners(type: string | number): Listener<unknown[]>[];
	off: EventEmitterTypeListener;
	on: EventEmitterTypeListener;
	once: EventEmitterTypeListener;
	prependListener: EventEmitterTypeListener;
	prependOnceListener: EventEmitterTypeListener;
	rawListeners(type: string | number): Listener<unknown[]>[];
	removeAllListeners(type: string | number): this;
	removeListener: EventEmitterTypeListener;
	setMaxListeners(n: number): this;
}

type EventSysPayloads = {
	"loaded": [];
	"init": [];
	"tick": [tickNum: number];
	"misc.toolsRendered": [];
	"misc.toolsInitialized": [];
	"misc.logoMakeRoom": [];
	"misc.worldInitialized": [];
	"misc.windowAdded": [window: GUIWindow];
	"misc.captchaToken": [token: string];
	"misc.loadingCaptcha": [];
	"renderer.addChunk": [chunk: Chunk];
	"renderer.rmChunk": [chunk: Chunk];
	"renderer.updateChunk": [chunk: Chunk];
	"camera.moved": [camera: Camera];
	"camera.zoom": [z: number];
	"net.connecting": [server: Server];
	"net.connected": [];
	"net.disconnected": [];
	"net.playerCount": [playercount: number];
	"net.chat": [message: string];
	"net.devChat": [message: string];
	"net.world.leave": [];
	"net.world.join": [worldName: string];
	"net.world.joining": [name: string];
	"net.world.setId": [id: number];
	"net.world.playersMoved": [updates: Record<string, { x: number, y: number, rgb: [number, number, number], tool: string }>];
	"net.world.playersLeft": [updates: number[]];
	"net.world.tilesUpdated": [updates: { x: number, y: number, rgb: number, id: number }[]];
	"net.world.teleported": [x: number, y: number];
	"net.chunk.load": [chunk: Chunk];
	"net.chunk.unload": [chunk: Chunk];
	"net.chunk.set": [chunkX: number, chunkY: number, u32data: Uint32Array];
	"net.chunk.lock": [cx: number, cy: number, newState: number];
	"net.chunk.allLoaded": [];
	"net.sec.rank": [rank: number];
	"net.maxCount": [maxCount: number];
	"net.donUntil": [donUntilTs: number, placeBucketMult: number];
};

interface EventSysTypeEmit {
	<K extends keyof EventSysPayloads>(
		type: BrandedEvent<K>, 
		...args: EventSysPayloads[K]
	): boolean;
}

interface EventSysTypeListener {
	<K extends keyof EventSysPayloads>(
		type: BrandedEvent<K>, 
		listener: (...args: EventSysPayloads[K]) => void
	): this;
}

type EventSys = {
	emit: EventSysTypeEmit;
	addListener: EventSysTypeListener;
	off: EventSysTypeListener;
	on: EventSysTypeListener;
	once: EventSysTypeListener;
	prependListener: EventSysTypeListener;
	prependOnceListener: EventSysTypeListener;
	removeListener: EventSysTypeListener;
} & EventEmitter;

// conf.js
type BrandedEvent<T> = number & { __eventBrand: T };

type Events = {
	loaded: BrandedEvent<"loaded">;
	init: BrandedEvent<"init">;
	tick: BrandedEvent<"tick">;
	misc: {
		toolsRendered: BrandedEvent<"misc.toolsRendered">;
		toolsInitialized: BrandedEvent<"misc.toolsInitialized">;
		logoMakeRoom: BrandedEvent<"misc.logoMakeRoom">;
		worldInitialized: BrandedEvent<"misc.worldInitialized">;
		windowAdded: BrandedEvent<"misc.windowAdded">;
		captchaToken: BrandedEvent<"misc.captchaToken">;
		loadingCaptcha: BrandedEvent<"misc.loadingCaptcha">;
	} & Record<string, number>;
	renderer: {
		addChunk: BrandedEvent<"renderer.addChunk">;
		rmChunk: BrandedEvent<"renderer.rmChunk">;
		updateChunk: BrandedEvent<"renderer.updateChunk">;
	} & Record<string, number>;
	camera: {
		moved: BrandedEvent<"camera.moved">;
		zoom: BrandedEvent<"camera.zoom">;
	} & Record<string, number>;
	net: {
		connecting: BrandedEvent<"net.connecting">;
		connected: BrandedEvent<"net.connected">;
		disconnected: BrandedEvent<"net.disconnected">;
		playerCount: BrandedEvent<"net.playerCount">;
		chat: BrandedEvent<"net.chat">;
		devChat: BrandedEvent<"net.devChat">;
		world: {
			leave: BrandedEvent<"net.world.leave">;
			join: BrandedEvent<"net.world.join">;
			joining: BrandedEvent<"net.world.joining">;
			setId: BrandedEvent<"net.world.setId">;
			playersMoved: BrandedEvent<"net.world.playersMoved">;
			playersLeft: BrandedEvent<"net.world.playersLeft">;
			tilesUpdated: BrandedEvent<"net.world.tilesUpdated">;
			teleported: BrandedEvent<"net.world.teleported">;
		} & Record<string, number>;
		chunk: {
			load: BrandedEvent<"net.chunk.load">;
			unload: BrandedEvent<"net.chunk.unload">;
			set: BrandedEvent<"net.chunk.set">;
			lock: BrandedEvent<"net.chunk.lock">;
			allLoaded: BrandedEvent<"net.chunk.allLoaded">;
		} & Record<string, number>;
		sec: {
			rank: BrandedEvent<"net.sec.rank">;
		} & Record<string, number>;
		maxCount: BrandedEvent<"net.maxCount">;
		donUntil: BrandedEvent<"net.donUntil">;
	} & Record<string, number>;
} & Record<string, number>;

interface Options {
	serverAddress: Server[];
	fallbackFps: number;
	maxChatBuffer: number;
	tickSpeed: number;
	minGridZoom: number;
	movementSpeed: number;
	defaultWorld: string;
	enableSounds: boolean;
	enableIdView: boolean;
	defaultZoom: number;
	zoomStrength: number;
	zoomLimitMin: number;
	zoomLimitMax: number;
	unloadDistance: number;
	toolSetUrl: string;
	unloadedPatternUrl: string;
	noUi: boolean;
	fool: boolean;
	backgroundUrl: string | null;
	chunkBugWorkaround: boolean;
	hexCoords: boolean;
	showProtectionOutlines: boolean;
	showPlayers: boolean;
}

// networking.js
interface Server {
	default: boolean;
	title: string;
	proto: string | OldProtocol;
	url: string;
}

interface Net {
	isConnected(): boolean;
	connect(server: Server, worldName: string, captcha: string): void;
	currentServer: Server | null;
	protocol: OldProtocolImpl | null;
}

// local_player.js
interface Player {
	get paletteIndex(): number;
	set paletteIndex(i: number);
	get htmlRgb(): string;
	get selectedColor(): [number, number, number];
	set selectedColor(c: [number, number, number]);
	get palette(): [number, number, number][];
	set palette(p: [number, number, number][]);
	get rank(): number;
	get tool(): Tool<unknown>;
	set tool(name: string);
	get toolId(): number | undefined;
	get tools(): Record<string, Tool<unknown>>;
	get id(): number;
	clearPalette(): void;
}

// global.js
interface AnnoyingAPI {
	ws: typeof WebSocket;
}

interface Global {
	AnnoyingAPI: AnnoyingAPI;
	eventSys: EventSys;
	wsTroll: () => void;
}

interface PublicAPI {
	Bucket: typeof Bucket;
	Lerp: typeof Lerp;
	OldProtocol: OldProtocol;
	Protocol: typeof OldProtocolImpl;
	RANK: Record<string, number>;
	World: typeof WorldObj;
	activeFx: FxObj<unknown>[];
	camera: Camera;
	captchaState: Record<string, number>;
	chat: Chat;
	context: Context;
	cursors: Cursors;
	definedProtos: { old: OldProtocol };
	elements: Elements;
	emit: EventSysTypeEmit & EventEmitterTypeEmit;
	events: Events;
	fx: Fx;
	global: Global;
	misc: Misc;
	mouse: Mouse;
	muted: number[];
	net: Net;
	normalizeWheel(event: WheelEvent): NormalizedWheel;
	on: EventSysTypeListener & EventEmitterTypeListener;
	once: EventSysTypeListener & EventEmitterTypeListener;
	options: Options;
	player: Player;
	poke(): void;
	protocol: null;
	receiveDevMessage(text: string): void;
	removeListener(): EventSysTypeListener & EventEmitterTypeListener;
	renderer: Renderer;
	rendererValues: RendererValues;
	showDevChat(bool: boolean): void;
	showPlayerList(bool: boolean): void;
	sounds: Sounds;
	statusMsg(showSpinner: boolean, message: string): void;
	tools: ToolsApi;
	util: Util;
	windowSys: WindowSys;
	world: World;
}

export {};

declare global {
	var OWOP: PublicAPI;
	var WorldOfPixels: PublicAPI;
}
