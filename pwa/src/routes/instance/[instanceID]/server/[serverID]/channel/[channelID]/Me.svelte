<script lang="ts">
	import {
		LucideEye,
		LucideMic,
		LucideMicOff,
		LucideMonitorUp,
		LucideMonitorX,
		LucideVideo,
		LucideVideoOff,
		LucideWallpaper,
	} from '@lucide/svelte';
	import { Track } from 'livekit-client';
	import { onDestroy, onMount } from 'svelte';

	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { call, type CallTrackID_t, type CallUserID_t } from '$lib/sunburn/call.svelte';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { muteCamera } from '$lib/utils/call/muteCamera';
	import { muteMic } from '$lib/utils/call/muteMic';
	import { startScreenShare } from '$lib/utils/call/startScreenShare';
	import { stopScreenShare } from '$lib/utils/call/stopScreenShare';
	import { unmuteCamera } from '$lib/utils/call/unmuteCamera';
	import { unmuteMic } from '$lib/utils/call/unmuteMic';
	import { nameOrHandle } from '$lib/utils/username';

	type Props_t = {
		setFocusedTracks: (
			participantID: CallUserID_t,
			videoID: CallTrackID_t,
			audio?: CallTrackID_t,
		) => void;
	};

	let { setFocusedTracks }: Props_t = $props();

	let speaking = $state(false);
	onMount(() => {
		if (!call.me) {
			return;
		}

		call.me.participant.on('isSpeakingChanged', (s) => (speaking = s));
	});

	onDestroy(() => {
		call.me?.participant.removeAllListeners();
	});
</script>

<div
	class="box-border flex flex-col-reverse items-center gap-2 rounded-box *:shadow-lg"
	title={nameOrHandle(call.instanceID, sunburn[call.instanceID].myID, true)}
>
	<div
		class={[
			'rounded-box',
			!call.me?.micUnmuted && 'scale-85 opacity-70 grayscale',
			speaking && 'outline-2 outline-primary',
		]}
	>
		<PBAvatar
			color="base-300"
			size="xl"
			instanceID={call.instanceID}
			userID={sunburn[call.instanceID].myID}
			url={sunburn[call.instanceID].users[sunburn[call.instanceID].myID].avatar}
			name={nameOrHandle(call.instanceID, sunburn[call.instanceID].myID)}
		/>
	</div>
	<button
		class={[
			'group/btn btn hidden btn-square btn-sm group-hover:flex group-focus:flex',
			call.me?.micUnmuted && 'btn-accent',
		]}
		onclick={call.me?.micUnmuted ? muteMic : unmuteMic}
		title={call.me?.micUnmuted ? 'Mute (you are unmuted)' : 'Unmute (you are muted)'}
	>
		<div class="group-disabled/btn:opacity-70">
			{#if call.me?.micUnmuted}
				<LucideMic class="size-5" />
			{:else}
				<LucideMicOff class="size-5 stroke-base-content" />
			{/if}
		</div>
	</button>
	<button
		class={[
			'group/btn btn hidden btn-square btn-sm group-hover:flex group-focus:flex',
			call.me?.cameraUnmuted && 'btn-accent',
		]}
		onclick={call.me?.cameraUnmuted ? muteCamera : unmuteCamera}
		title={call.me?.cameraUnmuted
			? 'Stop camera (your camera is on)'
			: 'Start camera (your camera is off)'}
	>
		<div class="group-disabled/btn:opacity-70">
			{#if call.me?.cameraUnmuted}
				<LucideVideo class="size-5" />
			{:else}
				<LucideVideoOff class="size-5 stroke-base-content" />
			{/if}
		</div>
	</button>
	{#if call.me?.cameraUnmuted}
		<button
			class="group/btn group-focus:flex, btn hidden btn-square btn-sm btn-secondary group-hover:flex"
			onclick={() => {
				if (!call.me) {
					return;
				}
				const focusedVideoTrack = Object.values(call.me.tracks).find(
					(t) => t.source === Track.Source.Camera,
				);

				setFocusedTracks(
					sunburn[call.instanceID].myID,
					focusedVideoTrack ? focusedVideoTrack.trackSid : '',
					'',
				);
			}}
			title="Preview your camera"
		>
			<div class="group-disabled/btn:opacity-70">
				<LucideEye class="size-5 stroke-base-content" />
			</div>
		</button>
	{/if}
	<button
		class={[
			'group/btn btn hidden btn-square btn-sm group-hover:flex group-focus:flex',
			call.me?.screenShareUnmuted && 'btn-accent',
		]}
		onclick={call.me?.screenShareUnmuted ? stopScreenShare : startScreenShare}
		title={call.me?.screenShareUnmuted
			? 'Stop sharing your screen (your screen is being shared)'
			: 'Begin sharing your screen (your screen is not being shared)'}
	>
		<div class="group-disabled/btn:opacity-70">
			{#if call.me?.screenShareUnmuted}
				<LucideMonitorUp class="size-5" />
			{:else}
				<LucideMonitorX class="size-5 stroke-base-content" />
			{/if}
		</div>
	</button>
	{#if call.me?.screenShareUnmuted}
		<button
			class="group/btn group-focus:flex, btn hidden btn-square btn-sm btn-secondary group-hover:flex"
			onclick={() => {
				if (!call.me) {
					return;
				}
				const focusedVideoTrack = Object.values(call.me.tracks).find(
					(t) => t.source === Track.Source.ScreenShare,
				);
				const focusedAudioTrack = Object.values(call.me.tracks).find(
					(t) => t.source === Track.Source.ScreenShareAudio,
				);

				setFocusedTracks(
					sunburn[call.instanceID].myID,
					focusedVideoTrack ? focusedVideoTrack.trackSid : '',
					focusedAudioTrack ? focusedAudioTrack.trackSid : '',
				);
			}}
			title="Preview your screen share"
		>
			<div class="group-disabled/btn:opacity-70">
				<LucideWallpaper class="size-5 stroke-base-content" />
			</div>
		</button>
	{/if}
</div>
