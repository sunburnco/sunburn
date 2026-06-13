<script lang="ts">
	import { LucideArrowRight, LucideLoaderCircle } from '@lucide/svelte';
	import { Debounced } from 'runed';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { createServer } from '$lib/utils/createServer';
	import { errorPrefix } from '$lib/utils/logPrefixes';
	import { parseInviteSlug } from '$lib/utils/parseInviteSlug';
	import { logFriendly } from '$lib/utils/username';

	import QuotaOption from './QuotaOption.svelte';

	let defaultURL = $state(page.url.host);

	let inviteURL = $state('');
	const inviteSlug = new Debounced(() => parseInviteSlug(inviteURL, defaultURL), 175);

	const quota = $state<Record<Instance_t['id'], boolean>>({});
	let chosenInstance = $state('');
	let serverCreationError = $state(false);

	let loading = $state(false);

	const onNewServerSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const fd = new FormData(e.target as HTMLFormElement);
		const instanceID = fd.get('instanceID') as string;
		const serverName = fd.get('serverName') as string;

		try {
			const { serverID } = await createServer(instanceID, serverName);

			goto(`/instance/${instanceID}/server/${serverID}`);
		} catch (err) {
			serverCreationError = true;
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(instanceID), 'error during server creation\n', err);
		}
	};
</script>

<div class="my-4">
	<h1 class="font-display text-xl font-bold">Accept Invite</h1>
	<form
		action={!inviteSlug.current.display
			? page.url.href
			: `/instance/${inviteSlug.current.instanceID}/invite/${inviteSlug.current.slug}`}
		class="flex w-full flex-col gap-2"
	>
		<fieldset class="fieldset" disabled={loading}>
			<legend class="fieldset-legend">Invite URL</legend>
			<input
				required
				id="inviteURL"
				bind:value={inviteURL}
				type="text"
				class="input w-full"
				autocomplete="off"
				autocorrect="off"
			/>
		</fieldset>

		<a
			href={!inviteSlug.current.display
				? undefined
				: inviteSlug.current.instanceID === 'on.sb'
					? // TODO on.sb short invites
						'https://on.sb'
					: `${inviteSlug.current.instanceID in sunburn && sunburn[inviteSlug.current.instanceID].ready ? '' : `/login/${inviteSlug.current.instanceID}?next=`}/instance/${inviteSlug.current.instanceID}/invite/${inviteSlug.current.slug}`}
		>
			<button class="btn w-full btn-primary" disabled={loading || !inviteSlug.current.display}>
				{inviteSlug.current.display || 'Accept Invite'}
				<LucideArrowRight class="size-4" />
			</button>
		</a>
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
			<select name="instanceID" required class="select w-full" bind:value={chosenInstance}>
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
				name="serverName"
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
