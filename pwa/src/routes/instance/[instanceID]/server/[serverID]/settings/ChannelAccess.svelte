<script lang="ts">
	import { LucideHash, LucideVolume2 } from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import { SvelteSet } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';

	import { page } from '$app/state';
	import { ChannelType } from '$lib/constants';
	import { type Channel_t, type Role_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { assignRoleToChannel, removeRoleFromChannel } from '$lib/utils/changeServerSettings';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
	}: {
		dirty: boolean;
		saveChanges: () => Promise<void>;
	} = $props();

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let activeChannelID = $state<Channel_t['record']['id']>('');

	type AssignRoleAction_t = {
		action: 'assign';
		value: Role_t['record']['id'];
	};
	type RemoveRoleAction_t = {
		action: 'remove';
		value: Role_t['record']['id'];
	};
	type Action_t = AssignRoleAction_t | RemoveRoleAction_t;

	const changes = $state<Record<Channel_t['record']['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).some((key) => changes[key]?.length > 0);
	});

	let roleAssignments = $derived.by(() => {
		const ret = $state({} as Record<Channel_t['record']['id'], SvelteSet<Role_t['record']['id']>>);

		for (const channelID of Object.keys(sunburn[instanceID].servers[serverID].channels)) {
			ret[channelID] = new SvelteSet(
				sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs,
			);
		}

		for (const channelID of Object.keys(changes)) {
			for (const change of changes[channelID as keyof typeof changes]) {
				ret[channelID] = ret[channelID] ?? new SvelteSet();
				switch (change.action) {
					case 'assign':
						ret[channelID].add(change.value);
						break;
					case 'remove':
						ret[channelID].delete(change.value);
						break;
				}
			}
		}
		return ret;
	});

	const onEdit = (
		channelID: Channel_t['record']['id'],
		roleID: Role_t['record']['id'],
		checked: boolean,
	) => {
		changes[channelID] = changes[channelID] ?? [];
		if (checked) {
			// if the channel originally had the role, and it's trying to be readded, remove the REMOVE change
			if (sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs.has(roleID)) {
				const changeIndex = changes[channelID].findIndex((c) => c.value === roleID);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing REMOVE change from channel',
						channelID,
					);
					changes[channelID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push an ASSIGN change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding ASSIGN change to channel',
					channelID,
				);
				changes[channelID].push({ action: 'assign', value: roleID } as AssignRoleAction_t);
			}
		} else {
			// if the channel originally DIDN'T have the role, and it's trying to be removed, remove the ASSIGN change
			if (!sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs.has(roleID)) {
				const changeIndex = changes[channelID].findIndex((c) => c.value === roleID);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing ASSIGN change from channel',
						channelID,
					);
					changes[channelID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push a REMOVE change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding REMOVE change to channel',
					channelID,
				);
				changes[channelID].push({ action: 'remove', value: roleID } as RemoveRoleAction_t);
			}
		}
	};

	saveChanges = async () => {
		for (const channelID of Object.keys(changes)) {
			for (const action of changes[channelID]) {
				switch (action.action) {
					case 'assign':
						await assignRoleToChannel(instanceID, channelID, action.value);
						break;
					case 'remove':
						await removeRoleFromChannel(instanceID, channelID, action.value);
						break;
				}
			}
			delete changes[channelID];
		}
	};
</script>

<li class="menu-title">Channel Access</li>
<li>
	<div
		class="grid cursor-default grid-cols-2 grid-rows-1 items-stretch gap-2 hover:bg-inherit active:bg-inherit active:text-current"
	>
		<div
			class={[
				'max-h-[90dvh] min-h-36 overflow-y-auto rounded-box border border-base-content/50',
				'shadow-[inset_0_0_0.5rem_rgba(0,0,0,0.5)]',
				'flex flex-col gap-1 p-1',
				'has-focus:ring-2',
			]}
		>
			{#each Object.keys(sunburn[instanceID].servers[serverID].channels) as channelID (channelID)}
				{@const channel = sunburn[instanceID].servers[serverID].channels[channelID].record}
				<label
					class={[
						'cursor-pointer rounded-field hover:bg-base-content/10',
						'active:bg-base-content active:text-base-300',
						'has-checked:bg-base-content has-checked:text-base-300',
						'flex items-center gap-1 py-0.5',
						changes[channelID]?.length > 0 && 'italic',
					]}
				>
					<input
						type="radio"
						name="channelID"
						class="peer size-0"
						value={channelID}
						bind:group={activeChannelID}
					/>
					{@render ChannelNameAndType(channel.name, channel.type as ChannelType)}
				</label>
			{:else}
				<p class="py-0.5 text-center text-base-content/50">Nothing to display</p>
			{/each}
		</div>

		<div
			class={[
				'max-h-[90dvh] overflow-y-auto rounded-box border border-base-content/50',
				'shadow-[inset_0_0_0.5rem_rgba(0,0,0,0.5)]',
				'relative flex flex-col gap-1 p-1',
				!activeChannelID && 'overflow-x-hidden',
			]}
		>
			{#if !activeChannelID}
				<div
					out:fade={{ duration: 150, easing: cubicOut }}
					class="absolute inset-0 flex items-center justify-center bg-base-300 text-base-content/50 select-none"
				>
					Choose a channel
				</div>
			{/if}
			{#each Object.keys(sunburn[instanceID].servers[serverID].roles).sort((a, b) => (sunburn[instanceID].servers[serverID].roles[b].record.ordinal ?? 0) - (sunburn[instanceID].servers[serverID].roles[a].record.ordinal ?? 0)) as roleID (roleID)}
				<label
					class={[
						'cursor-pointer rounded-field hover:bg-base-content/10',
						'active:bg-base-content active:text-base-300',
						'has-checked:bg-base-content has-checked:text-base-300',
						'has-focus:ring-2',
						'flex items-center gap-1 py-0.5',
						'text-sm',
						'w-fit min-w-full',
						(changes[activeChannelID] || []).find((c) => c.value === roleID) && 'italic',
					]}
				>
					<input
						type="checkbox"
						name="role"
						class="peer size-0"
						disabled={!activeChannelID}
						checked={roleAssignments[activeChannelID]?.has(roleID)}
						onchange={(e) =>
							onEdit(activeChannelID, roleID, (e.target as HTMLInputElement).checked)}
					/>
					<div
						class={[
							'aspect-square size-4 rounded-box border border-base-content/50',
							'peer-checked:border-base-300/50',
						]}
						{@attach (node) => {
							node.style.backgroundColor =
								sunburn[instanceID].servers[serverID].roles[roleID].record.color || '';
						}}
					></div>
					{sunburn[instanceID].servers[serverID].roles[roleID].record.name}
				</label>
			{/each}
		</div>
	</div>
</li>

{#snippet ChannelNameAndType(channelName: string, channelType: ChannelType)}
	<div class="flex w-full flex-row items-center justify-between gap-1">
		{#if channelType === ChannelType.TEXT}
			<LucideHash class="inline size-4" />
		{:else if channelType === ChannelType.VOICE}
			<LucideVolume2 class="inline size-4" />
		{/if}
		<p class="grow">{channelName}</p>
	</div>
{/snippet}
