import { tick } from 'svelte';

import { sunburn } from '$lib/sunburn.svelte';
import { localSettings } from '$lib/sunburn/localSettings.svelte';
import { localSettingsOrDefault } from '$lib/utils/localSettingsOrDefault';
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

	const w = localSettingsOrDefault(localSettings.window.call.sizeW, 512, 32, Infinity);
	const h = localSettingsOrDefault(localSettings.window.call.sizeH, 368, 32, Infinity);

	let { x, y } = middleOfWindowArea(512, 368);
	x = localSettingsOrDefault(localSettings.window.call.positionX, x, 0, Infinity);
	y = localSettingsOrDefault(localSettings.window.call.positionY, y, 0, Infinity);

	rndWindows[winID] = {
		data: {
			t: 'call',
			owner,
			channel
		},
		h,
		id: winID,
		locked: false,
		title: `${sunburn.servers[sunburn.channels[channel].server].name}/${sunburn.channels[channel].name} (${handleAtHost(owner, owner)})`,
		w,
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
