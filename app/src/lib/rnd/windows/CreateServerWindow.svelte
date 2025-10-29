<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import type { EventHandler } from 'svelte/elements';

	import { errorPrefix } from '$lib/logPrefixes';
	import { type ServerCountsRecord, type ServerQuotasRecord } from '$lib/pb-types';
	import { sunburn } from '$lib/sunburn.svelte';
	import { pbid } from '$lib/utils/pbid';
	import { logFriendly } from '$lib/utils/username';

	import { spawnServerWindow } from '../spawn/spawnServerWindow';
	import WindowBase from './WindowBase.svelte';

	const { owner, windowID: _windowID }: { owner: string; windowID: string } = $props();

	const maxServers = $derived.by(async () => {
		let quota = 0;
		try {
			const quotaRecord = (await sunburn.clients[owner]
				.collection('serverQuotas')
				.getFirstListItem(
					sunburn.clients[owner].filter('user = {:owner}', { owner })
				)) as ServerQuotasRecord;
			if (quotaRecord.maxServers === -1) {
				quota = Infinity;
			} else {
				quota = quotaRecord.maxServers ?? 0;
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(owner), 'could not fetch server quota\n', err);
			quota = 0;
		}

		let ownedServerCount = 0;
		try {
			const ownedServerCountRecord = (await sunburn.clients[owner]
				.collection('serverCounts')
				.getFirstListItem(
					sunburn.clients[owner].filter('user = {:owner}', { owner })
				)) as ServerCountsRecord;

			ownedServerCount = ownedServerCountRecord.serverCount ?? 0;
		} catch {
			// if user owns 0 servers, there won't be a serverCount row
			ownedServerCount = 0;
		}

		return quota - ownedServerCount;
	});

	let loading = $state(false);
	let serverName = $state('');
	let errorText = $state('');
	let success = $state(false);
	const serverID = $state(pbid());

	const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();
		errorText = '';
		loading = true;

		if (!(owner in sunburn.clients)) {
			errorText = 'Client does not exist';
			loading = false;
			return;
		}

		try {
			await sunburn.clients[owner].collection('servers').create({
				id: serverID,
				name: serverName,
				owner
			});

			const baseRoleID = pbid();

			await sunburn.clients[owner].collection('serverRoles').create({
				id: baseRoleID,
				server: serverID,
				name: '_',
				ordinal: 0
			});

			await sunburn.clients[owner].collection('serverRoleAssignments').create({
				role: baseRoleID,
				user: owner
			});
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(owner), 'could not create server\n', err);
			errorText = 'Something went wrong. Please check the console.';
			loading = false;
			return;
		}

		success = true;
		loading = false;
	};
</script>

<WindowBase>
	{#if !success}
		{#await maxServers}
			<div class="flex w-full select-none flex-col gap-2">
				<h1 class="font-display text-2xl font-bold">
					Loading <LucideLoaderCircle class="inline animate-spin" />
				</h1>
			</div>
		{:then maxServersResolved}
			{#if maxServersResolved > 0}
				<form {onsubmit} class="flex grow flex-col">
					<fieldset class="fieldset w-full" disabled={loading}>
						<legend class="fieldset-legend">Name</legend>
						<input
							required
							type="text"
							class="input w-full"
							placeholder="The Hangout"
							bind:value={serverName}
						/>
						<p class={['label text-error', !errorText && 'hidden']}>{errorText}</p>
					</fieldset>
					<button type="submit" class="btn btn-primary mt-4">
						{#if loading}
							<LucideLoaderCircle class="animate-spin" />
						{:else}
							Create
						{/if}
					</button>
				</form>
			{:else}
				<div class="flex w-full select-none flex-col gap-2">
					<h1 class="font-display text-2xl font-bold">Quota Exceeded</h1>
					<p>You have exceeded your server ownership quota.</p>
					<p>Contact the instance admin for help.</p>
				</div>
			{/if}
		{/await}
	{:else}
		<div class="flex w-full select-none flex-col gap-4">
			<h1 class="font-display text-2xl font-bold">Success</h1>
			<button class="btn btn-primary w-full" onclick={() => spawnServerWindow(owner, serverID)}>
				View Server
			</button>
		</div>
	{/if}
</WindowBase>
