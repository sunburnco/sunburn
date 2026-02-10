import { set } from 'idb-keyval';
import PocketBase, { LocalAuthStore } from 'pocketbase';

import type { TypedPocketBase } from '$lib/pb-types';
import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';

import { initPB } from './initPB';
import { type BaseURL_t, type LocalAuthStoreKey_t, localAuthStoreKeys } from './sunburn.svelte';

export const logInWithPassword = async (
	baseURL: BaseURL_t, // http://localhost:8090
	emailOrUsername: string,
	password: string,
) => {
	const instanceID = parseInstanceSlug(baseURL, '');

	const pb = new PocketBase(baseURL, new LocalAuthStore(instanceID)) as TypedPocketBase;

	const resp = await pb.collection('users').authWithPassword(emailOrUsername, password);
	const handle = resp.record.handle_lowercase;

	initPB(pb, handle, true);

	const authStoreKey: LocalAuthStoreKey_t = `${handle}@${instanceID}`;
	localAuthStoreKeys[authStoreKey] = baseURL;
	await set('sbLocalAuthStoreKeys', localAuthStoreKeys);

	return resp.record.handle;
};
