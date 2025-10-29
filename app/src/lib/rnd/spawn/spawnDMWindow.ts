import { ClientResponseError } from 'pocketbase';
import { tick } from 'svelte';
import { v4 } from 'uuid';

import { errorPrefix } from '$lib/logPrefixes';
import { sunburn } from '$lib/sunburn.svelte';
import { fetchUser } from '$lib/sunburn/users';
import { handleAtHost, logFriendly, usernamePlusHandle } from '$lib/utils/username';

import { activeWindowID, bringIDToTop, middleOfWindowArea, rndWindows } from '../rndState.svelte';

export const spawnDMWindow = async (
	owner: string,
	recipient: string,
	opts?: Partial<{
		x: number;
		y: number;
		theme: string;
	}>
) => {
	try {
		if (!(recipient in sunburn.users)) {
			fetchUser(sunburn.clients[owner], recipient);
		}
	} catch (err) {
		if (err instanceof ClientResponseError) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(owner),
				'could not spawn DM window for',
				recipient,
				'\n',
				err
			);
			return;
		}

		throw err;
	}

	const recipientDisplay = usernamePlusHandle(owner, recipient);

	const winID = v4();
	const { x: midX, y: midY } = middleOfWindowArea(512, 512);
	const x = opts?.x ?? midX;
	const y = opts?.y ?? midY;

	rndWindows[winID] = {
		data: {
			t: 'dm',
			owner,
			recipient
		},
		h: 512,
		id: winID,
		locked: false,
		title: `${recipientDisplay} (${handleAtHost(owner, owner)})`,
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
