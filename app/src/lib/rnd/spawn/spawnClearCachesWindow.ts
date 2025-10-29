import { tick } from 'svelte';
import { v4 } from 'uuid';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnClearCachesWindow = async () => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(384, 304);
	rndWindows[winID] = {
		data: {
			t: 'clearCaches'
		},
		h: 320,
		id: winID,
		locked: false,
		title: 'Clear Caches',
		w: 384,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
