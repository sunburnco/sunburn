import { type LocalParticipant, type LocalTrackPublication, Track } from 'livekit-client';

export const onLocalTrackUnpublished = (
	publication: LocalTrackPublication,
	_participant: LocalParticipant,
) => {
	if (publication.source === Track.Source.ScreenShare) {
		// TODO stop screenshare
	}
};
