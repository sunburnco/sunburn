<script lang="ts">
	import type { TrackPublication } from 'livekit-client';
	import { onDestroy } from 'svelte';

	const { track }: { track?: TrackPublication } = $props();

	let el = $state<HTMLMediaElement | null>(null);

	$effect(() => {
		if (track?.videoTrack) {
			el = track.videoTrack.attach();
		} else {
			el = null;
		}
	});

	onDestroy(() => {
		track?.videoTrack?.detach();
	});

	const mount = (node: HTMLElement, newEl: HTMLMediaElement | null) => {
		let current: HTMLElement | null = null;

		const update = (newEl: HTMLMediaElement | null) => {
			if (current === newEl) {
				return;
			}

			if (current && current.parentNode === node.parentNode) {
				current.remove();
			}

			if (newEl) {
				node.replaceWith(newEl);
				current = newEl;
			} else {
				current = null;
			}
		};

		update(newEl);

		return {
			update,
			destroy() {
				if (current && current.parentNode) {
					current.remove();
				}
			}
		};
	};
</script>

{#if el}
	<div use:mount={el} class="placeholder hidden"></div>
{/if}
