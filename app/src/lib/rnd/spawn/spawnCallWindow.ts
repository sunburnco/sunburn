import { tick } from 'svelte';

import { sunburn } from '$lib/sunburn.svelte';
import { handleAtHost } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnCallWindow = async (owner: string, channel: string, parent: string) => {
	const winID = `${owner}_${channel}_call`;

	if (winID in rndWindows) {
		activeWindowID.id = winID;
		await tick();
		bringIDToTop(winID);
		return;
	}

	const { x, y } = middleOfWindowArea(512, 368);
	rndWindows[winID] = {
		data: {
			t: 'call',
			owner,
			channel
		},
		h: 368,
		id: winID,
		locked: false,
		title: `${sunburn.servers[sunburn.channels[channel].server].name}/${sunburn.channels[channel].name} (${handleAtHost(owner, owner)})`,
		w: 512,
		x,
		y,
		z: 0,
		parent
	};

	if (!rndWindows[parent].children) {
		rndWindows[parent].children = [];
	}
	rndWindows[parent].children.push(winID);

	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
