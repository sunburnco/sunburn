<script lang="ts">
	import { LucidePackageOpen } from '@lucide/svelte';
	import { ConnectionState } from 'livekit-client';

	import { call } from '$lib/sunburn/call.svelte';
	import { loadServer } from '$lib/sunburn/data/server';
	import { type Server_t, sunburn } from '$lib/sunburn/sunburn.svelte';

	import PBAvatar from '../PBAvatar.svelte';
	import { drawerState } from './drawerState.svelte';

	const serverList = $derived.by(() => {
		const ret: { instanceID: string; serverID: string; record: Server_t['record'] }[] = [];

		for (const instanceID of Object.keys(sunburn)) {
			for (const serverID of Object.keys(sunburn[instanceID].servers)) {
				ret.push({ instanceID, serverID, record: sunburn[instanceID].servers[serverID].record });
			}
		}

		// TODO figure out per-user ordinals -- maybe in local settings?
		ret.sort((a, b) => a.record.name.localeCompare(b.record.name));

		return ret;
	});

	$effect(() => {
		if (!drawerState.instanceID || !drawerState.serverID) {
			return;
		}

		if (
			!(drawerState.instanceID in sunburn) ||
			!(drawerState.serverID in sunburn[drawerState.instanceID].servers)
		) {
			return;
		}

		if (!sunburn[drawerState.instanceID].ready) {
			return;
		}

		if (!sunburn[drawerState.instanceID].servers[drawerState.serverID].loaded) {
			loadServer(drawerState.instanceID, drawerState.serverID, drawerState.serverID);
		}
	});
</script>

{#each serverList as server (server.serverID)}
	<button
		class={[
			'btn btn-square',
			drawerState.serverID === server.serverID ? 'btn-neutral' : 'btn-ghost',
			call.roomState !== ConnectionState.Disconnected &&
				call.instanceID === drawerState.instanceID &&
				call.serverID === server.serverID &&
				'outline-2 outline-accent',
		]}
		onclick={() => {
			drawerState.instanceID = server.instanceID;
			drawerState.serverID = server.serverID;
		}}
	>
		<PBAvatar
			size="grow"
			instanceID={server.instanceID}
			serverID={server.serverID}
			color={drawerState.serverID === server.serverID ? 'base-100' : 'neutral'}
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
