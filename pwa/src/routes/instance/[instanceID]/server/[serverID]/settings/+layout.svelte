<script lang="ts">
	import { LucideCog } from '@lucide/svelte';

	import InfoBar from '#lib/components/InfoBar.svelte';
	import PBAvatar from '#lib/components/PBAvatar.svelte';
	import { sunburn } from '#lib/sunburn/sunburn.svelte.ts';
	import { page } from '$app/state';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');
</script>

<InfoBar>
	{#snippet title()}
		<div class="flex items-center justify-center gap-1">
			<PBAvatar
				size="md"
				color="base-200"
				{instanceID}
				name={sunburn[instanceID].servers[serverID].record.name}
				{serverID}
				url={sunburn[instanceID].servers[serverID].record.icon}
			/>
			{sunburn[instanceID].servers[serverID].record.name}
			<div class="divider m-0 my-1 divider-horizontal"></div>
			<div><LucideCog class="inline size-4 -translate-y-px" /> Server Settings</div>
		</div>
	{/snippet}
	{@render children()}
</InfoBar>
