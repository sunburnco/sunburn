import { type Participant, Track, type TrackPublication } from 'livekit-client';

import { call } from '../call.svelte';
import { sunburn } from '../sunburn.svelte';

export const onTrackMuteStatusChanged = (
	publication: TrackPublication,
	participant: Participant,
) => {
	if (!participant.isLocal && !publication.isLocal) {
		if (!(participant.identity in sunburn[call.instanceID].users)) {
			return;
		}

		switch (publication.source) {
			case Track.Source.Microphone:
				call.roomParticipants[participant.identity].micUnmuted = !publication.isMuted;
				break;
			case Track.Source.Camera:
				call.roomParticipants[participant.identity].cameraUnmuted = !publication.isMuted;
				break;
			case Track.Source.ScreenShare:
				call.roomParticipants[participant.identity].screenShareUnmuted = !publication.isMuted;
				break;
			case Track.Source.ScreenShareAudio:
				call.roomParticipants[participant.identity].screenShareAudioUnmuted = !publication.isMuted;
				break;
		}
	}
};
