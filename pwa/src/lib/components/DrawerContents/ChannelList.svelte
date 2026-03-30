<script lang="ts">
	import { LucideHash, LucidePackageOpen, LucidePhone, LucideVolume2 } from '@lucide/svelte';
	import { ConnectionState } from 'livekit-client';

	import { ChannelType } from '$lib/constants';
	import { call } from '$lib/sunburn/call.svelte';
	import { type Channel_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	import PBAvatar from '../PBAvatar.svelte';
	import { drawerState } from './drawerState.svelte';

	let { instanceID, serverID }: { instanceID: string; serverID: string } = $props();

	let channelList = $derived.by(() => {
		if (
			!(instanceID in sunburn) ||
			!sunburn[instanceID].ready ||
			!(serverID in sunburn[instanceID].servers)
		) {
			return [];
		}

		const ret: { instanceID: string; channelID: string; record: Channel_t['record'] }[] = [];

		for (const channelID of Object.keys(sunburn[instanceID].servers[serverID].channels)) {
			if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
				continue;
			}
			ret.push({
				instanceID: instanceID,
				channelID,
				record: sunburn[instanceID].servers[serverID].channels[channelID].record,
			});
		}

		// TODO sort by ordinal
		ret.sort((a, b) => a.record.name.localeCompare(b.record.name));

		return ret;
	});
</script>

<ul class="menu w-full">
	{#each channelList as channel (channel.channelID)}
		<li class={['rounded-box', drawerState.channelID === channel.channelID && 'menu-active']}>
			<a
				href={`/instance/${channel.instanceID}/server/${channel.record.server}/channel/${channel.channelID}`}
			>
				{#if sunburn[instanceID].servers[serverID].channels[channel.channelID].record.type === ChannelType.VOICE}
					{#if call.roomState !== ConnectionState.Disconnected && call.instanceID === instanceID && call.serverID === serverID && call.channelID === channel.channelID}
						<LucidePhone class="size-4 text-accent" />
					{:else}
						<LucideVolume2 class="size-4" />
					{/if}
				{:else}
					<LucideHash class="size-4" />
				{/if}
				{sunburn[instanceID].servers[serverID].channels[channel.channelID].record.name}
			</a>
			{#if sunburn[instanceID].servers[serverID].channels[channel.channelID].voiceParticipants.size > 0}
				<ul>
					{#each sunburn[instanceID].servers[serverID].channels[channel.channelID].voiceParticipants.keys() as vp (vp)}
						{#if vp in sunburn[instanceID].users}
							<li>
								<span class="inline-flex items-center gap-2 px-1.5">
									<PBAvatar
										size="sm"
										color={drawerState.channelID === channel.channelID ? 'neutral' : 'base-200'}
										{instanceID}
										userID={vp}
										name={nameOrHandle(instanceID, vp)}
										url={sunburn[instanceID].users[vp].avatar}
									/>
									{nameOrHandle(instanceID, vp)}
								</span>
							</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</li>
	{:else}
		<div class="select-none opacity-50 gap-1 w-full mt-2 flex items-center flex-col">
			<LucidePackageOpen class="size-6" />
			<div class="w-1/2 text-center">Nothing to display</div>
		</div>
	{/each}
</ul>
