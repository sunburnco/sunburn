import { type LocalParticipant, type LocalTrackPublication, Track } from 'livekit-client';

import { stopScreenShare } from '$lib/utils/call/stopScreenShare';

export const onLocalTrackUnpublished = (
	publication: LocalTrackPublication,
	_participant: LocalParticipant,
) => {
	switch (publication.source) {
		// case Track.Source.Microphone:
		// 	muteMic();
		// 	break;
		// case Track.Source.Camera:
		// 	muteCamera();
		// 	break;
		case Track.Source.ScreenShare:
			stopScreenShare();
			break;
	}
};
