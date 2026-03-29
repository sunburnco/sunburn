<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import { drawerState } from '$lib/drawerState.svelte';
	import type { ServersRecord } from '$lib/pb-types';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly, nameOrHandle } from '$lib/utils/username';

	let { instanceID, slug } = page.params;

	let server = $state<ServersRecord | null>(null);
	let error = $state<null | 'notfound' | 'joining'>(null);
	let loading = $state(false);

	onMount(async () => {
		if (!instanceID || !slug) {
			return;
		}

		try {
			const invite = await sunburn[instanceID].pb.collection('invites').getOne(slug);

			const serverID = invite.server;

			server = await sunburn[instanceID].pb.collection('servers').getOne(serverID);
			if (!server) {
				error = 'notfound';
				return;
			}

			fetchUser(instanceID, server.owner);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'something went wrong while fetching invite and server\n',
				err,
			);
			error = 'notfound';
		}
	});

	const acceptInvite = async () => {
		if (!instanceID || !slug) {
			return;
		}

		loading = true;

		try {
			await sunburn[instanceID].pb.send(`/api/sb/acceptInvite/${slug}`, { method: 'POST' });
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('something went wrong while attempting to accept the invite\n', err);
			error = 'joining';
			loading = false;
			return;
		}

		drawerState.activeChannelID = '';
		drawerState.activeDMID = '';
		drawerState.activeInstanceID = instanceID;
		drawerState.activeServerID = server?.id || '';
		goto(`/instance/${instanceID}/server/${server?.id || ''}`);
	};
</script>

<div class="my-4">
	{#if error}
		<h1 class="font-display text-xl font-bold">Error</h1>
		<div class="my-2 rounded-box bg-error p-2 text-error-content">
			{#if error === 'notfound'}
				That invite couldn&apos;t be found. Check the console for more information.
			{:else}
				Something went wrong while attempting to accept the invite. Check the console for more
				information.
			{/if}
		</div>
		<a href="/new" class="btn w-full btn-primary">Go Back</a>
	{:else if !server || !instanceID}
		<div class="flex items-center justify-center gap-2">
			Loading <LucideLoaderCircle class="size-4 animate-spin" />
		</div>
	{:else}
		<h1 class="font-display text-xl font-bold">Accept Invite</h1>
		<p>You have been invited to join this server</p>
		<div class="flex items-center gap-2 rounded-box border border-base-content/50 bg-base-100 p-2">
			<PBAvatar
				className="max-h-min"
				size="msg"
				color="base-100"
				{instanceID}
				{server}
				name={server.name}
			/>
			<div class="flex flex-col justify-between">
				<p class="text-lg/6 font-bold">{server.name}</p>
				<p class="text-sm">
					Owned by
					<PBAvatar
						className="inline-block align-text-bottom"
						size="sm"
						{instanceID}
						userID={server.owner}
						url={sunburn[instanceID].users[server.owner]?.avatar}
						name={nameOrHandle(instanceID, server.owner)}
					/>
					{nameOrHandle(instanceID, server.owner, true)}
				</p>
			</div>
		</div>
		<div class="mt-4 flex w-full gap-2">
			<a href="/new" class="btn grow btn-outline">Go Back</a>
			<button onclick={acceptInvite} disabled={loading} class="btn grow btn-primary">
				{#if loading}
					<LucideLoaderCircle class="animate-spin" />
				{:else}
					Accept
				{/if}
			</button>
		</div>
	{/if}
</div>
