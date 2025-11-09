<script lang="ts">
	import {
		LucideLoaderCircle,
		LucideMic,
		LucideMicOff,
		LucideMonitorX,
		LucidePhoneOff,
		LucideVideo,
		LucideVideoOff,
		LucideWallpaper
	} from '@lucide/svelte';
	import {
		ConnectionState,
		createLocalAudioTrack,
		LocalParticipant,
		LocalTrackPublication,
		MediaDeviceFailure,
		Participant,
		RemoteParticipant,
		RemoteTrackPublication,
		Room,
		setLogLevel,
		Track,
		TrackPublication
	} from 'livekit-client';
	import { DateTime } from 'luxon';
	import { onDestroy, onMount, tick } from 'svelte';

	import CallParticipant from '$lib/components/CallParticipant.svelte';
	import { debugPrefix, errorPrefix, infoPrefix, warnPrefix } from '$lib/logPrefixes';
	import { CompoundProcessor } from '$lib/streamProcessors/compound';
	import { sunburn } from '$lib/sunburn.svelte';
	import { localSettings } from '$lib/sunburn/localSettings.svelte';
	import { type CallLocalParticipant_t, type CallParticipants_t } from '$lib/utils/callTypes';
	import { handleAtHost, logFriendly } from '$lib/utils/username';

	import {
		rndWindows,
		type TypeCallCameraVolatileData_t,
		type TypeScreenShareVolatileData_t,
		volatileWindowData
	} from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const {
		owner,
		channel,
		windowID
	}: {
		owner: string;
		channel: string;
		windowID: string;
	} = $props();

	let room = $state<Room | null>(null);
	let roomState: ConnectionState = $state(ConnectionState.Disconnected);
	let token = $state('');
	let tokenValidUntil = $state(DateTime.now());
	let lkBaseURL = $state('');

	let roomMe = $state<CallLocalParticipant_t | null>(null);
	let roomParticipants = $state<CallParticipants_t>({});

	const processor = new CompoundProcessor(owner, localSettings.compoundProcessor);
	$effect(() =>
		processor.setSpeexOptions({ enabled: localSettings.compoundProcessor.speexEnabled })
	);
	$effect(() =>
		processor.setRNNoiseOptions({ enabled: localSettings.compoundProcessor.rnNoiseEnabled })
	);
	$effect(() =>
		processor.setNoiseGateOptions({
			enabled: localSettings.compoundProcessor.noiseGateEnabled,
			closeThreshold: localSettings.compoundProcessor.noiseGateCloseThreshold,
			openThreshold: localSettings.compoundProcessor.noiseGateOpenThreshold,
			holdMS: localSettings.compoundProcessor.noiseGateHoldMS
		})
	);
	$effect(() => {
		processor.setGainOptions({
			gain: localSettings.compoundProcessor.gain
		});
	});

	const cameraWindowID = (p: Participant) => `${windowID}_${p.identity}_camera`;
	const cameraWindowOpen = (p: Participant) => cameraWindowID(p) in rndWindows;

	const screenShareWindowID = (p: Participant) => `${windowID}_${p.identity}_screenshare`;
	const screenShareWindowOpen = (p: Participant) => screenShareWindowID(p) in rndWindows;

	const onConnectionStateChanged = (state: ConnectionState) => {
		roomState = state;

		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(owner),
			'call',
			channel,
			'connection state changed to',
			state
		);
	};
	const onTrackPublished = (
		publication: RemoteTrackPublication,
		participant: RemoteParticipant
	) => {
		roomParticipants[participant.identity].tracks[publication.trackSid] = publication;

		if (publication.source === Track.Source.Microphone) {
			publication.setSubscribed(true);
		}

		if (cameraWindowOpen(participant)) {
			publication.setSubscribed(true);
		}

		if (screenShareWindowOpen(participant)) {
			publication.setSubscribed(true);
		}
	};
	const onTrackUnpublished = (
		publication: RemoteTrackPublication,
		participant: RemoteParticipant
	) => {
		delete roomParticipants[participant.identity]?.tracks[publication.trackSid];

		if (cameraWindowOpen(participant)) {
			delete volatileWindowData[cameraWindowID(participant)];
		}

		if (screenShareWindowOpen(participant)) {
			delete volatileWindowData[screenShareWindowID(participant)];
		}
	};
	const onTrackSubscriptionStatusChanged = (
		publication: RemoteTrackPublication,
		status: TrackPublication.SubscriptionStatus,
		participant: RemoteParticipant
	) => {
		switch (status) {
			case TrackPublication.SubscriptionStatus.Subscribed:
				delete roomParticipants[participant.identity].tracks[publication.trackSid];
				// TODO this seems hacky -- should we write a LK client with Svelte reactivity?
				tick().then(
					() => (roomParticipants[participant.identity].tracks[publication.trackSid] = publication)
				);

				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(owner),
					'subscribe to',
					handleAtHost(owner, participant.identity),
					publication.source,
					'stream'
				);

				switch (publication.source) {
					case Track.Source.Camera:
						roomParticipants[participant.identity].cameraUnmuted = !publication.isMuted;
						break;
					case Track.Source.Microphone:
						roomParticipants[participant.identity].micUnmuted = !publication.isMuted;
						break;
				}

				if (
					publication.source === Track.Source.Camera
					// && cameraWindowOpen(participant)
				) {
					delete volatileWindowData[cameraWindowID(participant)];
					tick().then(() => {
						volatileWindowData[cameraWindowID(participant)] = {
							type: 'callCamera',
							track: publication,
							cameraMuted: publication.isMuted
						};
					});
				}

				if (
					publication.source === Track.Source.ScreenShare ||
					publication.source === Track.Source.ScreenShareAudio
					// && screenShareWindowOpen(participant)
				) {
					if (!(screenShareWindowID(participant) in volatileWindowData)) {
						volatileWindowData[screenShareWindowID(participant)] = {
							type: 'callScreenShare'
						};
					}

					if (publication.source === Track.Source.ScreenShare) {
						(
							volatileWindowData[screenShareWindowID(participant)] as TypeScreenShareVolatileData_t
						).videoTrack = undefined;
						tick().then(
							() =>
								((
									volatileWindowData[
										screenShareWindowID(participant)
									] as TypeScreenShareVolatileData_t
								).videoTrack = publication)
						);
					}
					if (publication.source === Track.Source.ScreenShareAudio) {
						(
							volatileWindowData[screenShareWindowID(participant)] as TypeScreenShareVolatileData_t
						).audioTrack = undefined;
						tick().then(
							() =>
								((
									volatileWindowData[
										screenShareWindowID(participant)
									] as TypeScreenShareVolatileData_t
								).audioTrack = publication)
						);
					}
				}

				break;
			case TrackPublication.SubscriptionStatus.Desired:
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(owner),
					'desire',
					handleAtHost(owner, participant.identity),
					publication.source,
					'stream'
				);

				break;
			case TrackPublication.SubscriptionStatus.Unsubscribed:
				// delete roomParticipants[participant.identity].tracks[publication.trackSid];

				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(owner),
					'unsubscribe from',
					handleAtHost(owner, participant.identity),
					publication.source,
					'stream'
				);

				if (cameraWindowOpen(participant)) {
					delete volatileWindowData[cameraWindowID(participant)];
				}

				if (screenShareWindowOpen(participant)) {
					delete volatileWindowData[screenShareWindowID(participant)];
				}
				break;
		}
	};
	const onConnected = () => {
		roomParticipants = {};
		if (!room) {
			return;
		}

		roomMe = {
			participant: room.localParticipant,
			tracks: {},
			micUnmuted: false,
			cameraUnmuted: false,
			screenShareActive: false
		};

		for (const p of room.remoteParticipants.values()) {
			roomParticipants[p.identity] = {
				participant: p,
				tracks: {},
				micUnmuted: false,
				cameraUnmuted: false
			};
			for (const track of p.trackPublications.values()) {
				roomParticipants[p.identity].tracks[track.trackSid] = track;

				if (track.source === Track.Source.Microphone) {
					track.setSubscribed(true);
				}

				if (track.source === Track.Source.Camera && cameraWindowOpen(p)) {
					track.setSubscribed(true);
				}

				if (
					(track.source === Track.Source.ScreenShare ||
						track.source === Track.Source.ScreenShareAudio) &&
					screenShareWindowOpen(p)
				) {
					track.setSubscribed(true);
				}
			}
		}
	};
	const onParticipantConnected = (p: RemoteParticipant) => {
		roomParticipants[p.identity] = {
			participant: p,
			tracks: {},
			micUnmuted: false,
			cameraUnmuted: false
		};

		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(owner),
			handleAtHost(owner, p.identity),
			'joined call'
		);
	};
	const onParticipantDisconnected = (p: RemoteParticipant) => {
		delete roomParticipants[p.identity];

		delete volatileWindowData[cameraWindowID(p)];
		delete volatileWindowData[screenShareWindowID(p)];

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(owner), handleAtHost(owner, p.identity), 'left call');
	};
	const onTrackMuteStatusChanged = (publication: TrackPublication, participant: Participant) => {
		if (!participant.isLocal && !publication.isLocal) {
			if (!(participant.identity in roomParticipants)) {
				return;
			}

			switch (publication.source) {
				case Track.Source.Microphone:
					roomParticipants[participant.identity].micUnmuted = !publication.isMuted;
					break;
				case Track.Source.Camera:
					roomParticipants[participant.identity].cameraUnmuted = !publication.isMuted;
					break;
			}

			if (cameraWindowOpen(participant) && cameraWindowID(participant) in volatileWindowData) {
				(
					volatileWindowData[cameraWindowID(participant)] as TypeCallCameraVolatileData_t
				).cameraMuted = publication.isMuted;
			}

			// no screenshare because it's not possible to mute screenshare
		}
	};
	// handle if user presses "stop sharing"
	const onLocalTrackUnpublished = (
		publication: LocalTrackPublication,
		_participant: LocalParticipant
	) => {
		if (publication.source === Track.Source.ScreenShare) {
			stopScreenShare();
		}
	};

	const registerRoomListeners = (r: Room) => {
		r.addListener('connectionStateChanged', onConnectionStateChanged);
		r.addListener('trackPublished', onTrackPublished);
		r.addListener('trackUnpublished', onTrackUnpublished);
		r.addListener('trackSubscriptionStatusChanged', onTrackSubscriptionStatusChanged);
		r.addListener('trackMuted', onTrackMuteStatusChanged);
		r.addListener('trackUnmuted', onTrackMuteStatusChanged);
		r.addListener('connected', onConnected);
		r.addListener('participantConnected', onParticipantConnected);
		r.addListener('participantDisconnected', onParticipantDisconnected);
		r.addListener('localTrackUnpublished', onLocalTrackUnpublished);
	};

	const connect = async () => {
		room?.startAudio();

		if (!room) {
			return;
		}

		try {
			registerRoomListeners(room);

			// TODO fetch URL from server
			await room.connect(lkBaseURL, token, { autoSubscribe: false });

			// eslint-disable-next-line no-console
			console.info(...infoPrefix, logFriendly(owner), 'connected to call', channel);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(owner),
				'error connecting to call',
				channel,
				'\n',
				err
			);
		}
	};

	const disconnect = async () => {
		if (!room) {
			return;
		}

		await room.disconnect();
		room.removeAllListeners();
		roomParticipants = {};
		roomMe = null;

		// eslint-disable-next-line no-console
		console.info(...infoPrefix, logFriendly(owner), 'disconnected from call', channel);
	};

	const unmuteMic = async () => {
		if (!roomMe) {
			return;
		}

		let localMicTrack: LocalTrackPublication | undefined = undefined;
		try {
			const micTrack = await createLocalAudioTrack();

			micTrack.setProcessor(processor);

			localMicTrack = await roomMe.participant.publishTrack(micTrack);
		} catch (err) {
			switch (MediaDeviceFailure.getFailure(err)) {
				case MediaDeviceFailure.PermissionDenied:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish mic track because user denied permission to access\n',
						err
					);
					break;
				case MediaDeviceFailure.NotFound:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish mic track because no suitable devices were found\n',
						err
					);
					break;
				case MediaDeviceFailure.DeviceInUse:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish mic track because the chosen device is in use by another program or process\n',
						err
					);
					break;
				default:
					// eslint-disable-next-line no-console
					console.error(...errorPrefix, logFriendly(owner), 'unknown error', err);
					break;
			}

			return;
		}
		if (!localMicTrack) {
			// eslint-disable-next-line no-console
			console.warn(...warnPrefix, logFriendly(owner), 'could not publish mic track');
			return;
		}

		roomMe.tracks[localMicTrack.trackSid] = localMicTrack;
		// TODO play sound
		roomMe.micUnmuted = true;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(owner), 'unmuted mic');
	};

	const muteMic = async () => {
		if (!roomMe) {
			return;
		}

		for (const trackID of Object.keys(roomMe.tracks)) {
			const track = roomMe.tracks[trackID];

			if (!track) {
				continue;
			}

			if (track.source === Track.Source.Microphone) {
				await track.mute();
				// TODO play sound
				roomMe.micUnmuted = false;

				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, logFriendly(owner), 'muted mic');
			}
		}
	};

	const unmuteCamera = async () => {
		if (!roomMe) {
			return;
		}

		let cameraTrack: LocalTrackPublication | undefined = undefined;
		try {
			cameraTrack = await roomMe.participant.setCameraEnabled(true);
		} catch (err) {
			switch (MediaDeviceFailure.getFailure(err)) {
				case MediaDeviceFailure.PermissionDenied:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish camera track because user denied permission to access\n',
						err
					);
					break;
				case MediaDeviceFailure.NotFound:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish camera track because no suitable devices were found\n',
						err
					);
					break;
				case MediaDeviceFailure.DeviceInUse:
					// eslint-disable-next-line no-console
					console.warn(
						...warnPrefix,
						logFriendly(owner),
						'could not publish camera track because the chosen device is in use by another program or process\n',
						err
					);
					break;
			}

			return;
		}
		if (!cameraTrack) {
			// eslint-disable-next-line no-console
			console.warn(...warnPrefix, logFriendly(owner), 'could not publish camera track');
			return;
		}

		roomMe.tracks[cameraTrack.trackSid] = cameraTrack;
		// TODO play sound
		roomMe.cameraUnmuted = true;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(owner), 'unmuted camera');
	};

	const muteCamera = async () => {
		if (!roomMe) {
			return;
		}

		for (const trackID of Object.keys(roomMe.tracks)) {
			const track = roomMe.tracks[trackID];

			if (!track) {
				continue;
			}

			if (track.source === Track.Source.Camera) {
				await track.mute();
				// TODO play sound
				roomMe.cameraUnmuted = false;

				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, logFriendly(owner), 'muted camera');
			}
		}
	};

	const startScreenShare = async () => {
		if (!roomMe) {
			return;
		}

		// TODO handle permission error
		const tracks = await roomMe.participant.createScreenTracks({
			audio: true,
			contentHint: 'motion',
			selfBrowserSurface: 'include',
			surfaceSwitching: 'include',
			systemAudio: 'include'
		});

		if (tracks.length === 0) {
			// eslint-disable-next-line no-console
			console.warn(...warnPrefix, logFriendly(owner), 'could not create screenshare tracks');
			return;
		}

		for (const track of tracks) {
			const pub = await roomMe.participant.publishTrack(track);
			if (!pub) {
				// eslint-disable-next-line no-console
				console.warn(...warnPrefix, logFriendly(owner), 'could not publish screenshare track');
				continue;
			}
			roomMe.tracks[pub.trackSid] = pub;
		}
		// TODO play sound
		roomMe.screenShareActive = true;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(owner), 'started screenshare');
	};

	const stopScreenShare = async () => {
		if (!roomMe) {
			return;
		}

		roomMe.participant.setScreenShareEnabled(false);
		for (const trackID of Object.keys(roomMe.tracks)) {
			const track = roomMe.tracks[trackID];

			if (!track) {
				return;
			}

			if (
				track.source === Track.Source.ScreenShare ||
				track.source === Track.Source.ScreenShareAudio
			) {
				delete roomMe.tracks[trackID];
			}
		}

		// TODO play sound
		roomMe.screenShareActive = false;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(owner), 'stopped screenshare');
	};

	onMount(async () => {
		try {
			room = new Room();
			// setLogLevel('debug');
			setLogLevel('silent');

			if (!token || tokenValidUntil.diffNow().as('seconds') < 0) {
				const resp = await sunburn.clients[owner].send<{
					token: string;
					expirationUnix: number;
					baseURL: string;
				}>(`/lk/${channel}/token`, { method: 'POST', requestKey: null });
				token = resp.token;
				tokenValidUntil = DateTime.fromMillis(resp.expirationUnix * 1000) as DateTime<true>;
				lkBaseURL = resp.baseURL;
			}

			room.prepareConnection(lkBaseURL, token);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(owner),
				'error fetching token for channel',
				channel,
				'\n',
				err
			);
		}
	});

	onDestroy(() => {
		room?.disconnect();
	});
