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

	import AudioTrackPlayer from '#lib/components/AudioTrackPlayer.svelte';
	import { applicationStart } from '#lib/sunburn/applicationStart.ts';
	import { call, type CallUserID_t } from '#lib/sunburn/call.svelte.ts';
	import { localSettings } from '#lib/sunburn/localSettings.svelte.ts';
	import { callVolumes } from '#lib/utils/call/callVolumes.svelte.ts';
	import { processor } from '#lib/utils/call/processor.ts';

	import DrawerContents from './DrawerContents.svelte';

	let { children } = $props();

	themeChange(false);
	applicationStart();

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

	$effect(() => {
		processor.setNoiseGateOptions({
			enabled: localSettings.audio.settings.noiseGateEnabled.boolValue,
			closeThreshold: localSettings.audio.settings.noiseGateCloseThreshold.numberValue,
			openThreshold: localSettings.audio.settings.noiseGateOpenThreshold.numberValue,
			holdMS: localSettings.audio.settings.noiseGateOpenMS.numberValue,
		});
	});
	$effect(() => {
		processor.setSpeexOptions({ enabled: localSettings.audio.settings.speexEnabled.boolValue });
	});
	$effect(() => {
		processor.setRNNoiseOptions({ enabled: localSettings.audio.settings.rnNoiseEnabled.boolValue });
	});
	$effect(() => {
		processor.setGainOptions({ gain: localSettings.audio.settings.gain.numberValue });
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
<div class="flex h-dvh grow flex-row-reverse items-stretch">
	<div
		class={[
			'flex h-dvh min-w-0 flex-1 flex-col items-center justify-center',
			'border-base-content/50 bg-base-300 sm:border-0',
			localSettings.appearance.settings.infoBar.stringValue === 'top' ? 'border-b' : 'border-t',
		]}
	>
		{@render children()}
		<label
			class={[
				'absolute left-0 w-full cursor-pointer md:hidden',
				localSettings.appearance.settings.infoBar.stringValue === 'top' ? 'top-0' : 'bottom-0',
			]}
			aria-label="open drawer"
		>
			<button
				class="btn btn-square btn-ghost btn-sm"
				style="anchor-name:--drawer-anchor"
				popovertarget="drawer-popover"
			>
				<LucideMenu class="size-4" />
			</button>

			<div
				popover
				id="drawer-popover"
				style="position-anchor:--drawer-anchor"
				class={['h-dvh w-96 max-w-[75dvw] shadow-lg', 'drawerPopover']}
			>
				<DrawerContents />
			</div>
		</label>
	</div>
	<div class="hidden md:block">
		<DrawerContents />
	</div>
</div>

{#each Object.keys(micTrackIDs) as participantID (participantID)}
	{@render ParticipantMicTrack(participantID, micTrackIDs[participantID])}
{/each}

<style>
	/* Thank you https://pawelgrzybek.com/popover-element-entry-and-exit-animations-in-a-few-lines-of-css/ */
	.drawerPopover {
		transition:
			transform 200ms cubic-bezier(0.33, 1, 0.68, 1),
			display 200ms allow-discrete,
			overlay 200ms allow-discrete;

		transform: translateX(-100%);

		&::backdrop {
			transition: opacity 200ms cubic-bezier(0.33, 1, 0.68, 1);
			background-color: #000000;
			opacity: 0;
		}

		&:popover-open {
			transform: translateX(0);

			@starting-style {
				& {
					transform: translateX(-100%);
				}
			}

			&::backdrop {
				opacity: 0.3;
			}
		}
	}

	@starting-style {
		.drawerPopover:popover-open::backdrop {
			opacity: 0;
		}
	}
</style>
