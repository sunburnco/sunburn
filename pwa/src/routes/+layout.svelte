<script lang="ts">
	import './layout.css';
	import './katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { LucideMenu } from '@lucide/svelte';
	import { Track } from 'livekit-client';
	import { themeChange } from 'theme-change';

	import { page } from '$app/state';
	import AudioTrackPlayer from '$lib/components/AudioTrackPlayer.svelte';
	import { applicationStart } from '$lib/sunburn/applicationStart';
	import { call, type CallUserID_t } from '$lib/sunburn/call.svelte';
	import { callVolumes } from '$lib/utils/call/callVolumes.svelte';

	import DrawerContents from './DrawerContents.svelte';

	let { children } = $props();

	themeChange(false);
	applicationStart();

	const isChannel = $derived(Boolean(page.params.channelID) || Boolean(page.params.dmID));

	const micTrackIDs = $derived.by(() => {
		const tracks: Record<CallUserID_t, string> = {};
		for (const participantID of Object.keys(call.roomParticipants)) {
			if (!call.roomParticipants[participantID]) {
				continue;
			}
			for (const trackID of Object.keys(call.roomParticipants[participantID].tracks)) {
				if (
					call.roomParticipants[participantID].tracks[trackID].source === Track.Source.Microphone
				) {
					tracks[participantID] = trackID;
				}
			}
		}

		return tracks;
	});
</script>

{#snippet ParticipantMicTrack(participantID: CallUserID_t, trackID: string)}
	<AudioTrackPlayer
		volume={callVolumes[participantID] ?? 100}
		track={call.roomParticipants[participantID].tracks[trackID]}
	/>
{/snippet}

<svelte:head>
	<title>Sunburn</title>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<!-- TODO use env() and CSS safe areas -->
<div class="drawer grow md:drawer-open">
	<input id="rootDrawerInput" type="checkbox" class="drawer-toggle" />
	<div
		class={[
			'drawer-content flex h-dvh flex-col items-center justify-center bg-base-300',
			!isChannel && 'p-1',
		]}
	>
		{@render children()}
		<div class="absolute top-0 left-0">
			<label for="rootDrawerInput" class="drawer-button btn btn-square btn-ghost btn-sm md:hidden">
				<LucideMenu class="size-4" />
			</label>
		</div>
	</div>
	<div class="drawer-side">
		<label for="rootDrawerInput" aria-label="close sidebar" class="drawer-overlay"></label>
		<DrawerContents />
	</div>
</div>

{#each Object.keys(micTrackIDs) as participantID (participantID)}
	{@render ParticipantMicTrack(participantID, micTrackIDs[participantID])}
{/each}
