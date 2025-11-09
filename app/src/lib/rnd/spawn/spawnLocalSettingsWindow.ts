import { tick } from 'svelte';
import { v4 } from 'uuid';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnLocalSettingsWindow = async () => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(512, 512);
	rndWindows[winID] = {
		data: {
			t: 'localSettings'
		},
		h: 512,
		id: winID,
		locked: false,
		title: `Local Settings`,
		w: 512,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
