<script lang="ts">
	import { ClientResponseError } from 'pocketbase';

	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	let {
		instanceID,
		disabled = $bindable(),
	}: {
		instanceID: string;
		disabled: boolean;
	} = $props();

	let quota = $state<number | null>(null);

	const ownedServerCount = $derived(
		Object.values(sunburn[instanceID].servers).filter(
			(s) => s.record.owner === sunburn[instanceID].myID,
		).length,
	);

	$effect(() => {
		if (!sunburn[instanceID].ready) {
			return;
		}

		sunburn[instanceID].pb
			.collection('serverQuotas')
			.getFirstListItem('')
			.then((rec) => {
				quota = rec.maxServers;
				disabled = rec.maxServers === -1 ? false : rec.maxServers <= ownedServerCount;
			})
			.catch((err) => {
				if (err instanceof ClientResponseError && err.status === 404) {
					// 404 if the quota isn't defined
					disabled = true;
				} else {
					// eslint-disable-next-line no-console
					console.error(...errorPrefix, logFriendly(instanceID), 'could not fetch quota\n', err);
				}
			});
	});
</script>

{#if instanceID in sunburn && sunburn[instanceID].ready}
	<option
		{disabled}
		label={`${instanceID} (${quota !== null ? (quota === -1 ? 'Unlimited' : ownedServerCount + '/' + quota) : 'Loading...'})`}
		value={instanceID}
	></option>
{/if}
