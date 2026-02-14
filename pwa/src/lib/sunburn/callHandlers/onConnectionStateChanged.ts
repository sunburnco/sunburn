import type { ConnectionState } from 'livekit-client';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { call } from '../call.svelte';

export const onConnectionStateChanged = (state: ConnectionState) => {
	call.roomState = state;

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(call.instanceID),
		'call',
		call.channelID,
		'connection state changed to',
		state,
	);
};
