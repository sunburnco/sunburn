import { ClientResponseError } from 'pocketbase';

import type { PinnedServersRecord, PinnedServersResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Server_t, sunburn } from '../sunburn.svelte';

export const setPinnedServerRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
) => {
	sunburn[instanceID].pinnedServerIDs.add(serverID);
};

export const clearPinnedServerRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
) => {
	sunburn[instanceID].pinnedServerIDs.delete(serverID);
};

export const fetchPinnedServers = async (
	instanceID: Instance_t['id'],
	_requestKey?: string | null,
) => {
	try {
		const pinnedServersResp = await sunburn[instanceID].pb
			.collection('pinnedServers')
			.getFullList<PinnedServersResponse<PinnedServersRecord>>({ requestKey: null });
		for (const pinnedServer of pinnedServersResp) {
			setPinnedServerRecord(instanceID, pinnedServer.server);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for pinned server list',
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'unable to fetch pinned server list\n',
			err,
		);
	}
};
