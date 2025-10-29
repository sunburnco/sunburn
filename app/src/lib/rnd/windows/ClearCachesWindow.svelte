<script lang="ts">
	import { get } from 'idb-keyval';

	import { errorPrefix } from '$lib/logPrefixes';

	import { rndWindows } from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const { windowID }: { windowID: string } = $props();

	let loading = $state(false);
	let success = $state(false);

	const clearCache = async () => {
		try {
			loading = true;

			const authStoreKeys = (await get('sbLocalAuthStoreKeys')) ?? {};

			for (const authStoreKey of Object.keys(authStoreKeys)) {
				localStorage.removeItem(authStoreKey);
			}

			indexedDB.deleteDatabase('keyval-store');
			localStorage.removeItem('theme');
		} catch (err: unknown) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, 'error clearing caches\n', err);
		} finally {
			rndWindows[windowID].title = 'Clear Caches (Success)';
			loading = false;
			success = true;
		}
	};
</script>

<WindowBase>
	{#if !success}
		<form onsubmit={clearCache} class="flex grow flex-col gap-2">
			<h1 class="font-display text-2xl font-bold">Confirm</h1>
			<p>
				Are you sure you want to clear all caches? You will need to sign back in to all accounts.
			</p>
			<button type="submit" disabled={loading} class="btn btn-primary">Clear Caches</button>
		</form>
	{:else}
		<div class="flex w-full flex-col gap-2">
			<h1 class="font-display text-2xl font-bold">Success</h1>
			<p>Please refresh the application.</p>
			<a href={location.pathname} data-sveltekit-reload class="btn btn-primary">Refresh</a>
		</div>
	{/if}
</WindowBase>
