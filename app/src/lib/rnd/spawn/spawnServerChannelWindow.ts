import { ClientResponseError } from 'pocketbase';
import { tick } from 'svelte';
import { v4 } from 'uuid';

import { errorPrefix } from '$lib/logPrefixes';
import { sunburn } from '$lib/sunburn.svelte';
import {
	fetchChannel,
	fetchChannelRoleAssignments,
	fetchChannelVoiceParticipants
} from '$lib/sunburn/channels';
import { handleAtHost, logFriendly } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnServerChannelWindow = async (
	owner: string,
	channel: string,
	opts?: Partial<{
		x: number;
		y: number;
		theme: string;
	}>
) => {
	try {
		if (!(channel in sunburn.channels)) {
			fetchChannel(sunburn.clients[owner], channel);
			fetchChannelRoleAssignments(sunburn.clients[owner], channel);
			fetchChannelVoiceParticipants(sunburn.clients[owner], channel);
		}
	} catch (err) {
		if (err instanceof ClientResponseError) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(owner),
				'could not spawn server channel window',
				channel,
				'\n',
				err
			);
			return;
		}

		throw err;
	}

	const server = sunburn.channels[channel].server;
	const title = `${sunburn.servers[server].name}/#${sunburn.channels[channel].name}`;

	const winID = v4();
	const { x: midX, y: midY } = middleOfWindowArea(512, 512);
	const x = opts?.x ?? midX;
	const y = opts?.y ?? midY;

	rndWindows[winID] = {
		data: {
			t: 'serverChannel',
			owner,
			channel
		},
		h: 512,
		id: winID,
		locked: false,
		title: `${title} (${handleAtHost(owner, owner)})`,
		theme: opts?.theme,
		w: 512,
		x,
		y,
		z: 0
	};
	activeWindowID.id = winID;
	await tick();
	bringIDToTop(winID);
};
