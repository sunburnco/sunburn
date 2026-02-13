<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import { loadServer } from '$lib/sunburn/data/server';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	onMount(() => {
		if (!sunburn[instanceID].servers[serverID].loaded) {
			loadServer(instanceID, serverID);
		}
	});

	const ready = $derived(
		instanceID in sunburn &&
			sunburn[instanceID].ready &&
			serverID in sunburn[instanceID].servers &&
			sunburn[instanceID].servers[serverID].loaded,
	);
</script>

{#if ready}
	{@render children()}
{/if}
