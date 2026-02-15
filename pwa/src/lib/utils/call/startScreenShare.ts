import { MediaDeviceFailure, Track } from 'livekit-client';

import { call } from '$lib/sunburn/call.svelte';

import { debugPrefix, errorPrefix, warnPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const startScreenShare = async () => {
	if (!call.me) {
		return;
	}

	try {
		const tracks = await call.me.participant.createScreenTracks({
			audio: true,
			contentHint: 'motion',
			selfBrowserSurface: 'include',
			surfaceSwitching: 'include',
			systemAudio: 'include',
		});

		if (tracks.length === 0) {
			// eslint-disable-next-line no-console
			console.warn(
				...warnPrefix,
				logFriendly(call.instanceID),
				'could not create screenshare tracks',
			);
			return;
		}

		for (const track of tracks) {
			const pub = await call.me.participant.publishTrack(track);
			if (!pub) {
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish screenshare track',
				);
				continue;
			}
			call.me.tracks[pub.trackSid] = pub;
		}
		// TODO play sound
		call.me.screenShareUnmuted =
			tracks.findIndex((t) => t.source === Track.Source.ScreenShare) !== -1;
		call.me.screenShareAudioUnmuted =
			tracks.findIndex((t) => t.source === Track.Source.ScreenShareAudio) !== -1;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(call.instanceID), 'started screenshare');
	} catch (err) {
		switch (MediaDeviceFailure.getFailure(err)) {
			case MediaDeviceFailure.PermissionDenied:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish screenshare track because user denied permission to access\n',
					err,
				);
				break;
			case MediaDeviceFailure.NotFound:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish screenshare track because no suitable devices were found\n',
					err,
				);
				break;
			case MediaDeviceFailure.DeviceInUse:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish screenshare track because the chosen device is in use by another program or process\n',
					err,
				);
				break;
			default:
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					logFriendly(call.instanceID),
					'unknown error while attempting to publish screenshare tracks\n',
					err,
				);
		}
	}
};
