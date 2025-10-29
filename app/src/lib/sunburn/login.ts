import { set } from 'idb-keyval';
import PocketBase, { BaseAuthStore, ClientResponseError, LocalAuthStore } from 'pocketbase';

import { initPB } from '$lib/initPB';
import { debugPrefix, errorPrefix, infoPrefix } from '$lib/logPrefixes';
import type { TypedPocketBase } from '$lib/pb-types';
import { localAuthStoreKeys } from '$lib/sunburn.svelte';
import { authStoreKey } from '$lib/utils/authStoreKey';

export const loginWithPassword = async (
	instanceURL: string,
	emailOrUsername: string,
	password: string
) => {
	const hostname = authStoreKey(instanceURL);
	try {
		// in-memory to fetch handle
		const tmpPB = new PocketBase(instanceURL, new BaseAuthStore()) as TypedPocketBase;
		const handle = (await tmpPB.collection('users').authWithPassword(emailOrUsername, password))
			.record.handle_lowercase;
		tmpPB.authStore.clear();

		const authStoreKey = `${handle}@${hostname}`;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, 'adding account', authStoreKey);

		const pb = new PocketBase(instanceURL, new LocalAuthStore(authStoreKey)) as TypedPocketBase;
		await pb.collection('users').authWithPassword(handle, password);
		initPB(pb, true);

		localAuthStoreKeys[authStoreKey] = instanceURL;
		await set('sbLocalAuthStoreKeys', localAuthStoreKeys);

		if (pb.authStore.record?.id) {
			const rec = await pb
				.collection('users')
				.getOne(pb.authStore.record?.id, { requestKey: null });
			return rec.handle;
		}

		// eslint-disable-next-line no-console
		console.info(...infoPrefix, 'added account', authStoreKey);
		return null;
	} catch (err) {
		if (err instanceof ClientResponseError) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, 'unable to add account\n', err);
		}
		return null;
	}
};
