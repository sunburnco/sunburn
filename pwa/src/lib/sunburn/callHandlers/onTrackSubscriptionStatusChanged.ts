import {
	type RemoteParticipant,
	type RemoteTrackPublication,
	Track,
	TrackPublication,
} from 'livekit-client';
import { tick } from 'svelte';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly, nameOrHandle } from '$lib/utils/username';

import { call } from '../call.svelte';

export const onTrackSubscriptionStatusChanged = (
	publication: RemoteTrackPublication,
	status: TrackPublication.SubscriptionStatus,
	participant: RemoteParticipant,
) => {
	switch (status) {
		case TrackPublication.SubscriptionStatus.Subscribed:
			delete call.roomParticipants[participant.identity].tracks[publication.trackSid];
			tick().then(() => {
				call.roomParticipants[participant.identity].tracks[publication.trackSid] = publication;
			});

			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(call.instanceID),
				'subscribe to',
				nameOrHandle(call.instanceID, participant.identity),
				publication.source,
				'stream',
			);

			switch (publication.source) {
				case Track.Source.Camera:
					call.roomParticipants[participant.identity].cameraUnmuted = !publication.isMuted;
					break;
				case Track.Source.Microphone:
					call.roomParticipants[participant.identity].micUnmuted = !publication.isMuted;
					break;
				case Track.Source.ScreenShare:
					call.roomParticipants[participant.identity].screenShareUnmuted = !publication.isMuted;
					break;
				case Track.Source.ScreenShareAudio:
					call.roomParticipants[participant.identity].screenShareAudioUnmuted =
						!publication.isMuted;
					break;
			}
			break;

		case TrackPublication.SubscriptionStatus.Desired:
			// call.roomParticipants[participant.identity].tracks[publication.trackSid].setSubscribed(false)
			delete call.roomParticipants[participant.identity].tracks[publication.trackSid];

			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(call.instanceID),
				'desire',
				nameOrHandle(call.instanceID, participant.identity),
				publication.source,
				'stream',
			);
			break;

		case TrackPublication.SubscriptionStatus.Unsubscribed:
			delete call.roomParticipants[participant.identity].tracks[publication.trackSid];

			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(call.instanceID),
				'unsubscribe from',
				nameOrHandle(call.instanceID, participant.identity),
				publication.source,
				'stream',
			);
			break;
	}
};
