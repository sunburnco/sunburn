import { tick } from 'svelte';
import { v4 } from 'uuid';

import { sunburn } from '$lib/sunburn.svelte';
import { handleAtHost } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnServerWindow = async (
	owner: string,
	server: string,
	opts?: Partial<{
		windowID: string;
		parent: string;
	}>
) => {
	const winID = opts?.windowID ?? v4();
	const { x, y } = middleOfWindowArea(512, 512);
	rndWindows[winID] = {
		data: {
			t: 'server',
			owner,
			server
		},
		h: 512,
		id: winID,
		locked: false,
		title: `${sunburn.servers[server].name} (${handleAtHost(owner, owner)})`,
		w: 512,
		x,
		y,
		z: 0,
		parent: opts?.parent
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
