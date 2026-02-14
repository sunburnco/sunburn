import { type LocalParticipant, type LocalTrackPublication, Track } from 'livekit-client';

import { muteCamera } from '$lib/utils/call/muteCamera';
import { muteMic } from '$lib/utils/call/muteMic';
import { stopScreenShare } from '$lib/utils/call/stopScreenShare';

export const onLocalTrackUnpublished = (
	publication: LocalTrackPublication,
	_participant: LocalParticipant,
) => {
	switch (publication.source) {
		case Track.Source.Microphone:
			muteMic();
			break;
		case Track.Source.Camera:
			muteCamera();
			break;
		case Track.Source.ScreenShare:
			stopScreenShare();
			break;
	}
};
