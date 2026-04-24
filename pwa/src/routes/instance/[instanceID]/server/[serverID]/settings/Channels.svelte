<script lang="ts">
	import { LucideCheck, LucidePlus, LucideX } from '@lucide/svelte';
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import { ChannelType } from '$lib/constants';
	import type { IsoAutoDateString } from '$lib/pb-types';
	import { type Channel_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { pbID } from '$lib/utils/pbID';

	import ChannelEditor from './ChannelEditor.svelte';

	let { dirty = $bindable() }: { dirty: boolean } = $props();
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
		value: {
			name: string;
			type: ChannelType;
		};
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
		const ret = {} as Record<
			Channel_t['record']['id'],
			(Channel_t['record'] & { _local?: boolean }) | undefined
		>;
		// no checks for instance or server existence because that's handled by +layout.svelte
		for (const channelID of Object.keys(sunburn[instanceID].servers[serverID].channels)) {
			ret[channelID] = { ...sunburn[instanceID].servers[serverID].channels[channelID].record };
		}
		return ret;
	});
	let channelIDList = $derived<(keyof typeof channels)[]>(Object.keys(channels));

	const rename = (channelID: string, value: string) => {
		changes[channelID] = changes[channelID] || [];
		// for local channels (i.e., not yet committed to DB), just change the "create" action instead of adding a rename
		if (channels[channelID]?._local) {
			const index = changes[channelID].findIndex((c) => c.action === 'create');
			if (index > -1) {
				(changes[channelID][index] as CreateAction_t).value.name = value;
			}
			return;
		}

		if (value === sunburn[instanceID].servers[serverID].channels[channelID].record.name) {
			const index = changes[channelID].findIndex((c) => c.action === 'rename');
			if (index > -1) {
				changes[channelID].splice(index, 1);
			}
		} else {
			changes[channelID].push({ action: 'rename', value });
		}
	};
	const create = (name: string, type: ChannelType) => {
		const channelID = pbID();
		changes[channelID] = [];
		changes[channelID].push({ action: 'create', value: { name, type } });
		channels = {
			...channels,
			[channelID]: {
				id: channelID,
				created: DateTime.now().toSQL() as IsoAutoDateString,
				updated: DateTime.now().toSQL() as IsoAutoDateString,
				name,
				server: serverID,
				type,
				_local: true,
			},
		};
	};
	const del = (channelID: string) => {
		changes[channelID] = changes[channelID] || [];
		// for local channels, remove the "create" action
		if (channels[channelID]?._local) {
			changes[channelID] = [];
			channels = { ...channels, [channelID]: undefined };
			return;
		}

		// for other channels, push the change
		changes[channelID].push({ action: 'delete' });
	};
</script>

{#if sunburn[instanceID]?.servers[serverID]?.loaded}
	<li class="menu-title" id="channels">Channels</li>
	{#each channelIDList as channelID (channelID)}
		{#if !(changes[channelID] || []).find((c) => c.action === 'delete')}
			<ChannelEditor channel={channels[channelID]} {rename} {del} />
		{/if}
	{/each}
	<li>
		{#if creatingChannel}
			<div class="flex justify-between active:bg-inherit active:text-current">
				<div class="flex w-1/2 gap-1">
					<select title="Channel Type" bind:value={newType} class="select w-min select-sm">
						<option value={ChannelType.TEXT} label="Text"></option>
						<option value={ChannelType.VOICE} label="Voice"></option>
					</select>
					<input title="Channel Name" bind:value={newName} class="input input-sm grow" />
				</div>

				<div class="flex gap-1">
					<button
						title="Save"
						class="btn btn-square btn-sm btn-primary"
						onclick={() => {
							create(newName, newType);
							newType = ChannelType.TEXT;
							newName = '';
						}}
					>
						<LucideCheck class="size-4" />
					</button>
					<button
						title="Cancel"
						class="btn btn-square btn-outline btn-sm"
						onclick={() => {
							creatingChannel = false;
							newType = ChannelType.TEXT;
							newName = '';
						}}
					>
						<LucideX class="size-4" />
					</button>
				</div>
			</div>
		{:else}
			<button class="flex w-full justify-center" onclick={() => (creatingChannel = true)}>
				<LucidePlus class="size-4" />
				Add Channel
			</button>
		{/if}
	</li>
{/if}
