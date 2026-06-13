<script lang="ts">
	import CallControls from '$lib/components/DrawerContents/CallControls.svelte';
	import ChannelList from '$lib/components/DrawerContents/ChannelList.svelte';
	import DMList from '$lib/components/DrawerContents/DMList.svelte';
	import { drawerState } from '$lib/components/DrawerContents/drawerState.svelte';
	import DrawerStateUpdater from '$lib/components/DrawerContents/DrawerStateUpdater.svelte';
	import Empty from '$lib/components/DrawerContents/Empty.svelte';
	import ServerHeader from '$lib/components/DrawerContents/ServerHeader.svelte';
	import ServerList from '$lib/components/DrawerContents/ServerList.svelte';
	import ServerListExtras from '$lib/components/DrawerContents/ServerListExtras.svelte';
	import ServerSettingsLinks from '$lib/components/DrawerContents/ServerSettingsLinks.svelte';
	import SettingsLinks from '$lib/components/DrawerContents/SettingsLinks.svelte';
	import LucideSunburn from '$lib/components/LucideSunburn.svelte';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
</script>

<!-- this component holds the effect that syncs drawerState from URL -->
<DrawerStateUpdater />

<div class="flex h-full w-80 max-w-3/4 items-stretch md:max-w-full">
	<!-- server list -->
	<div class="flex shrink-0 flex-col gap-2 overflow-y-auto bg-base-100 p-2">
		<a
			href="/"
			class={['btn btn-square', drawerState.serverID === 'dms' ? 'btn-neutral' : 'btn-ghost']}
		>
			<LucideSunburn size={32} />
		</a>

		<div class="divider m-0"></div>
		<ServerList />
		<div class="divider m-0"></div>
		<ServerListExtras />
	</div>

	<!-- channel list -->
	<div
		class="relative box-border flex min-h-full grow flex-col gap-2 overflow-y-auto border-x border-base-content/50 bg-base-200"
	>
		{#if drawerState.serverID === 'dms'}
			<DMList />
		{:else if drawerState.serverID === 'new'}
			<Empty />
		{:else if drawerState.serverID === 'settings'}
			<SettingsLinks />
		{:else if drawerState.instanceID in sunburn && sunburn[drawerState.instanceID].ready && drawerState.serverID in sunburn[drawerState.instanceID].servers}
			<ServerHeader instanceID={drawerState.instanceID} serverID={drawerState.serverID} />
			{#if drawerState.channelID === 'settings'}
				<ServerSettingsLinks />
			{:else}
				<ChannelList instanceID={drawerState.instanceID} serverID={drawerState.serverID} />
			{/if}
		{/if}

		<CallControls />
	</div>
</div>
