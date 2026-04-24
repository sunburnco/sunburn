<script lang="ts">
	import { LucideLogOut } from '@lucide/svelte';
	import { type Component } from 'svelte';

	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Permissions } from '$lib/constants';
	import {
		cumulativeServerPermissions,
		hasPerm,
		isOwner,
	} from '$lib/sunburn/cumulativePermissions';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	import Channels from './Channels.svelte';
	import Meta from './Meta.svelte';

	let confirmDialog: HTMLDialogElement;

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	const dirtySections = $state({
		meta: false,
		channels: false,
	});
	const dirty = $derived(
		Object.keys(dirtySections).some((k) => dirtySections[k as keyof typeof dirtySections]),
	);

	const serverPermissions = $derived<Set<string>>(
		!instanceID || !serverID
			? new Set()
			: cumulativeServerPermissions(instanceID, serverID, sunburn[instanceID].myID),
	);

	type ButtonSetting_t = {
		name: string;
		description?: string;
		icon?: Component;
		onclick: (() => void) | (() => Promise<void>);
		color?: 'btn-neutral' | 'btn-error';
	};

	beforeNavigate((navigation) => {
		if (dirty) {
			navigation.cancel();
			confirmDialog.showModal();
		}
	});
</script>

<dialog class="modal" bind:this={confirmDialog}>
	<div class="modal-box flex flex-col gap-2">
		<h1 class="text-xl font-bold">Unsaved Changes</h1>
		<p>You have unsaved changes. What do you want to do?</p>
		<div class="mt-2 flex justify-end gap-2">
			<button class="btn btn-primary">Save and Exit</button>
			<button class="btn btn-outline">Discard Changes</button>
			<form method="dialog">
				<button class="btn btn-outline">Cancel</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<div class="my-4 flex flex-col gap-2">
	<h1 class="font-display text-xl font-bold">Server Settings</h1>

	<div class="divider"></div>

	<ul class="menu m-0 w-full p-0">
		{#if isOwner(instanceID, serverID) || hasPerm(serverPermissions, Permissions.ADMINISTRATOR, Permissions.MANAGE_SERVER)}
			<Meta bind:dirty={dirtySections.meta} />
		{/if}

		{#if isOwner(instanceID, serverID) || hasPerm(serverPermissions, Permissions.ADMINISTRATOR, Permissions.MANAGE_CHANNELS)}
			<Channels bind:dirty={dirtySections.channels} />
		{/if}

		<li class="mt-4 menu-title" id="danger">Danger Zone</li>
		<li class="w-full">
			{@render ButtonSetting({
				name: 'Leave Server',
				onclick: () => alert('hi'),
				color: 'btn-error',
				icon: LucideLogOut,
			})}
		</li>
	</ul>
</div>

{#snippet ButtonSetting(setting: ButtonSetting_t)}
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<fieldset class="fieldset w-full md:hidden">
			<legend class="fieldset-legend">{setting.name}</legend>
			<button class={['btn', setting.color]} onclick={setting.onclick}>
				<setting.icon class="size-4" />
			</button>
			{#if setting.description}
				<p class="label text-wrap">
					{setting.description}
				</p>
			{/if}
		</fieldset>

		<label class="hidden grow cursor-pointer items-center justify-between gap-4 md:flex">
			<div class="min-w-1/2">
				<p class="font-bold text-wrap select-none">{setting.name}</p>
				{#if setting.description}
					<p class="text-wrap opacity-60 select-none">
						{setting.description}
					</p>
				{/if}
			</div>
			<button class={['btn', setting.color]} onclick={setting.onclick}>
				<setting.icon class="size-4" />
			</button>
		</label>
	</label>
{/snippet}
