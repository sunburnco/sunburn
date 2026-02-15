import {
	createLocalAudioTrack,
	LocalTrackPublication,
	MediaDeviceFailure,
	Track,
} from 'livekit-client';

import { CompoundProcessor } from '$lib/streamProcessors/compound';
import { call } from '$lib/sunburn/call.svelte';

import { debugPrefix, errorPrefix, warnPrefix } from '../logPrefixes';
import { logFriendly } from '../username';

export const unmuteMic = async () => {
	if (!call.me) {
		return;
	}

	try {
		let localMicTrack: LocalTrackPublication | undefined = undefined;
		let existingMicTrack = false;
		for (const trackID of Object.keys(call.me.tracks)) {
			const track = call.me.tracks[trackID];
			if (!track) {
				continue;
			}

			if (track.source === Track.Source.Microphone) {
				existingMicTrack = true;
				await track.unmute();
				break;
			}
		}

		if (!existingMicTrack) {
			const processor = new CompoundProcessor(call.instanceID, {
				// TODO replace with local settings
				speexEnabled: false,
				rnNoiseEnabled: true,
				noiseGateEnabled: false,
				gain: 1,
				noiseGateCloseThreshold: -50,
				noiseGateOpenThreshold: -45,
				noiseGateHoldMS: 150,
			});

			const micTrack = await createLocalAudioTrack();
			micTrack.setProcessor(processor);

			localMicTrack = await call.me.participant.publishTrack(micTrack);

			if (!localMicTrack) {
				// eslint-disable-next-line no-console
				console.warn(...warnPrefix, logFriendly(call.instanceID), 'could not publish mic track');
				return;
			}

			call.me.tracks[localMicTrack.trackSid] = localMicTrack;
		}

		// TODO play sound
		call.me.micUnmuted = true;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(call.instanceID), 'unmuted mic');
	} catch (err) {
		switch (MediaDeviceFailure.getFailure(err)) {
			case MediaDeviceFailure.PermissionDenied:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish mic track because user denied permission to access\n',
					err,
				);
				break;
			case MediaDeviceFailure.NotFound:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish mic track because no suitable devices were found\n',
					err,
				);
				break;
			case MediaDeviceFailure.DeviceInUse:
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					logFriendly(call.instanceID),
					'could not publish mic track because the chosen device is in use by another program or process\n',
					err,
				);
				break;
			default:
				// eslint-disable-next-line no-console
				console.error(...errorPrefix, logFriendly(call.instanceID), 'unknown err\n', err);
				break;
		}
		return;
	}
};
