import { tick } from 'svelte';
import { v4 } from 'uuid';

import { handleAtHost } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnMultiDMWindow = async (owner: string) => {
	const winID = v4();
	const { x, y } = middleOfWindowArea(512, 512);
	rndWindows[winID] = {
		data: {
			t: 'multiDM',
			owner,
			activeRecipient: ''
		},
		h: 512,
		id: winID,
		locked: false,
		title: `DM List (${handleAtHost(owner, owner)})`,
		w: 512,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
