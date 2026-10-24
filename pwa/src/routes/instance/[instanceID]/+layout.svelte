<script lang="ts">
	import { sunburn } from '#lib/sunburn/sunburn.svelte.ts';
	import { page } from '$app/state';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');

	const ready = $derived(instanceID in sunburn && sunburn[instanceID].ready);
</script>

{#if ready}
	{@render children()}
{/if}
