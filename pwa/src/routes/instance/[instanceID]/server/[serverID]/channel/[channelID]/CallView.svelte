<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import {
		ConnectionState,
		type RemoteTrackPublication,
		Room,
		setLogLevel,
		type TrackPublication,
	} from 'livekit-client';
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import AudioTrackPlayer from '$lib/components/AudioTrackPlayer.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import VideoTrackPlayer from '$lib/components/VideoTrackPlayer.svelte';
	import { call, type CallTrackID_t, type CallUserID_t } from '$lib/sunburn/call.svelte';
	import { type Channel_t, type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { callVolumes } from '$lib/utils/call/callVolumes.svelte';
	import { connect } from '$lib/utils/call/connect';
	import { disconnect } from '$lib/utils/call/disconnect';
	import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly, nameOrHandle } from '$lib/utils/username';

	import CallParticipant from './CallParticipant.svelte';
	import Me from './Me.svelte';

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');
	const channelID = $derived(page.params.channelID || '');

	let focusedParticipantID = $state('');
	let focusedVideoTrackID = $state('');
	let focusedAudioTrackID = $state('');
	const focusedVideoTrack = $derived.by(() => {
		if (call.roomState !== ConnectionState.Connected) {
			return;
		}

		if (
			!focusedParticipantID ||
			(!(focusedParticipantID in call.roomParticipants) &&
				focusedParticipantID !== sunburn[call.instanceID].myID) ||
			!focusedVideoTrackID
		) {
			return null;
		}

		if (call.me && focusedParticipantID === sunburn[call.instanceID].myID) {
			return call.me.tracks[focusedVideoTrackID];
		}

		return call.roomParticipants[focusedParticipantID].tracks[focusedVideoTrackID];
	});
	const focusedAudioTrack = $derived.by(() => {
		if (call.roomState !== ConnectionState.Connected) {
			return;
		}

		if (
			!focusedParticipantID ||
			(!(focusedParticipantID in call.roomParticipants) &&
				focusedParticipantID !== sunburn[call.instanceID].myID) ||
			!focusedAudioTrackID
		) {
			return null;
		}

		if (call.me && focusedParticipantID === sunburn[call.instanceID].myID) {
			return call.me.tracks[focusedAudioTrackID];
		}

		return call.roomParticipants[focusedParticipantID].tracks[focusedAudioTrackID];
	});

	const setFocusedTracks = (
		participantID: CallUserID_t,
		videoID: CallTrackID_t,
		audioID: CallTrackID_t = '',
	) => {
		if (focusedParticipantID === participantID && focusedVideoTrackID === videoID) {
			// toggle off
			focusedParticipantID = '';
			focusedVideoTrackID = '';
			focusedAudioTrackID = '';
			return;
		}

		if (focusedVideoTrack && !focusedVideoTrack.isLocal) {
			(focusedVideoTrack as RemoteTrackPublication).setSubscribed(false);
		}
		if (focusedAudioTrack && !focusedAudioTrack.isLocal) {
			(focusedAudioTrack as RemoteTrackPublication).setSubscribed(false);
		}

		focusedParticipantID = participantID;
		focusedVideoTrackID = videoID;
		focusedAudioTrackID = audioID;
	};

	$effect(() => {
		if (focusedVideoTrack && !focusedVideoTrack.isLocal) {
			(focusedVideoTrack as RemoteTrackPublication).setSubscribed(true);
		}
		if (focusedAudioTrack && !focusedAudioTrack.isLocal) {
			(focusedAudioTrack as RemoteTrackPublication).setSubscribed(true);
		}
	});

	const load = async (
		iID: Instance_t['id'],
		cID: Channel_t['record']['id'],
	): Promise<{ room: Room; token: string; validUntil: DateTime; baseURL: string } | null> => {
		try {
			let _room = new Room();
			setLogLevel('silent');

			let _baseURL = '';
			let _token = '';
			let _validUntil = DateTime.fromMillis(0);

			const resp = await sunburn[iID].pb.send<{
				token: string;
				expirationUnix: number;
				baseURL: string;
			}>(`/lk/${cID}/token`, { method: 'POST', requestKey: null });
			_token = resp.token;
			_validUntil = DateTime.fromMillis(resp.expirationUnix * 1000) as DateTime<true>;
			_baseURL = resp.baseURL;

			_room.prepareConnection(_baseURL, _token);

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(iID), 'preparing call for channel', cID);

			// TODO local setting to allow instant connect

			return {
				room: _room,
				baseURL: _baseURL,
				token: _token,
				validUntil: _validUntil,
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(iID),
				'error fetching token for channel',
				cID,
				'\n',
				err,
			);
			return null;
		}
	};

	const loadResult = $derived.by(() => load(instanceID, channelID));

	const startConnecting = async () => {
		const ret = await loadResult;
		if (!ret) {
			return;
		}

		await disconnect();

		call.me = null;
		call.roomState = ConnectionState.Disconnected;
		call.roomParticipants = {};
		call.instanceID = instanceID;
		call.serverID = serverID;
		call.channelID = channelID;

		call.room = ret.room;
		call.roomToken = ret.token;
		call.roomTokenValidUntil = ret.validUntil;
		call.lkBaseURL = ret.baseURL;

		connect();
	};
