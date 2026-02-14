<script lang="ts">
	import { LucideCirclePlus, LucideHash, LucideVolume2 } from '@lucide/svelte';
	import type { DateTime } from 'luxon';

	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import { loadServer } from '$lib/sunburn/data/server';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { type Channel_t, type Server_t, sunburn } from '$lib/sunburn/sunburn.svelte';

	let root = $state<HTMLDivElement | null>(null);

	const url = $state.snapshot(page.url.pathname).split('/');
	let activeInstanceID = $state(page.params.instanceID || '');
	let activeServerID = $state(page.params.serverID || 'dms');
	let activeChannelID = $state(page.params.channelID || '');
	let activeDMID = $state(url.length >= 5 && url[3] === 'dm' ? url[4] : '');

	const serverList = $derived.by(() => {
		const ret: { instanceID: string; serverID: string; record: Server_t['record'] }[] = [];

		for (const instanceID of Object.keys(sunburn)) {
			for (const serverID of Object.keys(sunburn[instanceID].servers)) {
				ret.push({ instanceID, serverID, record: sunburn[instanceID].servers[serverID].record });
			}
		}

		ret.sort((a, b) => a.record.name.localeCompare(b.record.name));

		return ret;
	});

	let dmList = $derived.by(() => {
		if (activeServerID !== 'dms') {
			return [];
		}
		const ret: { dmID: string; instanceID: string; updated: DateTime }[] = [];

		for (const instanceID of Object.keys(sunburn)) {
			if (!sunburn[instanceID].ready) {
				continue;
			}

			for (const dmID of Object.keys(sunburn[instanceID].dms)) {
				ret.push({ dmID, instanceID, updated: sunburn[instanceID].dms[dmID].updated });

				if (!(dmID in sunburn[instanceID].users)) {
					fetchUser(instanceID, dmID, dmID);
				}
			}
		}

		ret.sort((a, b) => a.updated.diff(b.updated).as('seconds'));

		return ret;
	});

	$effect(() => {
		if (!activeInstanceID || !activeServerID || activeServerID === 'dms') {
			return;
		}

		if (!(activeInstanceID in sunburn) || !(activeServerID in sunburn[activeInstanceID].servers)) {
			return;
		}

		if (!sunburn[activeInstanceID].ready) {
			return;
		}

		if (!sunburn[activeInstanceID].servers[activeServerID].loaded) {
			loadServer(activeInstanceID, activeServerID, activeServerID);
		}
	});

	let channelList = $derived.by(() => {
		if (
			!(activeInstanceID in sunburn) ||
			!sunburn[activeInstanceID].ready ||
			!(activeServerID in sunburn[activeInstanceID].servers)
		) {
			return [];
		}

		const ret: { instanceID: string; channelID: string; record: Channel_t['record'] }[] = [];

		for (const channelID of Object.keys(
			sunburn[activeInstanceID].servers[activeServerID].channels,
		)) {
			if (!(channelID in sunburn[activeInstanceID].servers[activeServerID].channels)) {
				continue;
			}
			ret.push({
				instanceID: activeInstanceID,
				channelID,
				record: sunburn[activeInstanceID].servers[activeServerID].channels[channelID].record,
			});
		}

		// TODO sort by ordinal
		ret.sort((a, b) => a.record.name.localeCompare(b.record.name));

		return ret;
	});
</script>

<ScrollArea
	bind:ref={root}
	class="shrink-0 overflow-hidden select-none"
	viewportClassName="h-full border-base-content/50 border-x"
	orientation="vertical"
	color="base-200"
	staydown
