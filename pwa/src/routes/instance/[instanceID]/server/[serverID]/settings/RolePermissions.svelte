<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';

	import { page } from '$app/state';
	import { Permissions } from '$lib/constants';
	import { type Role_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { grantPermissionForRole, revokePermissionForRole } from '$lib/utils/changeServerSettings';
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

	let activeRoleID = $state('');

	type GrantAction_t = {
		action: 'grant';
		value: Permissions;
	};
	type RevokeAction_t = {
		action: 'revoke';
		value: Permissions;
	};
	type Action_t = GrantAction_t | RevokeAction_t;

	const changes = $state<Record<Role_t['record']['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).some((key) => changes[key]?.length > 0);
	});

	let roles = $derived.by(() => {
		const ret = $state({} as Record<Role_t['record']['id'], SvelteSet<Permissions>>);

		for (const roleID of Object.keys(sunburn[instanceID].servers[serverID].roles)) {
			ret[roleID] = new SvelteSet(sunburn[instanceID].servers[serverID].roles[roleID].permissions);
		}

		for (const roleID of Object.keys(changes)) {
			for (const change of changes[roleID as keyof typeof changes]) {
				ret[roleID] = ret[roleID] ?? new SvelteSet();
				switch (change.action) {
					case 'grant':
						ret[roleID].add(change.value);
						break;
					case 'revoke':
						ret[roleID].delete(change.value);
						break;
				}
			}
		}
		return ret;
	});
	const sortedRoleIDs = $derived(
		Object.keys(roles).sort(
			(a, b) =>
				(sunburn[instanceID].servers[serverID].roles[b].record.ordinal || 0) -
				(sunburn[instanceID].servers[serverID].roles[a].record.ordinal || 0),
		),
	);

	const onEdit = (roleID: string, permission: Permissions, checked: boolean) => {
		changes[roleID] = changes[roleID] ?? [];
		if (checked) {
			// if the role originally had the permission, and it's trying to be readded, remove the REVOKE change
			if (sunburn[instanceID].servers[serverID].roles[roleID].permissions.has(permission)) {
				const changeIndex = changes[roleID].findIndex((c) => c.value === permission);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing REVOKE change from role',
						roleID,
					);
					changes[roleID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push a GRANT change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding GRANT change to role',
					roleID,
				);
				changes[roleID].push({ action: 'grant', value: permission } as GrantAction_t);
			}
		} else {
			// if the role originally DIDN'T have the permission, and it's trying to be removed, remove the GRANT change
			if (!sunburn[instanceID].servers[serverID].roles[roleID].permissions.has(permission)) {
				const changeIndex = changes[roleID].findIndex((c) => c.value === permission);
				if (changeIndex > -1) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						logFriendly(instanceID),
						'removing GRANT change from role',
						roleID,
					);
					changes[roleID].splice(changeIndex, 1);
				}
			} else {
				// otherwise, push a REVOKE change
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'adding REVOKE change to role',
					roleID,
				);
				changes[roleID].push({ action: 'revoke', value: permission } as RevokeAction_t);
			}
		}
	};

	saveChanges = async () => {
		for (const roleID of Object.keys(changes)) {
			for (const action of changes[roleID]) {
				switch (action.action) {
					case 'grant':
						await grantPermissionForRole(instanceID, roleID, action.value);
						break;
					case 'revoke':
						await revokePermissionForRole(instanceID, roleID, action.value);
						break;
				}
			}
			delete changes[roleID];
		}
	};
</script>

<li class="menu-title" id="permissions">Role Permissions</li>
<li>
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
			{#each sortedRoleIDs as roleID (roleID)}
				<label
					class={[
						'cursor-pointer rounded-field hover:bg-base-content/10',
						'active:bg-base-content active:text-base-300',
						'has-checked:bg-base-content has-checked:text-base-300',
						'flex items-center gap-1 py-0.5',
						changes[roleID]?.length > 0 && 'italic',
					]}
				>
					<input
						type="radio"
						name="roleID"
						class="peer size-0"
						value={roleID}
						bind:group={activeRoleID}
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
		<div
			class={[
				'max-h-[90dvh] overflow-y-auto rounded-box border border-base-content/50',
				'shadow-[inset_0_0_0.5rem_rgba(0,0,0,0.5)]',
				'relative flex flex-col gap-1 p-1',
				!activeRoleID && 'overflow-x-hidden',
			]}
		>
			{#if !activeRoleID}
				<div
					class="absolute inset-0 flex items-center justify-center bg-base-300 text-base-content/50 select-none"
				>
					Choose a role
				</div>
			{/if}
			{#each Object.keys(Permissions) as _permission (_permission)}
				{@const permission = _permission as Permissions}
				<label
					class={[
						'cursor-pointer rounded-field hover:bg-base-content/10',
						'active:bg-base-content active:text-base-300',
						'has-checked:bg-base-content has-checked:text-base-300',
						'has-focus:ring-2',
						'flex items-center px-1',
						'font-mono text-sm',
						'w-fit min-w-full',
						(changes[activeRoleID] || []).find((c) => c.value === permission) && 'italic',
					]}
				>
					<input
						type="checkbox"
						name="permissions"
						class="size-0"
						disabled={!activeRoleID}
						checked={roles[activeRoleID]?.has(permission)}
						onchange={(e) =>
							onEdit(activeRoleID, permission, (e.target as HTMLInputElement).checked)}
					/>
					{Permissions[permission]}
				</label>
			{/each}
		</div>
	</div>
</li>
