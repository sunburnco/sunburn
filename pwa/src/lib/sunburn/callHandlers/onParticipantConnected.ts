import type { RemoteParticipant } from 'livekit-client';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly, nameOrHandle } from '$lib/utils/username';

import { call } from '../call.svelte';
import { fetchUser } from '../data/users';
import { sunburn } from '../sunburn.svelte';

export const onParticipantConnected = (p: RemoteParticipant) => {
	if (!(p.identity in sunburn[call.instanceID].users)) {
		fetchUser(call.instanceID, p.identity, null).then(() => onParticipantConnected(p));
		return;
	}

	call.roomParticipants[p.identity] = {
		participant: p,
		tracks: {},
		micUnmuted: false,
		cameraUnmuted: false,
		screenShareUnmuted: false,
		screenShareAudioUnmuted: false,
	};

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(call.instanceID),
		nameOrHandle(call.instanceID, p.identity),
		'joined call',
	);
};
