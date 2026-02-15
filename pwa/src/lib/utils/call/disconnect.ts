import { call } from '$lib/sunburn/call.svelte';

import { infoPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const disconnect = async () => {
	if (!call.room) {
		return;
	}

	await call.room.disconnect();
	call.room.removeAllListeners();
	call.roomParticipants = {};
	call.me = null;

	// eslint-disable-next-line no-console
	console.info(
		...infoPrefix,
		logFriendly(call.instanceID),
		'disconnected from call',
		call.channelID,
	);
};
