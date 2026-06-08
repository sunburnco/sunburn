<script lang="ts">
	import { page } from '$app/state';
	import { type Server_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { saveServersRecord } from '$lib/utils/changeServerSettings';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	let {
		dirty = $bindable(),
		saveChanges = $bindable(),
	}: { dirty: boolean; saveChanges: () => Promise<void> } = $props();
	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	type RenameAction_t = {
		action: 'rename';
		value: string;
	};
	type IconAction_t = {
		action: 'icon';
		value: File;
	};
	type Action_t = RenameAction_t | IconAction_t;

	const changes = $state<Action_t[]>([]);
	$effect(() => {
		dirty = changes.length > 0;
	});

	const server = $derived.by(() => {
		const ret = $state<Server_t['record']>({ ...sunburn[instanceID].servers[serverID].record });

		for (const change of changes) {
			switch (change.action) {
				case 'rename':
					ret.name = change.value;
					break;
				case 'icon':
					break;
			}
		}

		return ret;
	});

	const rename = (value: string) => {
		// if there's already a RENAME change, reuse it
		const changeIndex = changes.findIndex((c) => c.action === 'rename');
		if (changeIndex > -1) {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'reusing RENAME change');
			changes[changeIndex].value = value;
		} else {
			// otherwise, push a new RENAME change
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'adding RENAME change');
			changes.push({ action: 'rename', value } as RenameAction_t);
		}
	};
	const icon = (value: File) => {
		// if there's already an ICON change, reuse it
		const changeIndex = changes.findIndex((c) => c.action === 'icon');
		if (changeIndex > -1) {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'reusing ICON change');
			changes[changeIndex].value = value;
		} else {
			// otherwise, push a new ICON change
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'adding ICON change');
			changes.push({ action: 'icon', value } as IconAction_t);
		}
	};

	saveChanges = async () => {
		const iconChangeIndex = changes.findIndex((c) => c.action === 'icon');
		await saveServersRecord(
			instanceID,
			server,
			iconChangeIndex > -1 ? (changes[iconChangeIndex] as IconAction_t).value : undefined,
		);
		while (changes.length > 0) {
			changes.pop();
		}
	};
</script>

{#if server}
	<li class="menu-title" id="meta">Meta</li>
	<li class="w-full">
		<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
			<!-- mobile -->
			<fieldset class="fieldset w-full md:hidden">
				<legend class="fieldset-legend">Server Name</legend>
				<input
					name="serverName"
					class="input w-full"
					value={server.name}
					oninput={(e) => {
						rename((e.target as HTMLInputElement).value);
					}}
				/>
			</fieldset>

			<!-- desktop -->
			<label class={['hidden grow items-center justify-between gap-4 md:flex', 'cursor-pointer']}>
				<div class="min-w-1/2">
					<p class="font-bold select-none">Server Name</p>
				</div>
				<input
					name="serverName"
					class="input"
					value={server.name}
					oninput={(e) => {
						rename((e.target as HTMLInputElement).value);
					}}
				/>
			</label>
		</label>
	</li>

	<li class="w-full">
		<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
			<!-- mobile -->
			<fieldset class="fieldset w-full md:hidden">
				<legend class="fieldset-legend">Upload New Icon</legend>
				<input
					name="serverIcon"
					class="file-input w-full"
					type="file"
					accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
					oninput={(e) => {
						const el = e.target as HTMLInputElement;
						const files = el.files;
						if (!files || files.length === 0) {
							return;
						}
						icon(files[0]);
					}}
				/>
			</fieldset>

			<!-- desktop -->
			<label class={['hidden grow items-center justify-between gap-4 md:flex', 'cursor-pointer']}>
				<div class="min-w-1/2">
					<p class="font-bold select-none">Upload New Icon</p>
					<p class="opacity-60 select-none">Max. 5MB</p>
				</div>
				<input
					name="serverIcon"
					class="file-input"
					type="file"
					accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
					oninput={(e) => {
						const el = e.target as HTMLInputElement;
						const files = el.files;
						if (!files || files.length === 0) {
							return;
						}
						icon(files[0]);
					}}
				/>
			</label>
		</label>
	</li>
{/if}
