<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import { fetchChannel } from '$lib/sunburn/data/channels';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');
	const channelID = $derived(page.params.channelID || '');

	onMount(() => {
		if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
			fetchChannel(instanceID, serverID, channelID, null);
		}
	});

	const ready = $derived(
		instanceID in sunburn &&
			sunburn[instanceID].ready &&
			serverID in sunburn[instanceID].servers &&
			sunburn[instanceID].servers[serverID].loaded &&
			channelID in sunburn[instanceID].servers[serverID].channels,
	);
</script>

{#if ready}
	{@render children()}
{/if}
