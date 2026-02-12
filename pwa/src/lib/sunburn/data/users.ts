import { ClientResponseError } from 'pocketbase';

import type { UsersRecord, UsersResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, sunburn } from '../sunburn.svelte';

export const setUserRecord = (
	instanceID: Instance_t['id'],
	userID: UsersRecord['id'],
	record: UsersRecord,
) => {
	sunburn[instanceID].users[userID] = record;
};

export const clearUserRecord = (instanceID: Instance_t['id'], userID: UsersRecord['id']) => {
	delete sunburn[instanceID].users[userID];
};

export const fetchUser = async (
	instanceID: Instance_t['id'],
	userID: UsersRecord['id'],
	_requestKey?: string | null,
) => {
	try {
		const record = (await sunburn[instanceID].pb
			.collection('users')
			.getOne(userID, { requestKey: null })) as UsersResponse<UsersRecord>;
		setUserRecord(instanceID, userID, record);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for user',
				userID,
				_requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			clearUserRecord(instanceID, userID);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching user',
			userID,
			'\n',
			err,
		);
	}
};
