<script lang="ts">
	import { LucideCheck, LucidePlus, LucideX } from '@lucide/svelte';
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import { ChannelType } from '$lib/constants';
	import type { ChannelsRecord, IsoAutoDateString } from '$lib/pb-types';
	import { type Channel_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { createChannel, deleteChannel, renameChannel } from '$lib/utils/changeServerSettings';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { pbID } from '$lib/utils/pbID';
	import { logFriendly } from '$lib/utils/username';

	import ChannelEditor from './ChannelEditor.svelte';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
	}: {
		dirty: boolean;
		saveChanges: () => Promise<void>;
	} = $props();
	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let creatingChannel = $state(false);
	let newType = $state<ChannelType>(ChannelType.TEXT);
	let newName = $state('');

	type RenameAction_t = {
		action: 'rename';
		value: string;
	};
	type CreateAction_t = {
		action: 'create';
		value: ChannelsRecord;
	};
	type DeleteAction_t = {
		action: 'delete';
	};
	type OrdinalAction_t = {
		action: 'ordinal';
		value: number;
	};
	// TODO why doesn't this work?
	// type Action_t = XOR<RenameAction_t, CreateAction_t, DeleteAction_t, OrdinalAction_t>;
	type Action_t = RenameAction_t | CreateAction_t | DeleteAction_t | OrdinalAction_t;

	const changes = $state<Record<Channel_t['record']['id'], Action_t[]>>({});
	$effect(() => {
		dirty =
			Object.keys(changes).length > 0 &&
			Object.keys(changes).every((key) => changes[key] && changes[key].length !== 0);
	});

	let channels = $derived.by(() => {
		const ret = $state(
			{} as Record<
				Channel_t['record']['id'],
				(Channel_t['record'] & { _local?: boolean }) | undefined
			>,
		);

		// no checks for instance or server existence because that's handled by +layout.svelte
		for (const channelID of Object.keys(sunburn[instanceID].servers[serverID].channels)) {
			ret[channelID] = { ...sunburn[instanceID].servers[serverID].channels[channelID].record };
		}
		return ret;
	});

	const rename = (channelID: string, value: string) => {
		changes[channelID] = changes[channelID] || [];
		// for local channels (i.e., not yet committed to DB), just change the "create" action instead of adding a rename
		if (channels[channelID]?._local) {
			const index = changes[channelID].findIndex((c) => c.action === 'create');
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'renaming CREATE change for channel',
					channelID,
				);
				(changes[channelID][index] as CreateAction_t).value.name = value;
			}
			return;
		}

		if (value === sunburn[instanceID].servers[serverID].channels[channelID].record.name) {
			const index = changes[channelID].findIndex((c) => c.action === 'rename');
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'reverting RENAME change for channel',
					channelID,
				);
				changes[channelID].splice(index, 1);
			}
		} else {
			// if there's already a RENAME, reuse it
			const index = changes[channelID].findIndex((c) => c.action === 'rename');
			if (index > -1) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(instanceID),
					'reusing existing RENAME for channel',
					channelID,
				);
				(changes[channelID][index] as RenameAction_t).value = value;
				return;
			}

			// otherwise, push a new RENAME
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'adding RENAME change for channel',
				channelID,
			);
			changes[channelID].push({ action: 'rename', value });
		}
	};
	const create = (name: string, type: ChannelType) => {
		const channelID = pbID();
		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(instanceID),
			'adding CREATE for local channel',
			channelID,
		);
		changes[channelID] = [];
		const now = DateTime.now().toSQL() as IsoAutoDateString;
		changes[channelID].push({
			action: 'create',
			value: { id: channelID, name, type, server: serverID, created: now, updated: now },
		});
		channels[channelID] = {
			id: channelID,
			created: DateTime.now().toSQL() as IsoAutoDateString,
			updated: DateTime.now().toSQL() as IsoAutoDateString,
			name,
			server: serverID,
			type,
			_local: true,
		};
	};
	const del = (channelID: string) => {
		changes[channelID] = changes[channelID] || [];
		// for local channels, remove the "create" action
		if (channels[channelID]?._local) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'removing CREATE for local channel',
				channelID,
			);
			delete changes[channelID];
			delete channels[channelID];
			return;
		}

		// for other channels, push the change
		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(instanceID), 'adding DELETE for channel', channelID);
		changes[channelID].push({ action: 'delete' });
	};

	saveChanges = async () => {
		for (const channelID of Object.keys(changes)) {
			for (const action of changes[channelID]) {
				switch (action.action) {
					case 'rename':
						await renameChannel(instanceID, channelID, action.value);
						break;
					case 'create':
						await createChannel(instanceID, serverID, action.value);
						break;
					case 'delete':
						await deleteChannel(instanceID, channelID);
						break;
					case 'ordinal':
						// TODO implement
						break;
				}
			}
			delete changes[channelID];
		}
	};
</script>

{#if sunburn[instanceID]?.servers[serverID]?.loaded}
	<li class="menu-title" id="channels">Channels</li>
	<!-- {#each channelIDList as channelID (channelID)} -->
	{#each Object.keys(channels) as channelID (channelID)}
		{#if !(changes[channelID] || []).find((c) => c.action === 'delete')}
			<ChannelEditor channel={channels[channelID]} {rename} {del} />
		{/if}
	{/each}
	<li>
		{#if creatingChannel}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					if (newName === '') {
						return;
					}
					create(newName, newType);
					creatingChannel = false;
					newType = ChannelType.TEXT;
					newName = '';
				}}
				class="flex justify-between gap-1 active:bg-inherit active:text-current"
			>
				<select title="Channel Type" bind:value={newType} class="select w-min select-sm">
					<option value={ChannelType.TEXT} label="Text"></option>
					<option value={ChannelType.VOICE} label="Voice"></option>
				</select>
				<input title="Channel Name" bind:value={newName} class="input input-sm grow" />
				<button title="Save" type="submit" class="btn btn-square btn-sm btn-primary">
					<LucideCheck class="size-4" />
				</button>
				<button
					title="Cancel"
					type="reset"
					class="btn btn-square btn-outline btn-sm"
					onclick={() => {
						creatingChannel = false;
						newType = ChannelType.TEXT;
						newName = '';
					}}
				>
					<LucideX class="size-4" />
				</button>
			</form>
		{:else}
			<button class="flex w-full justify-center" onclick={() => (creatingChannel = true)}>
				<LucidePlus class="size-4" />
				Add Channel
			</button>
		{/if}
	</li>
{/if}
