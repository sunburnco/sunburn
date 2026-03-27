<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { ChannelType, Permissions } from '$lib/constants';
	import { drawerState } from '$lib/drawerState.svelte';
	import type {
		ChannelRoleAssignmentsRecord,
		ChannelsRecord,
		ServerRolePermissionsRecord,
		ServerRolesRecord,
		ServersRecord,
	} from '$lib/pb-types';
	import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { errorPrefix } from '$lib/utils/logPrefixes';
	import { pbID } from '$lib/utils/pbID';
	import { logFriendly } from '$lib/utils/username';

	import QuotaOption from './QuotaOption.svelte';

	const quota = $state<Record<Instance_t['id'], boolean>>({});
	let chosenInstance = $state('');
	let newServerName = $state('');
	let loading = $state(false);

	let errorStep = $state<'' | 'server' | 'role' | 'permissions' | 'general' | 'voice' | 'cra'>('');

	const onSubmit = async () => {
		loading = true;

		const instanceID = chosenInstance;

		const serverID = pbID();
		const roleID = pbID();
		const generalID = pbID();
		const voiceID = pbID();

		try {
			await sunburn[instanceID].pb.collection('servers').create({
				id: serverID,
				name: newServerName,
				owner: sunburn[instanceID].myID,
			} as ServersRecord);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(instanceID), 'error creating server\n', err);
			errorStep = 'server';
			loading = false;
			return;
		}

		try {
			await sunburn[instanceID].pb.collection('serverRoles').create({
				id: roleID,
				server: serverID,
				name: 'everyone',
				ordinal: 0,
			} as ServerRolesRecord);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(instanceID), 'error creating role\n', err);
			errorStep = 'role';
			loading = false;
			return;
		}

		try {
			for (const permission of [
				Permissions.SERVER_MEMBER,
				Permissions.CHANNEL_READ,
				Permissions.CHANNEL_SEND,
				Permissions.CALL_VIDEO,
				Permissions.ADD_REACTIONS,
				Permissions.USE_ATTACHMENTS,
			]) {
				await sunburn[instanceID].pb.collection('serverRolePermissions').create({
					role: roleID,
					permission,
				} as ServerRolePermissionsRecord);
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'error creating role permissions\n',
				err,
			);
			errorStep = 'permissions';
			loading = false;
			return;
		}

		try {
			await sunburn[instanceID].pb.collection('channels').create({
				id: generalID,
				name: 'general',
				server: serverID,
				type: ChannelType.TEXT,
			} as ChannelsRecord);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'error creating general channel\n',
				err,
			);
			errorStep = 'general';
			loading = false;
			return;
		}

		try {
			await sunburn[instanceID].pb.collection('channels').create({
				id: voiceID,
				name: 'voice',
				server: serverID,
				type: ChannelType.VOICE,
			} as ChannelsRecord);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(instanceID), 'error creating voice channel\n', err);
			errorStep = 'voice';
			loading = false;
			return;
		}

		try {
			await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
				channel: generalID,
				role: roleID,
			} as ChannelRoleAssignmentsRecord);
			await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
				channel: voiceID,
				role: roleID,
			} as ChannelRoleAssignmentsRecord);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'error creating channel role assignments\n',
				err,
			);
			errorStep = 'cra';
			loading = false;
			return;
		}

		goto(`/instance/${instanceID}/server/${serverID}`);
		drawerState.activeChannelID = '';
		drawerState.activeDMID = '';
		drawerState.activeInstanceID = instanceID;
		drawerState.activeServerID = serverID;
	};
</script>

<div class="my-4">
	<h1 class="font-display text-xl font-bold">Accept Invite</h1>
	<form class="flex w-full flex-col gap-2" title="coming soon">
		<fieldset class="fieldset" disabled>
			<legend class="fieldset-legend">Invite URL</legend>
			<input required id="inviteURL" type="text" class="input w-full" />
		</fieldset>

		<button type="submit" class="btn w-full btn-primary" disabled>Accept Invite</button>
	</form>

	<div class="divider my-8">
		<span class="text-sm text-base-content/50">OR</span>
	</div>

	<h1 class="font-display text-xl font-bold">New Server</h1>

	{#if errorStep}
		<div class="my-2 rounded-box bg-error p-2 text-error-content">
			Something went wrong while creating your new server. Check the console for more information.
		</div>
	{/if}

	<form onsubmit={onSubmit} class="flex w-full flex-col gap-2">
		<fieldset class="fieldset" disabled={loading}>
			<legend class="fieldset-legend">Instance</legend>
			<select id="instanceID" required class="select w-full" bind:value={chosenInstance}>
				<option label="Choose an instance..." value=""></option>
				{#each Object.keys(sunburn) as instanceID (instanceID)}
					<QuotaOption {instanceID} bind:disabled={quota[instanceID]} />
				{/each}
			</select>
		</fieldset>

		<fieldset class="fieldset" disabled={loading}>
			<legend class="fieldset-legend">Server Name</legend>
			<input
				required
				bind:value={newServerName}
				id="serverName"
				type="text"
				class="input w-full"
				placeholder="My Server"
			/>
		</fieldset>

		<button
			type="submit"
			disabled={loading || chosenInstance === ''}
			class="btn w-full btn-primary"
		>
			{#if !loading}
				Create Server
			{:else}
				<LucideLoaderCircle class="animate-spin" />
			{/if}
		</button>
	</form>
</div>
