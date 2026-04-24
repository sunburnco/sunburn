<script lang="ts">
	import { page } from '$app/state';
	import { type Server_t, sunburn } from '$lib/sunburn/sunburn.svelte';

	let { dirty = $bindable() }: { dirty: boolean } = $props();
	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let server = $state<Server_t['record'] | undefined>(undefined);
	// TODO there has to be a better way to create a local copy of state
	$effect(() => {
		if (!(instanceID in sunburn) || !(serverID in sunburn[instanceID].servers)) {
			return;
		}
		server = { ...sunburn[instanceID].servers[serverID].record };
	});

	// TODO is there a way to set a bindable to derived?
	$effect(() => {
		if (!server) {
			return;
		}

		for (const key of Object.keys(sunburn[instanceID].servers[serverID].record)) {
			const k = key as keyof Server_t['record'];
			if (server[k] !== sunburn[instanceID].servers[serverID].record[k]) {
				dirty = true;
				return;
			}
		}
		dirty = false;
	});
</script>

{#if server}
	<li class="menu-title" id="meta">Meta</li>
	<li class="w-full">
		<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
			<fieldset class="fieldset w-full md:hidden">
				<legend class="fieldset-legend">Server Name</legend>
				<input name="serverName" class="input w-full" bind:value={server.name} />
			</fieldset>

			<label class={['hidden grow items-center justify-between gap-4 md:flex', 'cursor-pointer']}>
				<div class="min-w-1/2">
					<p class="font-bold select-none">Server Name</p>
				</div>
				<input name="serverName" class="input" bind:value={server.name} />
			</label>
		</label>
	</li>
{/if}
