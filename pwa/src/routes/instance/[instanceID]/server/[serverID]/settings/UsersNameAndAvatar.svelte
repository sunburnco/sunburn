<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	const { userID, active }: { userID: string; active: boolean } = $props();

	const instanceID = $derived(page.params.instanceID || '');

	onMount(() => {
		if (!instanceID) {
			return;
		}

		if (!(userID in sunburn[instanceID].users)) {
			fetchUser(instanceID, userID);
		}
	});
</script>

{#if !(userID in sunburn[instanceID].users)}
	<div class="inline-flex gap-1.5">
		Loading <LucideLoaderCircle class="size-3 animate-spin" />
	</div>
{:else}
	<div class="flex items-center gap-2" title={`@${sunburn[instanceID].users[userID].handle}`}>
		<PBAvatar
			{instanceID}
			{userID}
			size="sm"
			color={active ? 'neutral' : 'base-300'}
			url={sunburn[instanceID].users[userID].avatar}
			name={nameOrHandle(instanceID, userID)}
		/>
		{nameOrHandle(instanceID, userID, true)}
	</div>
{/if}
