<script lang="ts">
	import {
		LucideHash,
		LucideMic,
		LucideMicOff,
		LucideMonitorUp,
		LucideMonitorX,
		LucidePackageOpen,
		LucidePhone,
		LucidePhoneMissed,
		LucideSettings,
		LucideVideo,
		LucideVideoOff,
		LucideVolume2,
	} from '@lucide/svelte';
	import { ConnectionState } from 'livekit-client';
	import type { DateTime } from 'luxon';
	import { Debounced } from 'runed';

	import { page } from '$app/state';
	import LucideSunburn from '$lib/components/LucideSunburn.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import type { UsersRecord, UsersResponse } from '$lib/pb-types';
	import { call } from '$lib/sunburn/call.svelte';
	import { loadServer } from '$lib/sunburn/data/server';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { type Channel_t, type Server_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { disconnect } from '$lib/utils/call/disconnect';
	import { muteCamera } from '$lib/utils/call/muteCamera';
	import { muteMic } from '$lib/utils/call/muteMic';
	import { startScreenShare } from '$lib/utils/call/startScreenShare';
	import { stopScreenShare } from '$lib/utils/call/stopScreenShare';
	import { unmuteCamera } from '$lib/utils/call/unmuteCamera';
	import { unmuteMic } from '$lib/utils/call/unmuteMic';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { nameOrHandle } from '$lib/utils/username';

	let activeInstanceID = $state(page.params.instanceID || '');
	let activeServerID = $state(page.params.serverID || 'dms');
	let activeChannelID = $state(page.params.channelID || '');
	let activeDMID = $state(page.params.dmID || '');

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

	let dmSearch = $state('');
	let debouncedDMSearch = new Debounced(() => dmSearch, 350);
	let searchedUserList = $state<(UsersResponse<UsersRecord> & { instanceID: string })[]>([]);
	$effect(() => {
		if (!debouncedDMSearch.current) {
			return;
		}

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, 'searching for users', debouncedDMSearch.current);

		// functional programming is so wonderful
		// we should remove the async/await API and go back to .then()
		// this is so readable
		// I had so much fun writing ts
		// /s
		Promise.all(
			Object.keys(sunburn).map((instanceID) =>
				sunburn[instanceID].pb
					.collection('users')
					.getList<UsersResponse<UsersRecord>>(0, 50, {
						filter: sunburn[instanceID].pb.filter(
							'(handle_lowercase ~ {:ss} || name ~ {:ss}) && id != {:id}',
							{
								ss: debouncedDMSearch.current,
								id: sunburn[instanceID].myID,
							},
						),
						requestKey: null,
					})
					.then((res) =>
						res.items.map((i) => {
							return { ...i, instanceID };
						}),
					)
					.catch(() => [] as (UsersResponse<UsersRecord> & { instanceID: string })[]),
			),
		)
			.then((vals) =>
				vals.reduce((prev, curr) => {
					prev.push(...curr);
					return prev;
				}, []),
			)
			.then((reduced) => (searchedUserList = reduced));
	});
</script>

