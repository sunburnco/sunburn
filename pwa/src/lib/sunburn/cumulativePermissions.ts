import type { PermissionsRecord, UsersRecord } from '$lib/pb-types';

import { type Channel_t, type Instance_t, type Server_t, sunburn } from './sunburn.svelte';

export const cumulativeServerPermissions = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	userID: UsersRecord['id'],
): Set<string> => {
	const perms = new Set<PermissionsRecord['id']>();

	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(userID in sunburn[instanceID].servers[serverID].members)
	) {
		return perms;
	}

	for (const roleID of sunburn[instanceID].servers[serverID].members[userID].roleIDs) {
		for (const permissionID of sunburn[instanceID].servers[serverID].roles[roleID].permissions) {
			if (sunburn[instanceID].permissionDefinitions[permissionID].isServerPermission)
				perms.add(permissionID);
		}
	}

	return perms;
};

export const cumulativeChannelPermissions = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	userID: UsersRecord['id'],
): Set<string> => {
	const perms = new Set<PermissionsRecord['id']>();

	if (
		!(serverID in sunburn[instanceID].servers) ||
		!(channelID in sunburn[instanceID].servers[serverID].channels) ||
		!(userID in sunburn[instanceID].servers[serverID].members)
	) {
		return perms;
	}

	const channelRoleIDs = sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs;
	const userRoleIDs = sunburn[instanceID].servers[serverID].members[userID].roleIDs;
	const commonRoleIDs = channelRoleIDs.intersection(userRoleIDs);

	for (const roleID of commonRoleIDs) {
		for (const permissionID of sunburn[instanceID].servers[serverID].roles[roleID].permissions) {
			if (sunburn[instanceID].permissionDefinitions[permissionID].isServerPermission)
				perms.add(permissionID);
		}
	}

	return perms;
};

// HAAAANK!
// HANK, DON'T ABBREVIATE `cumulativePermissions`
// HAAAANK!
//
// youtu.be/S2U2vkXmJ54
export const hasPerm = (cumulativePermissions: Set<string>, ...perms: string[]) =>
	cumulativePermissions.intersection(new Set(perms)).size > 0;

export const isOwner = (instanceID: Instance_t['id'], serverID: Server_t['record']['id']) =>
	instanceID in sunburn &&
	serverID in sunburn[instanceID].servers &&
	sunburn[instanceID].servers[serverID].record.owner === sunburn[instanceID].myID;
