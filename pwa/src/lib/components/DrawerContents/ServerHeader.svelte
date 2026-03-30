<script lang="ts">
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	import PBAvatar from '../PBAvatar.svelte';

	let { instanceID, serverID }: { instanceID: string; serverID: string } = $props();
</script>

{#if instanceID && serverID}
	<div
		class="flex min-h-24 w-full flex-row items-center justify-start gap-2 border-b border-base-content/50 bg-base-100 p-4 text-lg font-bold select-none"
	>
		<div class="w-1/6 shrink-0">
			<PBAvatar
				size="grow"
				color="base-200"
				{instanceID}
				{serverID}
				name={sunburn[instanceID].servers[serverID].record.name}
				url={sunburn[instanceID].servers[serverID].record.icon}
			/>
		</div>
		{sunburn[instanceID].servers[serverID].record.name}
	</div>
{/if}
