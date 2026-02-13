import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type {
	ServerRolePermissionsRecord,
	ServerRolePermissionsResponse,
	ServerRolesRecord,
	ServerRolesResponse,
} from '$lib/pb-types';
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
	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(roleID in sunburn[instanceID].servers[serverID].roles)
	) {
		return;
	}

	delete sunburn[instanceID].servers[serverID].roles[roleID];
};

export const fetchRole = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	_requestKey?: string | null,
) => {
	try {
		const role = await sunburn[instanceID].pb
			.collection('serverRoles')
			.getOne<ServerRolesResponse<ServerRolesRecord>>(roleID, { requestKey: null });
		setRoleRecord(instanceID, serverID, roleID, role);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for role',
				roleID,
				_requestKey,
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

export const fetchRolesForServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	_requestKey?: string | null,
) => {
	try {
		if (!(serverID in sunburn[instanceID].servers)) {
			await fetchServer(instanceID, serverID);
		}

		const rolesResp = await sunburn[instanceID].pb
			.collection('serverRoles')
			.getFullList<ServerRolesResponse<ServerRolesRecord>>({
				filter: sunburn[instanceID].pb.filter('server = {:serverID}', { serverID }),
				requestKey: null,
			});

		for (const role of rolesResp) {
			setRoleRecord(instanceID, serverID, role.id, role);
			fetchPermissionsForRole(instanceID, serverID, role.id, null);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for full role list',
				serverID,
				_requestKey,
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

export const setRolePermission = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	permission: ServerRolePermissionsRecord['permission'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, serverID, serverID).then(() =>
			setRolePermission(instanceID, serverID, roleID, permission),
		);
		return;
	}

	if (!(roleID in sunburn[instanceID].servers[serverID].roles)) {
		fetchRole(instanceID, serverID, roleID, roleID).then(() =>
			setRolePermission(instanceID, serverID, roleID, permission),
		);
		return;
	}

	sunburn[instanceID].servers[serverID].roles[roleID].permissions.add(permission);
};

export const clearRolePermission = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	permission: ServerRolePermissionsRecord['permission'],
) => {
	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(roleID in sunburn[instanceID].servers[serverID].roles)
	) {
		return;
	}

	sunburn[instanceID].servers[serverID].roles[roleID].permissions.delete(permission);
};

export const fetchPermissionsForRole = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	_requestKey?: string | null,
) => {
	try {
		if (!(serverID in sunburn[instanceID].servers)) {
			await fetchServer(instanceID, serverID);
		}

		const permsResp = await sunburn[instanceID].pb
			.collection('serverRolePermissions')
			.getFullList<ServerRolePermissionsResponse<ServerRolePermissionsRecord>>({
				filter: sunburn[instanceID].pb.filter('role = {:roleID}', { roleID }),
				requestKey: null,
			});

		for (const perm of permsResp) {
			setRolePermission(instanceID, serverID, perm.role, perm.permission);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted role permissions',
				roleID,
				_requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			// eslint-disable-next-line no-console
			console.warn(
				...warnPrefix,
				'not allowed to fetch roles permissions for role',
				roleID,
				'\n',
				err,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching role permissions for role',
			roleID,
			'\n',
			err,
		);
	}
};
