import { ClientResponseError, type RecordSubscription } from 'pocketbase';

import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
import type { TypedPocketBase, UsersRecord, UsersResponse } from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { logFriendly } from '$lib/utils/username';

export const onUser = (
	clientID: string | undefined,
	e: RecordSubscription<UsersResponse<unknown>>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'user', e.record);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: UsersRecord;
	};

	if (action === 'create' || action === 'update') {
		if (!(record.id in sunburn.users)) {
			sunburn.users[record.id] = { record };
		}
		sunburn.users[record.id].record = record;
		sunburn.visibleUsers[clientID].add(e.record.id);
	}
	// delete not allowed by API
};

export const fetchUser = async (
	client: TypedPocketBase,
	user: string,
	requestKey?: string | null
) => {
	if (user === '' || !client.authStore.record?.id) {
		return;
	}

	try {
		const record = (await client.collection('users').getOne(user, { requestKey })) as UsersRecord;
		sunburn.users[record.id] = { record };
		sunburn.visibleUsers[client.authStore.record.id].add(user);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record.id),
				'duplicate fetch request aborted for user',
				user,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record.id),
			'error fetching user',
			user,
			'\n',
			err
		);
	}
};
