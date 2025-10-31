<script lang="ts">
	import {
		LucideHeadphoneOff,
		LucideHeadphones,
		LucideVideo,
		LucideWallpaper
	} from '@lucide/svelte';
	import { Track } from 'livekit-client';
	import { onDestroy } from 'svelte';

	import { rndWindows, saveRNDWindows } from '$lib/rnd/rndState.svelte';
	import { spawnCallCameraWindow } from '$lib/rnd/spawn/spawnCallCameraWindow';
	import { spawnCallScreenShareWindow } from '$lib/rnd/spawn/spawnCallScreenShareWindow';
	import {
		defaultVoiceSettings,
		saveVoiceSettings,
		voiceSettings
	} from '$lib/sunburn/voiceSettings.svelte';
	import type { CallRemoteParticipant_t } from '$lib/utils/callTypes';

	import AudioTrackPlayer from './AudioTrackPlayer.svelte';
	import Avatar from './Avatar.svelte';

	const {
		owner,
		participant,
		channel,
		windowID
	}: {
		owner: string;
		participant: CallRemoteParticipant_t;
		channel: string;
		windowID: string;
	} = $props();

	let wasLocked = $state(rndWindows[windowID].locked);
	let speaking = $state(false);

	if (!(owner in voiceSettings)) {
		voiceSettings[owner] = {};
	}
	if (!(participant.participant.identity in voiceSettings[owner])) {
		voiceSettings[owner][participant.participant.identity] = defaultVoiceSettings;
	}

	const micTrack = $derived(
		Object.values(participant.tracks).find((track) => track.source === Track.Source.Microphone)
	);
	const cameraTrack = $derived(
		Object.values(participant.tracks).find((track) => track.source === Track.Source.Camera)
	);
	const screenshareTrack = $derived(
		Object.values(participant.tracks).find((track) => track.source === Track.Source.ScreenShare)
	);
	const screenshareAudioTrack = $derived(
		Object.values(participant.tracks).find(
			(track) => track.source === Track.Source.ScreenShareAudio
		)
	);
	const micUnmuted = $derived(participant.micUnmuted);

	participant.participant.on('isSpeakingChanged', (s) => (speaking = s));

	onDestroy(() => {
		participant.participant.removeAllListeners();
	});
</script>

<div class="flex h-[99%] items-stretch justify-start gap-2">
	<div class="flex flex-col items-center justify-center gap-2">
		<!-- TODO tooltip username with mute indicator in tooltip -->
		<div class={['relative size-8', !micUnmuted && 'scale-80 opacity-50']}>
			<Avatar client={owner} user={participant.participant.identity} />
			<div
				class={[
					'absolute top-0 left-0 box-border h-full w-full rounded-box',
					speaking && 'border-2 border-base-content'
				]}
			></div>
		</div>
		<div class="flex shrink grow items-stretch">
			<input
				type="range"
				class={[
					'range-vertical h-auto min-h-4 range-xs',
					voiceSettings[owner][participant.participant.identity].muted && 'opacity-50'
				]}
				min={0}
				max={100}
				bind:value={voiceSettings[owner][participant.participant.identity].micVolume}
				onchange={() => saveVoiceSettings()}
				onpointerdown={() => {
					wasLocked = rndWindows[windowID].locked;
					rndWindows[windowID].locked = true;
					saveRNDWindows();
				}}
				onpointerup={() => {
					rndWindows[windowID].locked = wasLocked;
					saveRNDWindows();
				}}
			/>
		</div>
		<button
			class={[
				'btn btn-square btn-sm',
				voiceSettings[owner][participant.participant.identity].muted && 'btn-accent'
			]}
			title={voiceSettings[owner][participant.participant.identity].muted
				? 'Muted for me'
				: 'Unmuted for me'}
			onclick={() => {
				voiceSettings[owner][participant.participant.identity].muted =
					!voiceSettings[owner][participant.participant.identity].muted;
				saveVoiceSettings();
			}}
		>
			{#if voiceSettings[owner][participant.participant.identity].muted}
				<LucideHeadphoneOff size="1rem" />
			{:else}
				<LucideHeadphones size="1rem" />
			{/if}
		</button>
		<button
			class="btn btn-square btn-sm"
			title="View Camera"
			onclick={() =>
				spawnCallCameraWindow(
					owner,
					channel,
					participant.participant.identity,
					cameraTrack,
					windowID
				)}
		>
			<LucideVideo size="1rem" />
		</button>
		<button
			class="btn btn-square btn-sm"
			title="View Screenshare"
			onclick={() =>
				spawnCallScreenShareWindow(
					owner,
					channel,
					participant.participant.identity,
					screenshareTrack,
					screenshareAudioTrack,
					windowID
				)}
		>
			<LucideWallpaper size="1rem" />
		</button>

		{#if micTrack}
			<AudioTrackPlayer
				volume={voiceSettings[owner][participant.participant.identity].muted
					? 0
					: voiceSettings[owner][participant.participant.identity].micVolume}
				track={micTrack}
			/>
		{/if}
	</div>
</div>
