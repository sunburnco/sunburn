import { Track } from 'livekit-client';

import { call } from '$lib/sunburn/call.svelte';

import { debugPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const muteMic = async () => {
	if (!call.me) {
		return;
	}

	for (const trackID of Object.keys(call.me.tracks)) {
		const track = call.me.tracks[trackID];

		if (!track) {
			continue;
		}

		if (track.source === Track.Source.Microphone) {
			await track.mute();
			// TODO play sound
			call.me.micUnmuted = false;

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(call.instanceID), 'muted mic');
		}
	}
};
