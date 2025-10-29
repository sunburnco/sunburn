import { tick } from 'svelte';
import { v4 } from 'uuid';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnPlaygroundWindow = async (parent?: string) => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(512, 512);
	rndWindows[winID] = {
		data: {
			t: 'playground'
		},
		h: 512,
		id: winID,
		locked: false,
		title: `Playground`,
		w: 512,
		x,
		y,
		z: 0,
		parent
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);

	return winID;
};
