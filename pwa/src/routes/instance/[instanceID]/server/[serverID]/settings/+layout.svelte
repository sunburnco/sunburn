<script lang="ts">
	import { LucideCog } from '@lucide/svelte';

	import { page } from '$app/state';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	const { children } = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	// this check is probably unnecessary, since the server layout shouldn't render children until the server is ready
	const ready = $derived(
		instanceID in sunburn && sunburn[instanceID].ready && serverID in sunburn[instanceID].servers,
	);
</script>

{#if ready}
	<section class="flex size-full flex-col items-stretch bg-base-300 text-base-content">
		<header
			class="flex w-full items-center justify-center border-b border-base-content/50 bg-base-200 p-1 font-bold select-none"
		>
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
		</header>
		<content class="flex grow items-center justify-center overflow-y-auto">
			<div class="max-h-full overflow-y-auto">
				<div class="mx-auto w-xl max-w-11/12">
					{@render children()}
				</div>
			</div>
		</content>
	</section>
{/if}
