import { Track } from 'livekit-client';

import { call } from '$lib/sunburn/call.svelte';

import { debugPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const stopScreenShare = async () => {
	if (!call.me) {
		return;
	}

	call.me.participant.setScreenShareEnabled(false);
	for (const trackID of Object.keys(call.me.tracks)) {
		const track = call.me.tracks[trackID];

		if (!track) {
			continue;
		}

		if (
			track.source === Track.Source.ScreenShare ||
			track.source === Track.Source.ScreenShareAudio
		) {
			delete call.me.tracks[trackID];
		}
	}

	// TODO play sound
	call.me.screenShareUnmuted = false;
	call.me.screenShareAudioUnmuted = false;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(call.instanceID), 'stopped screenshare');
};
