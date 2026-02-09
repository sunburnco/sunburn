import type { PermissionsRecord, UsersRecord } from '$lib/pb-types';

import { type Channel_t, type Instance_t, type Server_t, sunburn } from './sunburn.svelte';

// TODO test these functions

export const cumulativeServerPermissions = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	userID: UsersRecord['id'],
): string[] => {
	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(userID in sunburn[instanceID].servers[serverID].members)
	) {
		return [];
	}

	const perms = new Set<PermissionsRecord['id']>();

	for (const roleID of sunburn[instanceID].servers[serverID].members[userID].roleIDs) {
		for (const permissionID of sunburn[instanceID].servers[serverID].roles[roleID].permissions) {
			if (sunburn[instanceID].permissionDefinitions[permissionID].isServerPermission)
				perms.add(permissionID);
		}
	}

	return Array.from(perms);
};

export const cumulativeChannelPermissions = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	userID: UsersRecord['id'],
): string[] => {
	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(channelID in sunburn[instanceID].servers[serverID].channels) ||
		!(userID in sunburn[instanceID].servers[serverID].members)
	) {
		return [];
	}

	const channelRoleIDs = sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs;
	const userRoleIDs = sunburn[instanceID].servers[serverID].members[userID].roleIDs;
	const commonRoleIDs = channelRoleIDs.intersection(userRoleIDs);

	const perms = new Set<PermissionsRecord['id']>();

	for (const roleID of commonRoleIDs) {
		for (const permissionID of sunburn[instanceID].servers[serverID].roles[roleID].permissions) {
			if (sunburn[instanceID].permissionDefinitions[permissionID].isServerPermission)
				perms.add(permissionID);
		}
	}

	return Array.from(perms);
};
