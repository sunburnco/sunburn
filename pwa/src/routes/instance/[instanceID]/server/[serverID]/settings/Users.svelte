<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { cubicOut } from 'svelte/easing';
	import { SvelteSet } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';

	import { page } from '$app/state';
	import { Permissions } from '$lib/constants';
	import { type Role_t, type ServerMember_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { assignRoleToUser, removeRoleFromUser } from '$lib/utils/changeServerSettings';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	import UsersNameAndAvatar from './UsersNameAndAvatar.svelte';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
	}: {
		dirty: boolean;
		saveChanges: () => Promise<void>;
	} = $props();
	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let searchQuery = $state('');
	const debouncedQuery = new Debounced(() => searchQuery, 350);
	const queryFilter = $derived(
		debouncedQuery.current ? '&& (name ~ {:query} || handle ~ {:query})' : '',
	);
	const memberListPromise = $derived(
		!instanceID
			? (async () => [])()
			: sunburn[instanceID].pb.collection('serverMembers').getFullList({
					filter: sunburn[instanceID].pb.filter(`server = {:serverID} ${queryFilter}`, {
						serverID,
						query: debouncedQuery.current,
					}),
				}),
	);

	let activeUserID = $state('');

	type AssignRoleAction_t = {
		action: 'assign';
		value: Role_t['record']['id'];
	};
	type RemoveRoleAction_t = {
		action: 'remove';
		value: Role_t['record']['id'];
	};
	type Action_t = AssignRoleAction_t | RemoveRoleAction_t;

	const changes = $state<Record<ServerMember_t['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).some((key) => changes[key]?.length > 0);
	});

	let roleAssignments = $derived.by(() => {
		const ret = $state({} as Record<ServerMember_t['id'], SvelteSet<Role_t['record']['id']>>);

		for (const userID of Object.keys(sunburn[instanceID].servers[serverID].members)) {
			ret[userID] = new SvelteSet(sunburn[instanceID].servers[serverID].members[userID].roleIDs);
		}

		for (const userID of Object.keys(changes)) {
			for (const change of changes[userID as keyof typeof changes]) {
				ret[userID] = ret[userID] ?? new SvelteSet();
				switch (change.action) {
					case 'assign':
						ret[userID].add(change.value);
						break;
					case 'remove':
						ret[userID].delete(change.value);
						break;
				}
			}
		}
		return ret;
	});

	const onEdit = (
		userID: ServerMember_t['id'],
		roleID: Role_t['record']['id'],
		checked: boolean,
	) => {
		changes[userID] = changes[userID] ?? [];
		if (checked) {
			// if the user originally had the role, and it's trying to be readded, remove the REMOVE change
			if (sunburn[instanceID].servers[serverID].members[userID].roleIDs.has(roleID)) {
				const changeIndex = changes[userID].findIndex((c) => c.value === roleID);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing REMOVE change from user',
						userID,
					);
					changes[userID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push an ASSIGN change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding ASSIGN change to user',
					userID,
				);
				changes[userID].push({ action: 'assign', value: roleID } as AssignRoleAction_t);
			}
		} else {
			// if the user originally DIDN'T have the role, and it's trying to be removed, remove the ASSIGN change
			if (!sunburn[instanceID].servers[serverID].members[userID].roleIDs.has(roleID)) {
				const changeIndex = changes[userID].findIndex((c) => c.value === roleID);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing ASSIGN change from user',
						userID,
					);
					changes[userID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push a REMOVE change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding REMOVE change to user',
					userID,
				);
				changes[userID].push({ action: 'remove', value: roleID } as RemoveRoleAction_t);
			}
		}
	};

	saveChanges = async () => {
		for (const userID of Object.keys(changes)) {
			for (const action of changes[userID]) {
				switch (action.action) {
					case 'assign':
						await assignRoleToUser(instanceID, userID, action.value);
						break;
					case 'remove':
						await removeRoleFromUser(instanceID, userID, action.value);
						break;
				}
			}
			delete changes[userID];
		}
	};
</script>

<li class="menu-title">Users</li>
<li>
	<div class="flex w-full hover:bg-inherit active:bg-inherit active:text-current">
		<input
			class="input input-sm grow"
			name="userSearch"
			placeholder="Search for a user..."
			type="search"
			bind:value={searchQuery}
			autocomplete="off"
			oninput={() => (activeUserID = '')}
		/>
	</div>
	<div
		class="grid cursor-default grid-cols-2 grid-rows-1 items-stretch gap-2 hover:bg-inherit active:bg-inherit active:text-current"
	>
		<div
			class={[
				'max-h-[90dvh] overflow-y-auto rounded-box border border-base-content/50',
				'shadow-[inset_0_0_0.5rem_rgba(0,0,0,0.5)]',
				'flex flex-col gap-1 p-1',
				'has-focus:ring-2',
			]}
		>
			{#await memberListPromise}
				<div class="flex gap-1.5">
					Loading <LucideLoaderCircle class="size-3 animate-spin" />
				</div>
			{:then memberList}
				{#each memberList as member (member.user)}
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
					<label
						class={[
							'cursor-pointer rounded-field hover:bg-base-content/10',
							'active:bg-base-content active:text-base-300',
							'has-checked:bg-base-content has-checked:text-base-300',
							'flex items-center gap-1 py-0.5',
							changes[member.user]?.length > 0 && 'italic',
						]}
					>
						<input
							type="radio"
							name="userID"
							class="peer size-0"
							value={member.user}
							bind:group={activeUserID}
						/>
						<UsersNameAndAvatar userID={member.user} active={member.user === activeUserID} />
					</label>
				{:else}
					<div class="py-0.5 text-center text-base-content/50">Nothing to display</div>
				{/each}
			{/await}
		</div>

		<div
			class={[
				'max-h-[90dvh] overflow-y-auto rounded-box border border-base-content/50',
				'shadow-[inset_0_0_0.5rem_rgba(0,0,0,0.5)]',
				'relative flex flex-col gap-1 p-1',
				!activeUserID && 'overflow-x-hidden',
			]}
		>
			{#if !activeUserID}
				<div
					out:fade={{ duration: 150, easing: cubicOut }}
					class="absolute inset-0 flex items-center justify-center bg-base-300 text-base-content/50 select-none"
				>
					Choose a user
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
						(changes[activeUserID] || []).find((c) => c.value === roleID) && 'italic',
					]}
					title={sunburn[instanceID].servers[serverID].roles[roleID].permissions.has(
						Permissions.SERVER_MEMBER,
					)
						? 'Role has SERVER_MEMBER permission. Revoking this role may kick the user.'
						: undefined}
				>
					<input
						type="checkbox"
						name="role"
						class="peer size-0"
						disabled={!activeUserID}
						checked={roleAssignments[activeUserID]?.has(roleID)}
						onchange={(e) => onEdit(activeUserID, roleID, (e.target as HTMLInputElement).checked)}
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
					{#if sunburn[instanceID].servers[serverID].roles[roleID].permissions.has(Permissions.SERVER_MEMBER)}
						<span class="text-primary select-none">*</span>
					{/if}
				</label>
			{/each}
		</div>
	</div>
</li>
