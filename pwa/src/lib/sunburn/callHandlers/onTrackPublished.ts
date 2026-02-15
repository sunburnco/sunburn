import { type RemoteParticipant, type RemoteTrackPublication, Track } from 'livekit-client';

import { call } from '../call.svelte';

export const onTrackPublished = (
	publication: RemoteTrackPublication,
	participant: RemoteParticipant,
) => {
	// fires after participant joins, so no need to check for participant in roomParticipants
	call.roomParticipants[participant.identity].tracks[publication.trackSid] = publication;

	if (publication.source === Track.Source.Microphone) {
		publication.setSubscribed(true);
	}
};
