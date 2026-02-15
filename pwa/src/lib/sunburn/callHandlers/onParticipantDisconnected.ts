import type { RemoteParticipant } from 'livekit-client';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly, nameOrHandle } from '$lib/utils/username';

import { call } from '../call.svelte';

export const onParticipantDisconnected = (p: RemoteParticipant) => {
	delete call.roomParticipants[p.identity];

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(call.instanceID),
		nameOrHandle(call.instanceID, p.identity),
		'left call',
	);
};
