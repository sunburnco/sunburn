import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type { ServerRolesRecord, ServerRolesResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Role_t, type Server_t, sunburn } from '../sunburn.svelte';
import { fetchServer } from './server';

export const setRoleRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	record: ServerRolesRecord,
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, record.server).then(() =>
			setRoleRecord(instanceID, serverID, roleID, record),
		);
		return;
	}

	if (!(roleID in sunburn[instanceID].servers[serverID].roles)) {
		sunburn[instanceID].servers[serverID].roles[roleID] = {
			permissions: new SvelteSet(),
			record,
		};
	}
};

export const clearRoleRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
) => {
	delete sunburn[instanceID].servers[serverID].roles[roleID];
};

export const fetchRole = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	requestKey?: string | null,
) => {
	try {
		const role = await sunburn[instanceID].pb
			.collection('serverRoles')
			.getOne<ServerRolesResponse<ServerRolesRecord>>(roleID, { requestKey });
		setRoleRecord(instanceID, serverID, roleID, role);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for role',
				roleID,
				requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			clearRoleRecord(instanceID, serverID, roleID);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(...errorPrefix, 'error fetching role', roleID, '\n', err);
	}
};

export const fetchRolessForServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	requestKey?: string | null,
) => {
	try {
		if (!(serverID in sunburn[instanceID].servers)) {
			await fetchServer(instanceID, serverID);
		}

		const rolesResp = await sunburn[instanceID].pb
			.collection('serverRoles')
			.getFullList<ServerRolesResponse<ServerRolesRecord>>({
				filter: sunburn[instanceID].pb.filter('server = {:serverID}', { serverID }),
				requestKey,
			});

		for (const role of rolesResp) {
			setRoleRecord(instanceID, serverID, role.id, role);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for full role list',
				serverID,
				requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			// eslint-disable-next-line no-console
			console.warn(...warnPrefix, 'not allowed to fetch roles for server', serverID, '\n', err);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching roles for server',
			serverID,
			'\n',
			err,
		);
	}
};