</script>

<WindowBase slim>
	<div class="flex h-full w-full items-stretch">
		<div
			class="flex shrink-0 flex-col flex-wrap justify-center gap-2 overflow-x-hidden overflow-y-auto border-r border-base-content/50 bg-base-100 p-3"
		>
			<button
				class={['btn btn-square', roomMe?.micUnmuted && 'btn-neutral']}
				title={roomMe?.micUnmuted ? 'Mute Microphone' : 'Unmute Microphone'}
				disabled={roomState !== ConnectionState.Connected}
				onclick={() => {
					if (roomMe?.micUnmuted) {
						muteMic();
					} else {
						unmuteMic();
					}
				}}
			>
				{#if roomMe?.micUnmuted}
					<LucideMic size="1.25rem" />
				{:else}
					<LucideMicOff size="1.25rem" />
				{/if}
			</button>
			<button
				class={['btn btn-square', roomMe?.cameraUnmuted && 'btn-neutral']}
				title={roomMe?.cameraUnmuted ? 'Stop Camera' : 'Start Camera'}
				disabled={roomState !== ConnectionState.Connected}
				onclick={() => {
					if (roomMe?.cameraUnmuted) {
						muteCamera();
					} else {
						unmuteCamera();
					}
				}}
			>
				{#if roomMe?.cameraUnmuted}
					<LucideVideo size="1.25rem" />
				{:else}
					<LucideVideoOff size="1.25rem" />
				{/if}
			</button>
			<button
				class={['btn btn-square', roomMe?.screenShareActive && 'btn-neutral']}
				title={roomMe?.screenShareActive ? 'End screenshare' : 'Start screenshare'}
				disabled={roomState !== ConnectionState.Connected}
				onclick={() => {
					if (roomMe?.screenShareActive) {
						stopScreenShare();
					} else {
						startScreenShare();
					}
				}}
			>
				{#if roomMe?.screenShareActive}
					<LucideMonitorX size="1.25rem" />
				{:else}
					<LucideWallpaper size="1.25rem" />
				{/if}
			</button>
			<button
				class="btn btn-square btn-primary"
				title="Disconnect"
				disabled={roomState === ConnectionState.Disconnected}
				onclick={disconnect}
			>
				<LucidePhoneOff size="1.25rem" />
			</button>
		</div>
		<div class="h-full grow overflow-x-auto">
			{#if roomState === ConnectionState.Disconnected || !room}
				<div class="flex h-full items-center justify-center gap-4">
					<button class="btn btn-primary" onclick={connect} disabled={!token || !room}>
						{#if !token || !room}
							Waiting for token <LucideLoaderCircle size="1rem" class="animate-spin" />
						{:else}
							Connect
						{/if}
					</button>
				</div>
			{:else if roomState === ConnectionState.Connecting}
				<div class="flex h-full items-center justify-center gap-2">
					<div>Connecting</div>
					<LucideLoaderCircle size="1rem" class="inline animate-spin" />
				</div>
			{:else if roomState === ConnectionState.Reconnecting || roomState === ConnectionState.SignalReconnecting}
				<div class="flex h-full items-center justify-center gap-2">
					<div>Reconnecting</div>
					<LucideLoaderCircle size="1rem" class="inline animate-spin" />
				</div>
			{:else if roomState === ConnectionState.Connected}
				<div class="flex h-full items-stretch justify-start gap-2 overflow-y-auto p-2">
					{#each Object.keys(roomParticipants) as participantID (participantID)}
						<CallParticipant
							{owner}
							participant={roomParticipants[participantID]}
							{channel}
							{windowID}
						/>
					{:else}
						<div class="flex flex-col grow justify-center items-center gap-2 p-2">
							<div class="flex w-full justify-center items-center gap-2">
								Connected
								<LucideLoaderCircle size="1rem" class="inline animate-spin" />
							</div>
							<div class="text-xs">It looks like you're the only one here</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</WindowBase>
