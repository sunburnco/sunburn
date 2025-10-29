<script lang="ts">
	import { LucideEyeOff, LucideLoaderCircle } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	import Avatar from '$lib/components/Avatar.svelte';
	import VideoTrackPlayer from '$lib/components/VideoTrackPlayer.svelte';
	import { username } from '$lib/utils/username';

	import {
		closeWindowAndChildren,
		type TypeCallCameraVolatileData_t,
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

	const track = $derived(
		(volatileWindowData[windowID] as TypeCallCameraVolatileData_t | undefined)?.track
	);
	const cameraMuted = $derived(
		(volatileWindowData[windowID] as TypeCallCameraVolatileData_t | undefined)?.cameraMuted
	);

	// TODO can we change this?
	let aspect = $state(16 / 9);

	$effect(() => {
		if (!track) {
			return;
		}

		if (track.isLocal) {
			return;
		}

		if (!track.isSubscribed) {
			track.setSubscribed(true);
		}
	});

	onDestroy(() => {
		track?.setSubscribed(false);
		delete volatileWindowData[windowID];
	});
</script>

<WindowBase slim>
	<div class="flex h-full w-full items-stretch">
		<div
			class="bg-base-100 border-base-content/50 flex shrink-0 flex-col justify-center gap-2 overflow-y-auto overflow-x-hidden border-r p-3"
		>
			<div class="size-10">
				<Avatar client={owner} {user} />
			</div>
			<div class="divider my-0"></div>
			<button
				class="btn btn-primary btn-square"
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
					<!-- TODO handle mute events -->
					{#if track && !cameraMuted}
						<VideoTrackPlayer {track} />
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
							<div class="text-xs">
								{#if cameraMuted}
									Camera paused
								{:else}
									Are you connected to the call?
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</WindowBase>
