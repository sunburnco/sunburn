<script lang="ts">
	import { onMount } from 'svelte';

	import { loadServer } from '#lib/sunburn/data/sbServer.ts';
	import { sunburn } from '#lib/sunburn/sunburn.svelte.ts';
	import { page } from '$app/state';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	onMount(() => {
		if (
			!(serverID in sunburn[instanceID].servers) ||
			!sunburn[instanceID].servers[serverID].loaded
		) {
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
