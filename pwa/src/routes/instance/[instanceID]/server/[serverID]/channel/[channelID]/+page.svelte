<script lang="ts">
	import { LucideHash, LucideVolume2 } from '@lucide/svelte';

	import { page } from '$app/state';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { fetchInitialMessageForChannel } from '$lib/sunburn/data/channels';
	import {
		type Channel_t,
		type Instance_t,
		type Server_t,
		sunburn,
	} from '$lib/sunburn/sunburn.svelte';

	import TextView from './TextView.svelte';

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const serverID: Server_t['record']['id'] = $derived(page.params.serverID || '');
	const channelID: Channel_t['record']['id'] = $derived(page.params.channelID || '');

	$effect(() => {
		if (sunburn[instanceID].servers[serverID].channels[channelID].messages.length === 0) {
			fetchInitialMessageForChannel(instanceID, serverID, channelID, null);
		}
	});
</script>

<div class="flex h-full w-full flex-col items-stretch">
	<div class="w-full border-b border-base-content/50 bg-base-200 flp-md font-bold select-none">
		<div class="flex items-stretch justify-center fl-gap-[0.75/1.25]">
			<PBAvatar
				size="md"
				{instanceID}
				name={sunburn[instanceID].servers[serverID].record.name}
				{serverID}
				url={sunburn[instanceID].servers[serverID].record.icon}
			/>
			{sunburn[instanceID].servers[serverID].record.name}
			<span class="text-base-content/50">|</span>
			{#if sunburn[instanceID].servers[serverID].channels[channelID].record.voice}
				<div>
					<LucideVolume2 class="flicon-sm stroke-2" />
					{sunburn[instanceID].servers[serverID].channels[channelID].record.name}
				</div>
			{:else}
				<div>
					<LucideHash class="flicon-sm stroke-2" />{sunburn[instanceID].servers[serverID].channels[
						channelID
					].record.name}
				</div>
			{/if}
		</div>
	</div>

	{#if sunburn[instanceID].servers[serverID].channels[channelID].record.voice}
		voice
	{:else}
		<TextView />
	{/if}
</div>
