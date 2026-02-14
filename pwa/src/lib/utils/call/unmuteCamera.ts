import { type LocalTrackPublication, MediaDeviceFailure } from 'livekit-client';

import { call } from '$lib/sunburn/call.svelte';

import { debugPrefix, errorPrefix, warnPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const unmuteCamera = async () => {
	if (!call.me) {
		return;
	}

	let cameraTrack: LocalTrackPublication | undefined = undefined;
	try {
		cameraTrack = await call.me.participant.setCameraEnabled(true);
	} catch (err) {
		switch (MediaDeviceFailure.getFailure(err)) {
			case MediaDeviceFailure.PermissionDenied:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish camera track because user denied permission to access\n',
					err,
				);
				break;
			case MediaDeviceFailure.NotFound:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish camera track because no suitable devices were found\n',
					err,
				);
				break;
			case MediaDeviceFailure.DeviceInUse:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish camera track because the chosen device is in use by another program or process\n',
					err,
				);
				break;
			default:
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					logFriendly(call.instanceID),
					'unknown error while trying to publish camera track\n',
					err,
				);
		}
		return;
	}

	if (!cameraTrack) {
		// eslint-disable-next-line no-console
		console.warn(...warnPrefix, logFriendly(call.instanceID), 'could not publish camera track');
		return;
	}

	call.me.tracks[cameraTrack.trackSid] = cameraTrack;
	// TODO play sound
	call.me.cameraUnmuted = true;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(call.instanceID), 'unmuted camera');
};
