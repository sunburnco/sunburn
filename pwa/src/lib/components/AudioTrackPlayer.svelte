<!-- TODO https://cwestblog.com/2017/08/17/html5-getting-more-volume-from-the-web-audio-api/ -->

<script lang="ts">
	import type { TrackPublication } from 'livekit-client';
	import { onMount } from 'svelte';

	const { track, volume }: { track: TrackPublication; volume: number } = $props();

	let el = $state<HTMLMediaElement | null>(null);

	onMount(() => {
		if (track.audioTrack) {
			el = track.audioTrack.attach();
			el.volume = volume / 100;
		}
	});

	$effect(() => {
		if (!el) {
			return;
		}

		el.volume = volume / 100;
	});
</script>