>
	<div
		class="fl-gap-1/2 flex h-full flex-col-reverse items-center justify-end overflow-x-hidden bg-base-200 py-1.5 text-base-content"
	>
		<Button size="md-sq" orientation="vertical" color="base-200">
			<LucideCirclePlus class="flicon-md90" />
		</Button>

		<div class="mx-auto h-px w-[calc(100%-1rem)] bg-base-content/50" role="separator"></div>

		{#if activeServerID === 'dms'}
			<!-- DMs -->
			{#each dmList as dm (dm.dmID)}
				{#if dm.dmID in sunburn[dm.instanceID].users}
					<a href={`/instance/${dm.instanceID}/dm/${dm.dmID}`}>
						<Button
							orientation="vertical"
							color={activeDMID === dm.dmID ? 'neutral' : 'base-200'}
							onclick={() => {
								activeDMID = dm.dmID;
								activeChannelID = '';
							}}
						>
							<div class="fl-gap-[0.5/0.75] flex items-center justify-center">
								<PBAvatar
									instanceID={dm.instanceID}
									userID={dm.dmID}
									url={sunburn[dm.instanceID].users[dm.dmID].avatar}
									name={sunburn[dm.instanceID].users[dm.dmID].handle}
									imgClassName="-rotate-90"
								/>
								{sunburn[dm.instanceID].users[dm.dmID].name ||
									'@' + sunburn[dm.instanceID].users[dm.dmID].handle}
							</div>
						</Button>
					</a>
				{/if}
			{:else}
				<p class="writing-slr italic font-faint whitespace-nowrap">No DMs</p>
			{/each}
		{:else}
			<!-- channel list -->
			{#each channelList as channel (channel.channelID)}
				<a
					href={`/instance/${channel.instanceID}/server/${channel.record.server}/channel/${channel.channelID}`}
				>
					<Button
						orientation="vertical"
						color={activeChannelID === channel.channelID ? 'neutral' : 'base-200'}
						onclick={() => {
							activeChannelID = channel.channelID;
							activeDMID = '';
						}}
					>
						<div class="fl-gap-[0.5/0.75] flex items-center justify-center">
							{#if channel.record.voice}
								<LucideVolume2 class="flicon-sm90" />
							{:else}
								<LucideHash class="flicon-sm90" />
							{/if}
							{channel.record.name}
						</div>
					</Button>
				</a>
			{:else}
				<p class="writing-slr italic font-faint whitespace-nowrap">No channels</p>
			{/each}
		{/if}

		<div style={`height:${root?.clientHeight ?? 0}px;`}></div>
	</div>
</ScrollArea>

<ScrollArea
	bind:ref={root}
	class="shrink-0 overflow-hidden select-none"
	viewportClassName="h-full"
	orientation="vertical"
	color="base-100"
	staydown
>
	<div
		class="fl-gap-1/2 fl-py-1/1.5 flex h-full flex-col-reverse items-center justify-end overflow-x-hidden bg-base-100 text-base-content"
	>
		<Button
			orientation="vertical"
			color={activeServerID === 'dms' ? 'neutral' : 'base-100'}
			onclick={() => {
				activeServerID = 'dms';
			}}
		>
			DMs
		</Button>
		<div class="mx-auto h-px w-[calc(100%-1rem)] bg-base-content/50" role="separator"></div>

		<Button size="md-sq" orientation="vertical" color="base-100">
			<LucideCirclePlus class="flicon-md90" />
		</Button>

		<div class="mx-auto h-px w-[calc(100%-1rem)] bg-base-content/50" role="separator"></div>

		{#each serverList as server (server.serverID)}
			<Button
				orientation="vertical"
				color={activeServerID === server.serverID ? 'neutral' : 'base-100'}
				onclick={() => {
					activeInstanceID = server.instanceID;
					activeServerID = server.serverID;
				}}
			>
				<div class="fl-gap-[0.5/0.75] flex items-center justify-center">
					<PBAvatar
						instanceID={server.instanceID}
						name={server.record.name}
						serverID={server.serverID}
						url={server.record.icon}
						imgClassName="-rotate-90"
						color={activeServerID === server.serverID ? 'neutral' : 'base-100'}
					/>
					{server.record.name}
				</div>
			</Button>
		{:else}
			<p class="writing-slr italic font-faint whitespace-nowrap">No servers</p>
		{/each}

		<div style={`height:${root?.clientHeight ?? 0}px;`}></div>
	</div>
</ScrollArea>