</script>

<div class="dots-300 relative size-full max-h-full">
	<div class="size-full max-h-full bg-base-300/60 shadow-[inset_0_0_2rem_rgba(0,0,0,0.5)]">
		{#if call.roomState === ConnectionState.Disconnected || call.instanceID !== instanceID || call.serverID !== serverID || call.channelID !== channelID}
			<div class="flex size-full flex-col items-center justify-center">
				<div
					class="flex flex-col items-center justify-center gap-2 rounded-box bg-base-200 p-4 text-base-content shadow-lg"
				>
					<div class="font-display text-lg font-bold">Disconnected</div>
					<button class="btn btn-primary" onclick={startConnecting}>Connect</button>
				</div>
			</div>
		{:else if call.roomState === ConnectionState.Connecting || call.roomState === ConnectionState.Reconnecting || call.roomState === ConnectionState.SignalReconnecting}
			<div class="flex size-full items-center justify-center">
				<div
					class="flex items-center justify-center gap-2 rounded-box bg-base-200 p-4 font-display text-lg font-bold text-base-content"
				>
					Connecting <LucideLoaderCircle class="size-5 animate-spin" />
				</div>
			</div>
		{:else if call.roomState === ConnectionState.Connected}
			<div class="relative flex size-full flex-col items-stretch">
				<div
					class="flex size-full max-h-full max-w-full items-center justify-center overflow-hidden"
				>
					{#if focusedParticipantID && focusedVideoTrack}
						<div
							class="m-4 rounded-box border border-base-content/50 bg-base-200 object-contain p-4 shadow-lg *:rounded-box"
						>
							{#if focusedParticipantID in call.roomParticipants}
								{@render ContentRenderer(
									call.roomParticipants[focusedParticipantID].tracks[focusedVideoTrackID],
									focusedAudioTrackID
										? (call.roomParticipants[focusedParticipantID].tracks[focusedAudioTrackID] ??
												null)
										: null,
								)}
							{:else if call.me && focusedParticipantID === sunburn[call.instanceID].myID}
								{@render ContentRenderer(
									call.me.tracks[focusedVideoTrackID],
									focusedAudioTrackID ? (call.me.tracks[focusedAudioTrackID] ?? null) : null,
								)}
							{/if}
							<div class="mt-2 flex items-center gap-2">
								<PBAvatar
									size="lg"
									color="base-200"
									instanceID={call.instanceID}
									userID={focusedParticipantID}
									url={sunburn[call.instanceID].users[focusedParticipantID].avatar}
									name={nameOrHandle(call.instanceID, focusedParticipantID)}
								/>
								<p class="font-bold">
									{nameOrHandle(call.instanceID, focusedParticipantID, true)}
								</p>
							</div>
						</div>
					{/if}
				</div>
				<div class="group absolute bottom-0 left-0 max-w-full" tabindex="-1">
					<div class="flex items-end gap-2 overflow-x-auto p-2 px-4">
						<Me {setFocusedTracks} />
						{#each Object.keys(call.roomParticipants) as participantID (participantID)}
							<CallParticipant {participantID} {setFocusedTracks} />
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet ContentRenderer(videoTrack: TrackPublication, audioTrack: TrackPublication | null)}
	<VideoTrackPlayer track={videoTrack} />
	{#if audioTrack}
		<AudioTrackPlayer track={audioTrack} volume={callVolumes['focused']} />
	{/if}
{/snippet}
