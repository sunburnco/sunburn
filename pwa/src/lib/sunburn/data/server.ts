import { ClientResponseError } from 'pocketbase';

import { type ServersRecord, type ServersResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Server_t, sunburn } from '../sunburn.svelte';

export const setServerRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	record: Server_t['record'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		sunburn[instanceID].servers[serverID] = {
			record,
			channels: {},
			members: {},
			roles: {},
		};
		return;
	}

	sunburn[instanceID].servers[serverID].record = record;
};

export const clearServerRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
) => {
	delete sunburn[instanceID].servers[serverID];
};

export const fetchServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	requestKey?: string | null,
) => {
	try {
		const server = (await sunburn[instanceID].pb
			.collection('servers')
			.getOne(serverID, { requestKey })) as ServersResponse<ServersRecord>;
		setServerRecord(instanceID, serverID, server);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for server',
				serverID,
				requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			clearServerRecord(instanceID, serverID);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching server',
			serverID,
			'\n',
			err,
		);
	}
};
