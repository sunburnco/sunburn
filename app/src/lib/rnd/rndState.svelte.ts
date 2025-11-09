import { get, set } from 'idb-keyval';
import type { RemoteTrackPublication } from 'livekit-client';
import { v4 } from 'uuid';

export type WindowID_t = string;

export type Window_t = {
	title: string;
	id: WindowID_t;
	data:
		| TypeWelcome_t
		| TypeLogin_t
		| TypeLogout_t
		| TypeClearCaches_t
		| TypePlayground_t
		| TypeDM_t
		| TypeMultiDM_t
		| TypeCreateServer_t
		| TypeServer_t
		| TypeServerChannel_t
		| TypeServerPicker_t
		| TypeCall_t
		| TypeCallCamera_t
		| TypeScreenShare_t
		| TypeLocalSettings_t;
	locked: boolean;
	x: number;
	y: number;
	w: number;
	h: number;
	z: number;
	theme?: string;
	parent?: WindowID_t;
	// TODO change to SvelteSet
	children?: WindowID_t[];
};

type WindowType_t = Window_t['data']['t'];

const defaultExtrema = { minW: 32, maxW: Infinity, minH: 32, maxH: Infinity };
const dialogExtrema = { minW: 96, maxW: 448, minH: 64, maxH: 448 };
export const windowExtrema: Record<
	WindowType_t,
	{
		minW: number;
		maxW: number;
		minH: number;
		maxH: number;
	}
> = {
	welcome: defaultExtrema,
	login: dialogExtrema,
	logout: dialogExtrema,
	clearCaches: dialogExtrema,
	playground: defaultExtrema,
	dm: defaultExtrema,
	multiDM: defaultExtrema,
	createServer: dialogExtrema,
	server: defaultExtrema,
	serverChannel: defaultExtrema,
	serverPicker: defaultExtrema,
	call: { ...defaultExtrema, minH: 240 },
	callCamera: defaultExtrema,
	callScreenShare: defaultExtrema,
	localSettings: defaultExtrema
};

export type TypeLogin_t = {
	t: 'login';
};

export type TypeWelcome_t = {
	t: 'welcome';
};

export type TypeLogout_t = {
	t: 'logout';
	owner: string;
};

export type TypeClearCaches_t = {
	t: 'clearCaches';
};

export type TypePlayground_t = {
	t: 'playground';
};

export type TypeDM_t = {
	t: 'dm';
	owner: string;
	recipient: string;
};

export type TypeMultiDM_t = {
	t: 'multiDM';
	owner: string;
	activeRecipient: string;
};

export type TypeCreateServer_t = {
	t: 'createServer';
	owner: string;
};

export type TypeServer_t = {
	t: 'server';
	owner: string;
	server: string;
};

export type TypeServerChannel_t = {
	t: 'serverChannel';
	owner: string;
	channel: string;
};

export type TypeServerPicker_t = {
	t: 'serverPicker';
	owner: string;
};

export type TypeCall_t = {
	t: 'call';
	owner: string;
	channel: string;
};

export type TypeCallCamera_t = {
	t: 'callCamera';
	owner: string;
	channel: string;
	user: string;
};

export type TypeScreenShare_t = {
	t: 'callScreenShare';
	owner: string;
	channel: string;
	user: string;
};

export type TypeLocalSettings_t = {
	t: 'localSettings';
};

export const activeWindowID = $state({ id: '' });
export const rndWindows = $state<Record<WindowID_t, Window_t>>({});
export const windowAreaDimensions = $state({ w: 0, h: 0 });

export const middleOfWindowArea = (width: number, height: number) => {
	const midW = width / 2;
	const midH = height / 2;

	const midWindowX = $state.snapshot(windowAreaDimensions.w) / 2;
	const midWindowY = $state.snapshot(windowAreaDimensions.h) / 2;

	return { x: Math.floor(midWindowX - midW), y: Math.floor(midWindowY - midH) };
};

export const bringIDToTop = (id: string) => {
	if (!(id in rndWindows)) {
		return;
	}

	// sort by z-index (desc)
	const winIDs = Object.keys(rndWindows).sort((a, b) => rndWindows[b].z - rndWindows[a].z);

	// winIDs.length reserved for ID we're bringing to top
	let currentZ = winIDs.length;
	for (const winID of winIDs) {
		rndWindows[winID].z = --currentZ;
	}
	rndWindows[id].z = winIDs.length;

	saveRNDWindows();
};

export const moveIDToBottom = (id: string) => {
	if (!(id in rndWindows)) {
		return;
	}

	const winIDs = Object.keys(rndWindows).sort((a, b) => rndWindows[b].z - rndWindows[a].z);
	let currentZ = 0;
	for (const winID of winIDs) {
		rndWindows[winID].z = ++currentZ;
	}
	rndWindows[id].z = 0;

	saveRNDWindows();
};

export const closeWindowAndChildren = (windowID: string, depth = 0) => {
	if (depth > 10) {
		return;
	}

	for (const childID of rndWindows[windowID]?.children ?? []) {
		closeWindowAndChildren(childID, depth + 1);
	}

	delete rndWindows[windowID];
	saveRNDWindows();
};

export const saveRNDWindows = async () => set('sbWindows', $state.snapshot(rndWindows));
export const loadRNDWindows = async () => {
	const wins = (await get('sbWindows')) ?? {};

	for (const key of Object.keys(wins)) {
		rndWindows[key] = wins[key];
	}
	if (Object.keys(rndWindows).length === 0) {
		const id = v4();
		rndWindows[id] = {
			data: {
				t: 'welcome'
			},
			h: 240,
			w: 360,
			id,
			locked: false,
			title: 'Welcome',
			x: 0,
			y: 0,
			z: 1
		};
	}
};

export type TypeCallCameraVolatileData_t = {
	type: TypeCallCamera_t['t'];
	track?: RemoteTrackPublication;
	cameraMuted: boolean;
};

export type TypeScreenShareVolatileData_t = {
	type: TypeScreenShare_t['t'];
	videoTrack?: RemoteTrackPublication;
	audioTrack?: RemoteTrackPublication;
};

type TypeVolatileData_t = TypeCallCameraVolatileData_t | TypeScreenShareVolatileData_t;

export const volatileWindowData = $state<Record<WindowID_t, TypeVolatileData_t>>({});
