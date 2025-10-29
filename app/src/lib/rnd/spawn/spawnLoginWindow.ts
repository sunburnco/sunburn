import { tick } from 'svelte';
import { v4 } from 'uuid';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnLoginWindow = async () => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(384, 320);
	rndWindows[winID] = {
		data: {
			t: 'login'
		},
		h: 320,
		id: winID,
		locked: false,
		title: `Add Account (Instance Discovery)`,
		w: 384,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
