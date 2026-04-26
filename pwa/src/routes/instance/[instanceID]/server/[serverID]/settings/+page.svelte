<script lang="ts">
	import { LucideLoaderCircle, LucideLogOut } from '@lucide/svelte';
	import type { BeforeNavigate } from '@sveltejs/kit';
	import { type Component } from 'svelte';
	import { fade } from 'svelte/transition';

	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Permissions } from '$lib/constants';
	import {
		cumulativeServerPermissions,
		hasPerm,
		isOwner,
	} from '$lib/sunburn/cumulativePermissions';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	import Channels from './Channels.svelte';
	import Meta from './Meta.svelte';

	let confirmDialog: HTMLDialogElement;
	let nav = $state<BeforeNavigate | null>(null);

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	const dirtySections = $state({
		meta: false,
		channels: false,
	});
	const dirty = $derived(
		Object.keys(dirtySections).some((k) => dirtySections[k as keyof typeof dirtySections]),
	);
	const saveFunctions = $state({
		meta: async () => {
			return;
		},
		channels: async () => {
			return;
		},
	});
	let saving = $state(false);

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
			nav = navigation;
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'cancelled navigation because one or more sections are dirty',
				$state.snapshot(dirtySections),
			);
			confirmDialog.showModal();
		}
	});

	const saveAll = async () => {
		saving = true;
		try {
			// must await so dependency chains can resolve (e.g. channels -> roles -> CRA -> SRP)
			if (dirtySections.meta) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, logFriendly(instanceID), 'saving meta');
				await saveFunctions.meta();
			}
			if (dirtySections.channels) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, logFriendly(instanceID), 'saving channels');
				await saveFunctions.channels();
			}

			if (nav) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, logFriendly(instanceID), 'resuming navigation');
				// https://discord.com/channels/457912077277855764/1023340103071965194/threads/1270482626502983680
				if (nav.delta) {
					history.go(nav.delta);
				} else if (nav.to?.url) {
					goto(nav.to?.url);
				}
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, 'one or more errors occurred while saving changes\n', err);
		} finally {
			saving = false;
		}
	};

	const exitWithoutSaving = () => {
		if (nav) {
			dirtySections.meta = false;
			dirtySections.channels = false;
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'resuming navigation');
			// thanks @rchaoz https://discord.com/channels/457912077277855764/1023340103071965194/threads/1270482626502983680
			if (nav.delta) {
				history.go(nav.delta);
			} else if (nav.to?.url) {
				goto(nav.to?.url);
			}
		}
	};
</script>

<dialog class="modal" bind:this={confirmDialog}>
	<div class="modal-box flex flex-col gap-2">
		{#if saving}
			<h1 class="text-xl font-bold">Unsaved Changes</h1>
			<div class="mt-2 flex items-center gap-2">
				Saving <LucideLoaderCircle class="inline size-4 animate-spin" />
			</div>
		{:else}<h1 class="text-xl font-bold">Unsaved Changes</h1>
			<p>You have unsaved changes. What do you want to do?</p>
			<div class="mt-2 flex flex-col items-stretch justify-end gap-2 sm:flex-row">
				<button class="btn btn-primary" onclick={saveAll}>Save and Exit</button>
				<button class="btn btn-outline" onclick={exitWithoutSaving}>Discard Changes</button>
				<form method="dialog">
					<button class="btn w-full btn-outline" onclick={() => (nav = null)}>Cancel</button>
				</form>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => (nav = null)}>close</button>
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
			<Channels bind:dirty={dirtySections.channels} bind:saveChanges={saveFunctions.channels} />
		{/if}

		<li class="mt-4 menu-title" id="danger">Danger Zone</li>
		<li class="w-full">
			{@render ButtonSetting({
				name: 'Leave Server',
				description: 'hehehe',
				onclick: () => alert('hi'),
				color: 'btn-error',
				icon: LucideLogOut,
			})}
		</li>
	</ul>
</div>
{#if dirty}
	<div
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 150 }}
		class="sticky bottom-4 mt-8 w-full rounded-box border border-base-content/50 bg-base-200 px-3 py-2 drop-shadow-md"
	>
		<div class="flex items-center justify-between">
			<h2 class="font-display text-lg">Unsaved Changes</h2>
			<button
				disabled={saving}
				class={['btn btn-primary', saving && 'btn-square']}
				onclick={saveAll}
			>
				{#if saving}
					<LucideLoaderCircle class="size-4 animate-spin" />
				{:else}
					Save
				{/if}
			</button>
		</div>
	</div>
{/if}

{#snippet ButtonSetting(setting: ButtonSetting_t)}
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<label class="flex grow cursor-pointer items-center justify-between gap-4">
			<div class="min-w-1/2">
				<p class="font-bold text-wrap select-none">{setting.name}</p>
				{#if setting.description}
					<p class="text-wrap opacity-60 select-none">
						{setting.description}
					</p>
				{/if}
			</div>
			<button class={['btn btn-square', setting.color]} onclick={setting.onclick}>
				<setting.icon class="size-4" />
			</button>
		</label>
	</label>
{/snippet}
