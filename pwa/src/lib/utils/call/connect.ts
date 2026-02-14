import { call } from '$lib/sunburn/call.svelte';
import { registerRoomListeners } from '$lib/sunburn/callHandlers/registerRoomListeners';

import { errorPrefix, infoPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const connect = async () => {
	call.room?.startAudio();

	if (!call.room) {
		return;
	}

	try {
		registerRoomListeners(call.room);

		await call.room.connect(call.lkBaseURL, call.roomToken, { autoSubscribe: false });

		// eslint-disable-next-line no-console
		console.info(...infoPrefix, logFriendly(call.instanceID), 'connected to call', call.channelID);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(call.instanceID),
			'error connecting to call',
			call.channelID,
			'\n',
			err,
		);
	}
};
