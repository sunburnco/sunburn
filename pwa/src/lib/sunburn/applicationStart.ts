import { get } from 'idb-keyval';
import PocketBase, { LocalAuthStore } from 'pocketbase';

import type { TypedPocketBase } from '$lib/pb-types';

import { localAuthStoreKeys } from './sunburn.svelte';

export const applicationStart = async () => {
	const ks = (await get('sbLocalAuthStoreKeys')) ?? {};

	const wait: Promise<unknown>[] = [];
	for (const k of Object.keys(ks)) {
		localAuthStoreKeys[k] = ks[k];
		const pb = new PocketBase(ks[k], new LocalAuthStore(k)) as TypedPocketBase;
		// wait.push(initPB(pb))
	}

	await Promise.all(wait);

	// await loadLocalSettings
};
