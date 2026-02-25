import { get } from 'idb-keyval';
import PocketBase, { LocalAuthStore } from 'pocketbase';

import type { TypedPocketBase } from '$lib/pb-types';
import { infoPrefix } from '$lib/utils/logPrefixes';
import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';

import { initPB } from './initPB';
import { loadLocalSettings } from './localSettings.svelte';
import { type BaseURL_t, type LocalAuthStoreKey_t, localAuthStoreKeys } from './sunburn.svelte';

export const applicationStart = async () => {
	const ks = (await get<Record<LocalAuthStoreKey_t, BaseURL_t>>('sbLocalAuthStoreKeys')) ?? {};

	const wait: Promise<unknown>[] = [];
	for (const k of Object.keys(ks)) {
		localAuthStoreKeys[k as LocalAuthStoreKey_t] = ks[k as LocalAuthStoreKey_t];
		const pb = new PocketBase(
			ks[k as LocalAuthStoreKey_t],
			new LocalAuthStore(parseInstanceSlug(ks[k as LocalAuthStoreKey_t], '')),
		) as TypedPocketBase;
		wait.push(initPB(pb, k.split('@')[0]));
	}

	await Promise.all(wait);

	await loadLocalSettings();

	// eslint-disable-next-line no-console
	console.info(...infoPrefix, 'welcome to Sunburn');
};
