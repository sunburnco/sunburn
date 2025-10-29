import { tick } from 'svelte';
import { v4 } from 'uuid';

import { handleAtHost } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnLogoutWindow = async (authKey: string) => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(384, 304);
	rndWindows[winID] = {
		data: {
			t: 'logout',
			owner: authKey
		},
		h: 320,
		id: winID,
		locked: false,
		title: `Log Out (${handleAtHost(authKey, authKey)})`,
		w: 384,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
