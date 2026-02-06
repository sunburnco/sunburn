import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type { ServerRoleAssignmentsRecord, ServerRoleAssignmentsResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import {
	type Instance_t,
	type Role_t,
	type Server_t,
	type ServerMember_t,
	sunburn,
} from '../sunburn.svelte';
import { fetchRole } from './roles';
import { fetchServer } from './server';

export const setRoleAssignment = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	userID: ServerMember_t['id'],
	roleID: Role_t['record']['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, serverID, serverID).then(() =>
			setRoleAssignment(instanceID, serverID, roleID, userID),
		);
		return;
	}

	if (!(roleID in sunburn[instanceID].servers[serverID].roles)) {
		fetchRole(instanceID, serverID, roleID, roleID).then(() =>
			setRoleAssignment(instanceID, serverID, roleID, userID),
		);
		return;
	}

	if (!(userID in sunburn[instanceID].servers[serverID].members)) {
		sunburn[instanceID].servers[serverID].members[userID] = {
			id: userID,
			roleIDs: new SvelteSet(),
		};
	}
	sunburn[instanceID].servers[serverID].members[userID].roleIDs.add(roleID);
};

export const clearRoleAssignment = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	userID: ServerMember_t['id'],
	roleID: Role_t['record']['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		return;
	}

	if (!(userID in sunburn[instanceID].servers[serverID].members)) {
		return;
	}

	sunburn[instanceID].servers[serverID].members[userID].roleIDs.delete(roleID);
};

export const fetchRoleAssignmentsForServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	requestKey?: string | null,
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		await fetchServer(instanceID, serverID, requestKey + serverID);
	}

	try {
		const srasResp = await sunburn[instanceID].pb
			.collection('serverRoleAssignments')
			.getFullList<ServerRoleAssignmentsResponse<ServerRoleAssignmentsRecord>>({
				filter: sunburn[instanceID].pb.filter('role.server = {:serverID}', { serverID }),
			});
		for (const sra of srasResp) {
			setRoleAssignment(instanceID, serverID, sra.user, sra.role);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for server role assignments',
				serverID,
				requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching role assignments for server',
			serverID,
			'\n',
			err,
		);
	}
};
