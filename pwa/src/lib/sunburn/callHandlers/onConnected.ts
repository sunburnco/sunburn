import { Track } from 'livekit-client';

import { call } from '../call.svelte';

export const onConnected = () => {
	call.roomParticipants = {};
	if (!call.room) {
		return;
	}

	call.me = {
		participant: call.room.localParticipant,
		tracks: {},
		micUnmuted: false,
		cameraUnmuted: false,
		screenShareUnmuted: false,
		screenShareAudioUnmuted: false,
	};

	for (const p of call.room.remoteParticipants.values()) {
		call.roomParticipants[p.identity] = {
			participant: p,
			tracks: {},
			micUnmuted: false,
			cameraUnmuted: false,
			screenShareUnmuted: false,
			screenShareAudioUnmuted: false,
		};
		for (const track of p.trackPublications.values()) {
			call.roomParticipants[p.identity].tracks[track.trackSid] = track;

			if (track.source === Track.Source.Microphone) {
				track.setSubscribed(true);
			}
			// TODO auto-subscribe to other types of tracks
			// previously, we checked whether the appropriate window was open
			// should we do something with the app.path?
		}
	}
};
