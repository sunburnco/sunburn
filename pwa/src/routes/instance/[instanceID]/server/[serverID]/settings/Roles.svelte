<script lang="ts">
	import { LucideCheck, LucidePlus, LucideX } from '@lucide/svelte';
	import { DateTime } from 'luxon';
	import { flip } from 'svelte/animate';
	import { cubicInOut } from 'svelte/easing';

	import { page } from '$app/state';
	import type { IsoAutoDateString, ServerRolesRecord } from '$lib/pb-types';
	import { type Role_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { createRole, deleteRole, editRole } from '$lib/utils/changeServerSettings';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { pbID } from '$lib/utils/pbID';
	import { logFriendly } from '$lib/utils/username';

	import RoleEditor from './RoleEditor.svelte';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
	}: {
		dirty: boolean;
		saveChanges: () => Promise<void>;
	} = $props();
	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let creatingRole = $state(false);
	let newColor = $state('#000000');
	let newName = $state('');
	let newOrdinal = $state(0.5);

	type RenameAction_t = {
		action: 'rename';
		value: string;
	};
	type CreateAction_t = {
		action: 'create';
		value: ServerRolesRecord;
	};
	type DeleteAction_t = {
		action: 'delete';
	};
	type ColorAction_t = {
		action: 'color';
		value: string;
	};
	type OrdinalAction_t = {
		action: 'ordinal';
		value: number;
	};
	type Action_t =
		| RenameAction_t
		| CreateAction_t
		| DeleteAction_t
		| ColorAction_t
		| OrdinalAction_t;

	const changes = $state<Record<Role_t['record']['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).some((key) => changes[key]?.length > 0);
	});

	let roles = $derived.by(() => {
		const ret = $state(
			{} as Record<Role_t['record']['id'], (Role_t['record'] & { _local?: boolean }) | undefined>,
		);

		// no checks for instance or server existence because that's handled by +layout.svelte
		for (const roleID of Object.keys(sunburn[instanceID].servers[serverID].roles)) {
			ret[roleID] = { ...sunburn[instanceID].servers[serverID].roles[roleID].record };
		}

		for (const roleID of Object.keys(changes)) {
			for (const change of changes[roleID as keyof typeof changes]) {
				if (!(roleID in ret)) {
					// local role
					if (change.action !== 'create') {
						continue;
					}
					ret[roleID] = { ...change.value, _local: true };
				} else if (ret[roleID]) {
					switch (change.action) {
						case 'rename':
							ret[roleID].name = change.value;
							break;
						case 'create':
							ret[roleID] = { ...change.value, _local: true };
							break;
						case 'delete':
							// delete ret[roleID];
							break;
						case 'color':
							ret[roleID].color = change.value;
							break;
						case 'ordinal':
							ret[roleID].ordinal = change.value;
							break;
					}
				}
			}
		}
		return ret;
	});
	const sortedRoleIDs = $derived(
		Object.keys(roles).sort((a, b) => (roles[b]?.ordinal ?? 0) - (roles[a]?.ordinal ?? 0)),
	);

	const pushChange = (roleID: string, action: RenameAction_t | ColorAction_t | OrdinalAction_t) => {
		changes[roleID] = changes[roleID] || [];
		// if the role is local, change CREATE action instead of adding rename
		if (roles[roleID]?._local) {
			const index = changes[roleID].findIndex((c) => c.action === 'create');
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'editing CREATE change for role',
					roleID,
				);
				switch (action.action) {
					case 'rename':
						(changes[roleID][index] as CreateAction_t).value.name = action.value;
						break;
					case 'color':
						(changes[roleID][index] as CreateAction_t).value.color = action.value;
						break;
					case 'ordinal':
						(changes[roleID][index] as CreateAction_t).value.ordinal = action.value;
						break;
				}
			}
			return;
		}

		if (
			(action.action === 'rename' &&
				action.value === sunburn[instanceID].servers[serverID].roles[roleID].record.name) ||
			(action.action === 'color' &&
				action.value === sunburn[instanceID].servers[serverID].roles[roleID].record.color) ||
			(action.action === 'ordinal' &&
				action.value === sunburn[instanceID].servers[serverID].roles[roleID].record.ordinal)
		) {
			const index = changes[roleID].findIndex((c) => c.action === action.action);
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					`reverting ${action.action.toUpperCase()} change for role`,
					roleID,
				);
				changes[roleID].splice(index, 1);
			}
		} else {
			// reuse existing action
			const index = changes[roleID].findIndex((c) => c.action === action.action);
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					`reverting ${action.action.toUpperCase()} change for role`,
					roleID,
				);
				switch (action.action) {
					case 'rename':
						(changes[roleID][index] as RenameAction_t).value = action.value;
						break;
					case 'color':
						(changes[roleID][index] as ColorAction_t).value = action.value;
						break;
					case 'ordinal':
						(changes[roleID][index] as OrdinalAction_t).value = action.value;
						break;
				}
				return;
			}

			// otherwise, push a new action
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				`adding ${action.action.toUpperCase()} change for role`,
				roleID,
			);
			changes[roleID].push(action);
		}
	};
	const create = (name: string, color: string, ordinal: number) => {
		const roleID = pbID();
		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(instanceID), 'adding CREATE for local role', roleID);
		changes[roleID] = [];
		const now = DateTime.now().toSQL() as IsoAutoDateString;
		changes[roleID].push({
			action: 'create',
			value: {
				id: roleID,
				name,
				color,
				ordinal,
				server: serverID,
				created: now,
				updated: now,
			},
		});
	};
	const del = (roleID: string) => {
		changes[roleID] = changes[roleID] || [];
		// for local roles, remove the CREATE change
		if (roles[roleID]?._local) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'removing CREATE for local role',
				roleID,
			);
			delete changes[roleID];
			return;
		}

		// for other roles, push the change
		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(instanceID), 'adding DELETE for role', roleID);
		changes[roleID].push({ action: 'delete' });
	};
	// NOT looking forward to recreating this for channel ordinals
	const rebalanceOrdinals = () => {
		const start = [] as { roleID: string; o: number }[];
		for (const roleID of Object.keys(roles)) {
			start.push({
				roleID,
				o: roles[roleID]?.ordinal ?? 0,
			});
		}
		// ascending (!) sort
		start.sort((a, b) => a.o - b.o);
		for (let i = 0; i < start.length; i++) {
			const _role = start[i];
			// i is desired order (o)
			if (sunburn[instanceID].servers[serverID].roles[_role.roleID].record.ordinal === i) {
				// role is back to original ordinal; delete ORDINAL change
				const changeIndex = (changes[start[i].roleID] || []).findIndex(
					(c) => c.action === 'ordinal',
				);
				if (changeIndex > -1) {
					changes[start[i].roleID].splice(changeIndex, 1);
					continue;
				}
			}

			if (_role.o !== i) {
				changes[_role.roleID] = changes[_role.roleID] || [];
				// if there's an existing ordinal change, reuse it
				const changeIndex = changes[_role.roleID].findIndex((c) => c.action === 'ordinal');
				if (changeIndex > -1) {
					(changes[_role.roleID][changeIndex] as OrdinalAction_t).value = i;
				} else {
					// otherwise, push a new change
					changes[_role.roleID].push({
						action: 'ordinal',
						value: i,
					} as OrdinalAction_t);
				}
			}
		}
	};

	saveChanges = async () => {
		for (const roleID of Object.keys(changes)) {
			const updatedFields = {} as Partial<ServerRolesRecord>;
			for (const action of changes[roleID]) {
				switch (action.action) {
					case 'rename':
						updatedFields.name = action.value;
						break;
					case 'color':
						updatedFields.color = action.value;
						break;
					case 'ordinal':
						updatedFields.ordinal = action.value;
						break;
					case 'create':
						await createRole(instanceID, action.value);
						break;
					case 'delete':
						await deleteRole(instanceID, roleID);
						break;
				}
			}
			if (Object.keys(updatedFields).length > 0) {
				await editRole(instanceID, roleID, updatedFields);
			}
			while (changes[roleID].length > 0) {
				changes[roleID].pop();
			}
		}
	};
