<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { drawerState } from '$lib/drawerState.svelte';
	import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { createServer } from '$lib/utils/createServer';
	import { errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	import QuotaOption from './QuotaOption.svelte';

	const quota = $state<Record<Instance_t['id'], boolean>>({});
	let chosenInstance = $state('');
	let newServerName = $state('');
	let loading = $state(false);

	let serverCreationError = $state(false);

	const onNewServerSubmit = async () => {
		const instanceID = chosenInstance;

		try {
			const { serverID } = await createServer(instanceID, newServerName);

			goto(`/instance/${instanceID}/server/${serverID}`);
			drawerState.activeChannelID = '';
			drawerState.activeDMID = '';
			drawerState.activeInstanceID = instanceID;
			drawerState.activeServerID = serverID;
		} catch (err) {
			serverCreationError = true;
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(instanceID), 'error during server creation\n', err);
		}
	};
</script>

<div class="my-4">
	<h1 class="font-display text-xl font-bold">Accept Invite</h1>
	<form class="flex w-full flex-col gap-2">
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

	{#if serverCreationError}
		<div class="my-2 rounded-box bg-error p-2 text-error-content">
			Something went wrong while creating your new server. Check the console for more information.
		</div>
	{/if}

	<form onsubmit={onNewServerSubmit} class="flex w-full flex-col gap-2">
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
				autocomplete="off"
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
