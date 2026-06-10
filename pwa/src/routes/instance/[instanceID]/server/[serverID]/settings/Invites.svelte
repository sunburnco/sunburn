<script lang="ts">
	import {
		LucideCheck,
		LucideCopy,
		LucideLoaderCircle,
		LucidePlus,
		LucideUserPlus,
	} from '@lucide/svelte';

	import { page } from '$app/state';
	import type { InvitesRecord } from '$lib/pb-types';
	import { createInvite } from '$lib/sunburn/createInvite';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	import InviteRow from './InviteRow.svelte';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
		showList,
	}: {
		dirty: boolean;
		saveChanges: () => Promise<void>;
		showList: boolean;
	} = $props();

	let inviteLoading = $state(false);
	let localInviteCopied = $state(false);

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	type CreatedAction_t = {
		action: 'created';
		value: InvitesRecord;
	};
	type PendingDeleteAction_t = {
		action: 'pendingDelete';
	};
	type DeletedAction_t = {
		action: 'deleted';
	};
	type Action_t = CreatedAction_t | PendingDeleteAction_t | DeletedAction_t;

	const changes = $state<Record<InvitesRecord['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).some(
				(key) =>
					// "created" and "deleted" reflect committed changes; ignore them
					changes[key] && changes[key].filter((c) => c.action === 'pendingDelete').length !== 0,
			);
	});

	let invitesPromise = $derived(
		sunburn[instanceID].pb.collection('invites').getFullList<InvitesRecord>({
			filter: sunburn[instanceID].pb.filter('server = {:serverID}', { serverID }),
		}),
	);
	const localInvites = $derived(
		Object.keys(changes)
			.filter((inviteID) => changes[inviteID].find((c) => c.action === 'created'))
			.map((inviteID) => changes[inviteID].find((c) => c.action === 'created')!.value),
	);

	const del = (inviteID: InvitesRecord['id']) => {
		changes[inviteID] = changes[inviteID] || [];
		// if the channel was already staged for deletion, un-delete it
		const changeIndex = changes[inviteID].findIndex((c) => c.action === 'pendingDelete');
		if (changeIndex > -1) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'removing PENDINGDELETE for invite',
				inviteID,
			);
			changes[inviteID].splice(changeIndex, 1);
		} else {
			// otherwise, mark for deletion
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'adding PENDINGDELETE for invite',
				inviteID,
			);
			changes[inviteID].push({ action: 'pendingDelete' });
		}
	};

	const deleteInvite = async (inviteID: InvitesRecord['id']) => {
		try {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'deleting invite', inviteID);
			await sunburn[instanceID].pb.collection('invites').delete(inviteID);
			const changeIndex = changes[inviteID].findIndex((c) => c.action === 'pendingDelete');
			if (changeIndex > -1) {
				changes[inviteID][changeIndex].action = 'deleted';
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				`something went wrong while deleting invite ${inviteID}\n`,
				err,
			);
		}
	};

	saveChanges = async () => {
		for (const inviteID of Object.keys(changes)) {
			if (changes[inviteID].findIndex((c) => c.action === 'deleted') > -1) {
				continue;
			}

			for (const action of changes[inviteID]) {
				switch (action.action) {
					case 'pendingDelete':
						await deleteInvite(inviteID);
						break;
				}
			}
			// do not delete changes[inviteID] as we're using it for state hints
		}
	};
</script>

<li class="mt-4 menu-title first:mt-0" id="invites">Invites</li>
{#if showList}
	{#await invitesPromise}
		<li>
			<p class="flex items-center gap-2">
				Loading <LucideLoaderCircle class="size-4 animate-spin" />
			</p>
		</li>
	{:then invites}
		<!-- combine invites from fetch and committed-but-not-refetched invites, then filter for invites that aren't deleted -->
		<!-- use this instead of conditional render so {:else} block works when `invites` is empty and all local invites were deleted -->
		{#each [...invites, ...localInvites].filter((inv) => !(changes[inv.id] || []).find((c) => c.action === 'deleted')) as invite (invite.id)}
			<InviteRow
				{invite}
				{del}
				pendingDelete={(changes[invite.id] || []).find((c) => c.action === 'pendingDelete') !==
					undefined}
			/>
			<!-- {:else}
			<li>
				<p
					class="text-base-content/50 flex justify-center hover:bg-inherit active:bg-inherit active:text-current pointer-events-none"
				>
					Nothing to display
				</p>
			</li> -->
		{/each}
	{/await}
{/if}
<li>
	{#if !showList && Object.keys(changes).filter((inviteID) => changes[inviteID].findIndex((c) => c.action === 'created') > -1).length > 0}
		{@const inviteID = Object.keys(changes).filter(
			(inviteID) => changes[inviteID].findIndex((c) => c.action === 'created') > -1,
		)[0]}
		<!-- if the user created an invite and doesn't have MANAGE_SERVER (i.e., can't see list of invites), replace the create button with the invite they made -->
		<div class="flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current">
			<LucideUserPlus class="inline size-4" />
			<p class="grow">{inviteID}</p>
			<button
				title="Copy"
				class="btn btn-square btn-sm"
				onclick={() => {
					localInviteCopied = true;
					setTimeout(() => (localInviteCopied = false), 450);
					navigator.clipboard.writeText(`${instanceID}/${inviteID}`);
				}}
			>
				{#if !localInviteCopied}
					<LucideCopy class="size-4" />
				{:else}
					<LucideCheck class="size-4" />
				{/if}
			</button>
		</div>
	{:else}
		<button
			class="flex w-full justify-center disabled:pointer-events-none"
			disabled={inviteLoading}
			onclick={async () => {
				inviteLoading = true;
				const rec = await createInvite(instanceID, serverID);
				if (rec) {
					changes[rec.id] = [
						{
							action: 'created',
							value: rec,
						},
					];
				}
				inviteLoading = false;
			}}
		>
			{#if !inviteLoading}
				<LucidePlus class="size-4" />
				Add Invite
			{:else}
				Loading
				<LucideLoaderCircle class="size-4 animate-spin" />
			{/if}
		</button>
	{/if}
</li>
