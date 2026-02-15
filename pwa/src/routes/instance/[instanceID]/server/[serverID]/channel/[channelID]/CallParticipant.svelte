<script lang="ts">
	import { LucideCamera, LucideWallpaper } from '@lucide/svelte';
	import { Track } from 'livekit-client';
	import { onDestroy, onMount } from 'svelte';

	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { call, type CallTrackID_t, type CallUserID_t } from '$lib/sunburn/call.svelte';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { callVolumes } from '$lib/utils/call/callVolumes.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	type Props_t = {
		participantID: CallUserID_t;
		setFocusedTracks: (
			participantID: CallUserID_t,
			videoID: CallTrackID_t,
			audio?: CallTrackID_t,
		) => void;
	};

	let { participantID, setFocusedTracks }: Props_t = $props();

	let speaking = $state(false);
	const participant = $derived(call.roomParticipants[participantID]);
	const micUnmuted = $derived(participant.micUnmuted);

	const cameraTrack = $derived(
		Object.values(participant.tracks).find((t) => t.source === Track.Source.Camera),
	);
	const ssVideoTrack = $derived(
		Object.values(participant.tracks).find((t) => t.source === Track.Source.ScreenShare),
	);
	const ssAudioTrack = $derived(
		Object.values(participant.tracks).find((t) => t.source === Track.Source.ScreenShareAudio),
	);

	onMount(() => {
		if (!(participantID in sunburn[call.instanceID].users)) {
			fetchUser(call.instanceID, participantID, null);
		}
		participant.participant.on('isSpeakingChanged', (s) => (speaking = s));
	});

	onDestroy(() => {
		participant.participant.removeAllListeners();
	});
</script>

{#if participantID in sunburn[call.instanceID].users}
	<div class="box-border flex flex-col-reverse items-center gap-2 rounded-box *:shadow-lg">
		<div
			class={[
				'rounded-box',
				!micUnmuted && 'scale-85 opacity-70 grayscale',
				speaking && 'outline-2 outline-primary',
			]}
			title={nameOrHandle(call.instanceID, participantID, true)}
		>
			<PBAvatar
				color="base-300"
				size="xl"
				instanceID={call.instanceID}
				userID={participantID}
				url={sunburn[call.instanceID].users[participantID].avatar}
				name={nameOrHandle(call.instanceID, participantID)}
			/>
		</div>
		{#if cameraTrack}
			<button
				class="group/btn btn hidden btn-square btn-sm group-hover:flex group-focus:flex"
				onclick={() => {
					setFocusedTracks(participantID, cameraTrack.trackSid);
				}}
				title={`Focus ${nameOrHandle(call.instanceID, participantID)}'s camera`}
			>
				<LucideCamera class="size-5" />
			</button>
		{/if}
		{#if ssVideoTrack}
			<button
				class="group/btn btn hidden btn-square btn-sm group-hover:flex group-focus:flex"
				onclick={() => {
					setFocusedTracks(participantID, ssVideoTrack.trackSid, ssAudioTrack?.trackSid);
				}}
				title={`Focus ${nameOrHandle(call.instanceID, participantID)}'s screen`}
			>
				<LucideWallpaper class="size-5" />
			</button>
		{/if}
		<div
			class="hidden h-28 w-full rounded-box bg-base-200 p-1.5 shadow-lg group-hover:flex group-focus:flex"
		>
			<input
				min={0}
				max={100}
				step={1}
				bind:value={callVolumes[participantID]}
				type="range"
				class="range-vertical h-auto range-sm"
			/>
		</div>
	</div>
{/if}
