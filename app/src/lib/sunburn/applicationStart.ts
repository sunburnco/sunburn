import { get } from 'idb-keyval';
import PocketBase, { LocalAuthStore } from 'pocketbase';

import { initPB } from '$lib/initPB';
import { infoPrefix } from '$lib/logPrefixes';
import type { TypedPocketBase } from '$lib/pb-types';
import { localAuthStoreKeys } from '$lib/sunburn.svelte';

import { loadLocalSettings } from './localSettings.svelte';

export const applicationStart = async () => {
	const ks = (await get('sbLocalAuthStoreKeys')) ?? {};

	const wait = [];
	for (const k of Object.keys(ks)) {
		localAuthStoreKeys[k] = ks[k];
		const pb = new PocketBase(ks[k], new LocalAuthStore(k)) as TypedPocketBase;
		wait.push(initPB(pb));
	}

	await Promise.all(wait);

	await loadLocalSettings();

	// eslint-disable-next-line no-console
	console.info(...infoPrefix, 'welcome to Sunburn');
};