<div class="flex h-full w-80 max-w-3/4 items-stretch md:max-w-full">
	<!-- server list -->
	<div class="flex shrink-0 flex-col gap-2 overflow-y-auto bg-base-100 p-2">
		<button
			class={['btn btn-square', activeServerID === 'dms' ? 'btn-neutral' : 'btn-ghost']}
			onclick={() => (activeServerID = 'dms')}
		>
			<LucideSunburn size={32} />
		</button>

		<div class="divider m-0"></div>

		{#each serverList as server (server.serverID)}
			<button
				class={[
					'btn btn-square',
					activeServerID === server.serverID ? 'btn-neutral' : 'btn-ghost',
					call.roomState !== ConnectionState.Disconnected &&
						call.instanceID === activeInstanceID &&
						call.serverID === server.serverID &&
						'outline-2 outline-accent',
				]}
				onclick={() => {
					activeInstanceID = server.instanceID;
					activeServerID = server.serverID;
				}}
			>
				<PBAvatar
					size="grow"
					instanceID={server.instanceID}
					serverID={server.serverID}
					color={activeServerID === server.serverID ? 'base-100' : 'neutral'}
					url={sunburn[server.instanceID].servers[server.serverID].record.icon}
					name={sunburn[server.instanceID].servers[server.serverID].record.name}
					fallbackClassName="bg-transparent"
				/>
			</button>
		{:else}
			<div class="opacity-50 flex select-none justify-center" title="Nothing to display">
				<LucidePackageOpen class="size-6" />
			</div>
		{/each}
	</div>

	<!-- channel list -->
	<div
		class="relative box-border flex min-h-full grow flex-col gap-2 overflow-y-auto border-x border-base-content/50 bg-base-200"
	>
		{#if activeServerID === 'dms'}
			<div class="p-2">
				<input class="input" placeholder="Search for a user..." bind:value={dmSearch} />
			</div>

			<ul class="menu w-full">
				{#if dmSearch}
					{#each searchedUserList as user (user.id)}
						<li class="rounded-box">
							<a
								href={`/instance/${user.instanceID}/dm/${user.id}`}
								onclick={() => {
									activeDMID = user.id;
									activeChannelID = '';
									dmSearch = '';
								}}
							>
								<PBAvatar
									color="base-200"
									instanceID={user.instanceID}
									userID={user.id}
									url={user.avatar}
									name={user.name ?? user.handle}
								/>
								<div>
									<p>{user.name ?? user.handle}</p>
									<p class="text-sm italic">{user.instanceID}</p>
								</div>
							</a>
						</li>
					{:else}
						<div class="select-none opacity-50 gap-1 w-full flex items-center flex-col">
							<LucidePackageOpen class="size-6" />
							<div class="w-1/2 text-center">Nothing to display</div>
						</div>
					{/each}
				{:else}
					{#each dmList as dm (dm.dmID)}
						{#if dm.dmID in sunburn[dm.instanceID].users}
							<li class={['rounded-box', activeDMID === dm.dmID && 'menu-active']}>
								<a
									href={`/instance/${dm.instanceID}/dm/${dm.dmID}`}
									onclick={() => {
										activeDMID = dm.dmID;
										activeChannelID = '';
									}}
								>
									<PBAvatar
										color={activeDMID === dm.dmID ? 'neutral' : 'base-200'}
										instanceID={dm.instanceID}
										userID={dm.dmID}
										url={sunburn[dm.instanceID].users[dm.dmID].avatar}
										name={nameOrHandle(dm.instanceID, dm.dmID)}
									/>
									{nameOrHandle(dm.instanceID, dm.dmID, true)}
								</a>
							</li>
						{/if}
					{:else}
						<div class="select-none opacity-50 gap-1 w-full flex items-center flex-col">
							<LucidePackageOpen class="size-6" />
							<div class="w-1/2 text-center">Nothing to display. Try searching for a user.</div>
						</div>
					{/each}
				{/if}
			</ul>
		{:else}
			{#if activeInstanceID in sunburn && sunburn[activeInstanceID].ready && activeServerID in sunburn[activeInstanceID].servers}
				<div
					class="flex min-h-24 w-full flex-row items-center justify-start gap-2 border-b border-base-content/50 bg-base-100 p-4 text-lg font-bold select-none"
				>
					<div class="w-1/6 shrink-0">
						<PBAvatar
							size="grow"
							color="base-200"
							instanceID={activeInstanceID}
							serverID={activeServerID}
							name={sunburn[activeInstanceID].servers[activeServerID].record.name}
							url={sunburn[activeInstanceID].servers[activeServerID].record.icon}
						/>
					</div>
					{sunburn[activeInstanceID].servers[activeServerID].record.name}
				</div>
			{/if}
			<ul class="menu w-full">
				{#each channelList as channel (channel.channelID)}
					<li class={['rounded-box', activeChannelID === channel.channelID && 'menu-active']}>
						<a
							onclick={() => {
								activeChannelID = channel.channelID;
								activeDMID = '';
							}}
							href={`/instance/${channel.instanceID}/server/${channel.record.server}/channel/${channel.channelID}`}
						>
							{#if sunburn[activeInstanceID].servers[activeServerID].channels[channel.channelID].record.voice}
								{#if call.roomState !== ConnectionState.Disconnected && call.instanceID === activeInstanceID && call.serverID === activeServerID && call.channelID === channel.channelID}
									<LucidePhone class="size-4 text-accent" />
								{:else}
									<LucideVolume2 class="size-4" />
								{/if}
							{:else}
								<LucideHash class="size-4" />
							{/if}
							{sunburn[activeInstanceID].servers[activeServerID].channels[channel.channelID].record
								.name}
						</a>
						{#if sunburn[activeInstanceID].servers[activeServerID].channels[channel.channelID].voiceParticipants.size > 0}
							<ul>
								{#each sunburn[activeInstanceID].servers[activeServerID].channels[channel.channelID].voiceParticipants.keys() as vp (vp)}
									{#if vp in sunburn[activeInstanceID].users}
										<li>
											<span class="inline-flex items-center gap-2 px-1.5">
												<PBAvatar
													size="sm"
													color={activeChannelID === channel.channelID ? 'neutral' : 'base-200'}
													instanceID={activeInstanceID}
													userID={vp}
													name={nameOrHandle(activeInstanceID, vp)}
													url={sunburn[activeInstanceID].users[vp].avatar}
												/>
												{nameOrHandle(activeInstanceID, vp)}
											</span>
										</li>
									{/if}
								{/each}
							</ul>
						{/if}
					</li>
				{:else}
					<div class="select-none opacity-50 gap-1 w-full flex items-center flex-col">
						<LucidePackageOpen class="size-6" />
						<div class="w-1/2 text-center">Nothing to display</div>
					</div>
				{/each}
			</ul>
		{/if}

		<div
			class="sticky bottom-0 mt-auto w-full border-t border-base-content/50 bg-base-100 p-2 text-base-content"
		>
			<div class="flex w-full justify-between">
				<div class="flex gap-2">
					<a href="/settings">
						<span class="btn btn-square btn-ghost btn-sm">
							<LucideSettings class="size-5" />
						</span>
					</a>
				</div>
				<div class="flex gap-2">
					<button
						disabled={call.roomState !== ConnectionState.Connected}
						class={[
							'group btn btn-square btn-sm',
							call.me?.micUnmuted ? 'btn-accent' : 'btn-ghost',
						]}
						onclick={call.me?.micUnmuted ? muteMic : unmuteMic}
						title={call.me?.micUnmuted ? 'Mute (you are unmuted)' : 'Unmute (you are muted)'}
					>
						<div class="group-disabled:opacity-20">
							{#if call.me?.micUnmuted}
								<LucideMic class="size-5" />
							{:else}
								<LucideMicOff class="size-5 stroke-base-content" />
							{/if}
						</div>
					</button>
					<button
						disabled={call.roomState !== ConnectionState.Connected}
						class={[
							'group btn btn-square btn-sm',
							call.me?.cameraUnmuted ? 'btn-accent' : 'btn-ghost',
						]}
						onclick={call.me?.cameraUnmuted ? muteCamera : unmuteCamera}
						title={call.me?.cameraUnmuted
							? 'Stop camera (your camera is on)'
							: 'Start camera (your camera is off)'}
					>
						<div class="text-base-content group-disabled:opacity-20">
							{#if call.me?.cameraUnmuted}
								<LucideVideo class="size-5" />
							{:else}
								<LucideVideoOff class="size-5" />
							{/if}
						</div>
					</button>
					<button
						disabled={call.roomState !== ConnectionState.Connected}
						class={[
							'group btn btn-square btn-sm',
							call.me?.screenShareUnmuted ? 'btn-accent' : 'btn-ghost',
						]}
						onclick={call.me?.screenShareUnmuted ? stopScreenShare : startScreenShare}
						title={call.me?.screenShareUnmuted
							? 'Stop sharing your screen (your screen is being shared)'
							: 'Begin sharing your screen (your screen is not being shared)'}
					>
						<div class="text-base-content group-disabled:opacity-20">
							{#if call.me?.screenShareUnmuted}
								<LucideMonitorUp class="size-5" />
							{:else}
								<LucideMonitorX class="size-5" />
							{/if}
						</div>
					</button>
					<button
						disabled={call.roomState === ConnectionState.Disconnected}
						class="group btn btn-square btn-sm btn-primary"
						onclick={disconnect}
						title="Disconnect"
					>
						<div class="text-base-content group-disabled:opacity-20">
							<LucidePhoneMissed class="size-5" />
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
