import type { RemoteParticipant, RemoteTrackPublication } from 'livekit-client';

import { call } from '../call.svelte';

export const onTrackUnpublished = (
	publication: RemoteTrackPublication,
	participant: RemoteParticipant,
) => {
	delete call.roomParticipants[participant.identity]?.tracks[publication.trackSid];
};
