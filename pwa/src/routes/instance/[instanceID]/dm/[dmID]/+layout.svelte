<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import { fetchInitialMessagesForDM } from '$lib/sunburn/data/dmMessages';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const dmID = $derived(page.params.dmID || '');

	onMount(() => {
		if (!(dmID in sunburn[instanceID].dms)) {
			fetchInitialMessagesForDM(instanceID, dmID, null);
		}
	});

	const ready = $derived(
		instanceID in sunburn &&
			sunburn[instanceID].ready &&
			dmID in sunburn[instanceID].users &&
			dmID in sunburn[instanceID].dms,
	);
</script>

{#if ready}
	{@render children()}
{/if}
