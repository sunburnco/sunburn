import { ClientResponseError, type RecordSubscription } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
import type {
	PinnedDMsRecord,
	PinnedDMsResponse,
	PinnedServersRecord,
	PinnedServersResponse,
	TypedPocketBase
} from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { logFriendly } from '$lib/utils/username';

export const onPinnedDM = (
	clientID: string | undefined,
	e: RecordSubscription<PinnedDMsResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'pinned DM', e.record);

	const { action, record } = e as {
		action: 'create' | 'delete';
		record: PinnedDMsRecord;
	};

	if (action === 'create') {
		if (!(record.user in sunburn.clients)) {
			return;
		}

		addPinnedDMToMemory(clientID, record);
	} else if (action === 'delete') {
		sunburn.pinnedDMs[record.user]?.delete(record.recipient);
	}
};

export const onPinnedServer = (
	clientID: string | undefined,
	e: RecordSubscription<PinnedServersResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'pinned server', e.record);

	const { action, record } = e as {
		action: 'create' | 'delete';
		record: PinnedServersRecord;
	};

	if (action === 'create') {
		if (!(record.user in sunburn.clients)) {
			return;
		}

		addPinnedServerToMemory(clientID, record);
	} else if (action === 'delete') {
		sunburn.pinnedDMs[record.user]?.delete(record.server);
	}
};

export const fetchPinnedDMs = async (client: TypedPocketBase, requestKey?: string | null) => {
	try {
		const records = await client.collection('pinnedDMs').getFullList({ requestKey });
		for (const record of records) {
			addPinnedDMToMemory(client.authStore.record?.id, record);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for pinned DMs for client',
				client,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching pinned DMs for client',
			client,
			'\n',
			err
		);
	}
};

export const fetchPinnedServers = async (client: TypedPocketBase, requestKey?: string | null) => {
	try {
		const records = await client.collection('pinnedServers').getFullList({ requestKey });
		for (const record of records) {
			addPinnedServerToMemory(client.authStore.record?.id, record);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for pinned servers for client',
				client,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching pinned servers for client',
			client,
			'\n',
			err
		);
	}
};

const addPinnedDMToMemory = (client: string | undefined, record: PinnedDMsRecord) => {
	if (!client) {
		return;
	}

	if (!(record.user in sunburn.pinnedDMs)) {
		sunburn.pinnedDMs[record.user] = new SvelteSet();
	}
	sunburn.pinnedDMs[record.user].add(record.recipient);
};

const addPinnedServerToMemory = (client: string | undefined, record: PinnedServersRecord) => {
	if (!client) {
		return;
	}

	if (!(record.server in sunburn.pinnedServers)) {
		sunburn.pinnedServers[record.user] = new SvelteSet();
	}
	sunburn.pinnedServers[record.user].add(record.server);
};
