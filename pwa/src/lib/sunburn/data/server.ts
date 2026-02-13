import { ClientResponseError } from 'pocketbase';

import { type ServersRecord, type ServersResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Server_t, sunburn } from '../sunburn.svelte';
import { fetchChannelsForServer } from './channels';
import { fetchRoleAssignmentsForServer } from './roleAssignments';
import { fetchRolesForServer } from './roles';

export const setServerRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	record: Server_t['record'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		sunburn[instanceID].servers[serverID] = {
			record,
			loaded: false,
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
	_requestKey?: string | null,
) => {
	try {
		const server = await sunburn[instanceID].pb
			.collection('servers')
			.getOne<ServersResponse<ServersRecord>>(serverID, { requestKey: null });
		setServerRecord(instanceID, serverID, server);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for server',
				serverID,
				_requestKey,
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

export const fetchServersForInstance = async (
	instanceID: Instance_t['id'],
	_requestKey?: string | null,
) => {
	try {
		const serversResp = await sunburn[instanceID].pb
			.collection('servers')
			.getFullList<ServersResponse<ServersRecord>>({ requestKey: null });

		for (const server of serversResp) {
			setServerRecord(instanceID, server.id, server);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for full server list',
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching full server list\n',
			err,
		);
	}
};

export const loadServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	_requestKey?: string | null,
) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'loading server', serverID);
	sunburn[instanceID].servers[serverID].loaded = true;
	await fetchServer(instanceID, serverID, null);

	// this also fetches role permissions
	fetchRolesForServer(instanceID, serverID, null);

	// this also fetches channel role assignments and voice participants
	fetchChannelsForServer(instanceID, serverID, null);

	// fetch member role assignments, but do not fetch the user
	// users are fetched when rendered (i.e. message, user list, etc)
	fetchRoleAssignmentsForServer(instanceID, serverID, null);
};