</script>

<li class="menu-title" id="roles">Roles</li>
{#each sortedRoleIDs as roleID, index (roleID)}
	<li
		animate:flip={{ duration: 150, easing: cubicInOut }}
		class={[
			(changes[roleID] || []).find((c) => c.action === 'delete')
				? 'line-through'
				: changes[roleID]?.length > 0 && 'italic',
		]}
	>
		<RoleEditor
			role={roles[roleID]}
			rename={(roleID, value) => pushChange(roleID, { action: 'rename', value })}
			color={(roleID, value) => pushChange(roleID, { action: 'color', value })}
			ordinal={(roleID, dir) => {
				pushChange(roleID, {
					action: 'ordinal',
					value: (roles[roleID]?.ordinal ?? 0) + dir * 1.5,
				});
				rebalanceOrdinals();
			}}
			del={(roleID) => {
				const delIndex = (changes[roleID] || []).findIndex((c) => c.action === 'delete');
				if (delIndex > -1) {
					changes[roleID].splice(delIndex, 1);
				} else {
					del(roleID);
				}
			}}
			atTop={index === 0}
			atBottom={index >= sortedRoleIDs.length - 1}
		/>
	</li>
{/each}
<li>
	{#if creatingRole}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				if (newName === '') {
					return;
				}
				create(newName, newColor, newOrdinal);
				creatingRole = false;
				newName = '';
				newColor = '#000000';
				newOrdinal = 0;
				rebalanceOrdinals();
			}}
			class="flex justify-between gap-1 active:bg-inherit active:text-current"
		>
			<input
				type="color"
				title="Role Color"
				bind:value={newColor}
				class="input input-sm aspect-square w-min px-0.5 py-0"
			/>
			<input title="Role Name" bind:value={newName} class="input input-sm grow" />
			<button title="Save" type="submit" class="btn btn-square btn-sm btn-primary">
				<LucideCheck class="size-4" />
			</button>
			<button
				title="Cancel"
				type="reset"
				class="btn btn-square btn-outline btn-sm"
				onclick={() => {
					creatingRole = false;
					newOrdinal = 0.5;
					newColor = '#000000';
					newName = '';
				}}
			>
				<LucideX class="size-4" />
			</button>
		</form>
	{:else}
		<button class="flex w-full justify-center" onclick={() => (creatingRole = true)}>
			<LucidePlus class="size-4" />
			Add Role
		</button>
	{/if}
</li>
