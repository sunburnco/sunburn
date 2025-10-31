<script lang="ts">
	import { LucideEyeOff, LucideLoaderCircle } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	import AudioTrackPlayer from '$lib/components/AudioTrackPlayer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import VideoTrackPlayer from '$lib/components/VideoTrackPlayer.svelte';
	import {
		defaultVoiceSettings,
		saveVoiceSettings,
		voiceSettings
	} from '$lib/sunburn/voiceSettings.svelte';
	import { username } from '$lib/utils/username';

	import {
		closeWindowAndChildren,
		rndWindows,
		saveRNDWindows,
		type TypeScreenShareVolatileData_t,
		volatileWindowData
	} from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const {
		owner,
		channel: _channel,
		user,
		windowID
	}: {
		owner: string;
		channel: string;
		user: string;
		windowID: string;
	} = $props();

	let wasLocked = $state(false);

	if (!(owner in voiceSettings)) {
		voiceSettings[owner] = {};
	}

	if (!(user in voiceSettings[owner])) {
		voiceSettings[owner][user] = defaultVoiceSettings;
	}

	const videoTrack = $derived(
		(volatileWindowData[windowID] as TypeScreenShareVolatileData_t)?.videoTrack
	);
	const audioTrack = $derived(
		(volatileWindowData[windowID] as TypeScreenShareVolatileData_t)?.audioTrack
	);

	// TODO can we update this?
	let aspect = $state(16 / 9);

	$effect(() => {
		videoTrack?.setSubscribed(true);
		audioTrack?.setSubscribed(true);
	});

	onDestroy(() => {
		videoTrack?.setSubscribed(false);
		audioTrack?.setSubscribed(false);
		delete volatileWindowData[windowID];
	});
</script>

<WindowBase slim>
	<div class="flex h-full w-full items-stretch">
		<div
			class="flex shrink-0 flex-col justify-center gap-2 overflow-x-hidden overflow-y-auto border-r border-base-content/50 bg-base-100 p-3"
		>
			<div class="size-10">
				<Avatar client={owner} {user} />
			</div>
			<div class="divider my-0"></div>
			<input
				type="range"
				class="range-vertical h-auto min-h-4 self-center range-sm"
				min={0}
				max={100}
				bind:value={voiceSettings[owner][user].screenshareVolume}
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
			<button
				class="btn btn-square btn-primary"
				title="Stop Watching"
				onclick={() => closeWindowAndChildren(windowID)}
			>
				<LucideEyeOff size="1.25rem" />
			</button>
		</div>
		<div class="flex h-full grow justify-center overflow-hidden">
			<div class="flex h-full max-w-full items-center" style={`aspect-ratio:${aspect};`}>
				<div
					class="flex max-h-full w-full items-center justify-center"
					style={`aspect-ratio:${aspect};`}
				>
					{#if videoTrack}
						<VideoTrackPlayer track={videoTrack} />
						{#if audioTrack}
							<AudioTrackPlayer
								track={audioTrack}
								volume={voiceSettings[owner][user].screenshareVolume}
							/>
						{/if}
					{:else}
						<div class="flex flex-col items-center justify-center gap-2">
							<div class="aspect-square max-w-12">
								<div class="size-12">
									<Avatar client={owner} {user} />
								</div>
							</div>
							<div class="flex items-center gap-2">
								Waiting for {username(owner, user)}
								<LucideLoaderCircle size="1rem" class="inline animate-spin" />
							</div>
							<div class="text-xs">Are you connected to the call?</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</WindowBase>
