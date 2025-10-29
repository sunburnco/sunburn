<script lang="ts">
	import { set } from 'idb-keyval';

	import { debugPrefix, errorPrefix, infoPrefix } from '$lib/logPrefixes';
	import { localAuthStoreKeys, sunburn } from '$lib/sunburn.svelte';
	import { handleAtHost } from '$lib/utils/username';

	import { rndWindows } from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const { windowID, owner }: { windowID: string; owner: string } = $props();

	let loading = $state(false);
	let success = $state(false);

	const logout = async () => {
		try {
			loading = true;

			const localAuthStoreKey = handleAtHost(owner, owner);

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, 'removing account', owner);

			sunburn.clients[owner].collection('*').unsubscribe();
			sunburn.clients[owner].authStore.clear();
			delete sunburn.clients[owner];
			delete sunburn.auths[owner];
			delete localAuthStoreKeys[localAuthStoreKey];
			await set('sbLocalAuthStoreKeys', localAuthStoreKeys);

			// eslint-disable-next-line no-console
			console.info(...infoPrefix, 'removed account', localAuthStoreKey);
		} catch (err: unknown) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, 'error logging out\n', err);
		} finally {
			rndWindows[windowID].title = `Log Out (Success)`;
			loading = false;
			success = true;
		}
	};
</script>

<WindowBase>
	{#if !success}
		<form onsubmit={logout} class="flex grow flex-col gap-2">
			<h1 class="font-display text-2xl font-bold">Confirm</h1>
			<p>Are you sure you want to log out?</p>
			<button type="submit" disabled={loading} class="btn btn-primary">Log Out</button>
		</form>
	{:else}
		<div class="flex w-full flex-col gap-2">
			<h1 class="font-display text-2xl font-bold">Success</h1>
			<p>You may need to refresh the application to update caches.</p>
		</div>
	{/if}
</WindowBase>
