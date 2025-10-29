import type { RemoteTrackPublication } from 'livekit-client';
import { tick } from 'svelte';

import { sunburn } from '$lib/sunburn.svelte';
import { handleAtHost, username } from '$lib/utils/username';

import {
	activeWindowID,
	bringIDToTop,
	middleOfWindowArea,
	rndWindows,
	volatileWindowData
} from '../rndState.svelte';

export const spawnCallCameraWindow = async (
	owner: string,
	channel: string,
	user: string,
	track: RemoteTrackPublication | undefined,
	parent: string
) => {
	const winID = `${parent}_${user}_camera`;

	const { x, y } = middleOfWindowArea(512, 288);

	volatileWindowData[winID] = {
		type: 'callCamera',
		track,
		cameraMuted: track?.isMuted || false
	};

	if (winID in rndWindows) {
		activeWindowID.id = winID;
		await tick();
		bringIDToTop(winID);
		return;
	}

	rndWindows[winID] = {
		data: {
			t: 'callCamera',
			channel,
			owner,
			user
		},
		h: 288,
		id: winID,
		locked: false,
		title: `${sunburn.servers[sunburn.channels[channel].server].name}/${sunburn.channels[channel].name}/${username(owner, user)} (${handleAtHost(owner, owner)})`,
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
