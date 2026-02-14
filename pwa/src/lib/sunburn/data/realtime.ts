import type { RecordSubscription } from 'pocketbase';

import type {
	ChannelRoleAssignmentsResponse,
	ChannelsResponse,
	MessagesResponse,
	PermissionsRecord,
	ServerRoleAssignmentsResponse,
	ServerRolePermissionsResponse,
	ServerRolesResponse,
	ServersResponse,
	VoiceParticipantsResponse,
} from '$lib/pb-types';
import { binaryDelete, binaryUpdateOrInsert } from '$lib/utils/binaryArray';
import { findServerIDForChannel, findServerIDForRole } from '$lib/utils/findServerID';
import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Role_t, type Server_t, sunburn } from '../sunburn.svelte';
import {
	clearChannelRecord,
	clearChannelRoleAssignment,
	fetchChannel,
	fetchChannelsForServer,
	setChannelRecord,
	setChannelRoleAssignment,
} from './channels';
import { setDMMessages } from './dmMessages';
import { clearRoleAssignment, setRoleAssignment } from './roleAssignments';
import { clearRolePermission, clearRoleRecord, setRolePermission, setRoleRecord } from './roles';
import { clearServerRecord, fetchServersForInstance, setServerRecord } from './server';
import { clearVoiceParticipant, setVoiceParticipant } from './voiceParticipants';

// TODO this whole file is probably buggy
// I absolutely did not need to do ts for early developments
// Hopefully users will tell me when the sync doesn't load something properly so I can troubleshoot

export const onMessage = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<MessagesResponse>,
) => {
	const { action, record } = e;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onMessage', action, record);

	if (action === 'create' || action === 'update') {
		if (record.to) {
			const recipientID = record.to === sunburn[instanceID].myID ? record.from : record.to;
			// dm
			setDMMessages(instanceID, recipientID, [record]);
		} else if (record.channel) {
			// channel
			const serverID = findServerIDForChannel(instanceID, record.channel);
			if (!serverID) {
				return;
			}
			binaryUpdateOrInsert(
				record,
				sunburn[instanceID].servers[serverID].channels[record.channel].messages,
			);
		}
	} else if (action === 'delete') {
		if (record.to) {
			const recipientID = record.to === sunburn[instanceID].myID ? record.from : record.to;
			// dm
			if (!(recipientID in sunburn[instanceID].dms)) {
				return;
			}
			binaryDelete(record, sunburn[instanceID].dms[recipientID].messages);
		} else if (record.channel) {
			// channel
			const serverID = findServerIDForChannel(instanceID, record.channel);
			if (!serverID) {
				return;
			}
			binaryDelete(record, sunburn[instanceID].servers[serverID].channels[record.channel].messages);
		}
	}
};

export const onServer = (instanceID: Instance_t['id'], e: RecordSubscription<ServersResponse>) => {
	const { action, record } = e;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onServer', action, record);

	if (action === 'create' || action === 'update') {
		setServerRecord(instanceID, record.id, record);
	} else if (action === 'delete') {
		clearServerRecord(instanceID, record.id);
	}
};

export const onServerRole = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<ServerRolesResponse>,
) => {
	const { action, record } = e;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onServerRole', action, record);

	if (action === 'create' || action === 'update') {
		setRoleRecord(instanceID, record.server, record.id, record);
		// no need to fetch permissions because a new role cannot have permissions on it
	} else if (action === 'delete') {
		clearRoleRecord(instanceID, record.server, record.id);
		// no need to clear from channels and members because the cascade delete will take care of it
	}
};

const iHaveRole = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
) => {
	if (
		!(serverID in sunburn[instanceID]) ||
		!(sunburn[instanceID].myID in sunburn[instanceID].servers[serverID].members)
	) {
		return false;
	}

	return sunburn[instanceID].servers[serverID].members[sunburn[instanceID].myID].roleIDs.has(
		roleID,
	);
};

const roleHasPermission = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	roleID: Role_t['record']['id'],
	permission: PermissionsRecord['id'],
) => {
	if (!(serverID in sunburn[instanceID]) || !(roleID in sunburn[instanceID].servers[serverID])) {
		return false;
	}

	return sunburn[instanceID].servers[serverID].roles[roleID].permissions.has(permission);
};

export const onServerRolePermission = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<ServerRolePermissionsResponse>,
) => {
	const { action, record } = e;

	const serverID = findServerIDForRole(instanceID, record.role);
	if (!serverID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onServerRolePermission', action, record);

	if (action === 'create' || action === 'update') {
		setRolePermission(instanceID, serverID, record.role, record.permission);

		// if this role was assigned to a channel and we just got CHANNEL_READ
		// or ADMINISTRATOR for the channel, we might be able to see the channel
		// for the first time
		if (
			iHaveRole(instanceID, serverID, record.role) &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannelsForServer(instanceID, serverID, null);
		}
	} else if (action === 'delete') {
		clearRolePermission(instanceID, serverID, record.role, record.permission);

		// similarly, we may have lost access to the channel
		if (
			iHaveRole(instanceID, serverID, record.role) &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannelsForServer(instanceID, serverID, null);
		}
	}
};

export const onChannel = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<ChannelsResponse>,
) => {
	const { action, record } = e;

	const serverID = findServerIDForChannel(instanceID, record.id);
	if (!serverID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onChannel', action, record);

	if (action === 'create' || action === 'update') {
		setChannelRecord(instanceID, serverID, record.id, record);
		// no need to fetch perms and voice participants because a new channel
		// won't have any, and updating a channel won't change perms or
		// participants
	} else if (action === 'delete') {
		clearChannelRecord(instanceID, serverID, record.id);
	}
};

export const onChannelRoleAssignment = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<ChannelRoleAssignmentsResponse>,
) => {
	const { action, record } = e;

	const serverID = findServerIDForChannel(instanceID, record.channel);
	if (!serverID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onChannelRoleAssignment', action, record);

	if (action === 'create' || action === 'update') {
		setChannelRoleAssignment(instanceID, serverID, record.channel, record.role);

		// if an assigned role had CHANNEL_READ or ADMINISTRATOR and was just
		// added to a channel, we may have gotten access to the channel
		if (
			iHaveRole(instanceID, serverID, record.role) &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannel(instanceID, serverID, record.channel, null);
		}
	} else if (action === 'delete') {
		clearChannelRoleAssignment(instanceID, serverID, record.channel, record.role);

		// similarly, we may have lost access to the channel
		if (
			iHaveRole(instanceID, serverID, record.role) &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannel(instanceID, serverID, record.channel, null);
		}
	}
};

export const onVoiceParticipant = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<VoiceParticipantsResponse>,
) => {
	const { action, record } = e;

	const serverID = findServerIDForChannel(instanceID, record.channel);
	if (!serverID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onVoiceParticipant', action, record);

	if (action === 'create' || action === 'update') {
		setVoiceParticipant(instanceID, serverID, record.channel, record.user);
	} else if (action === 'delete') {
		clearVoiceParticipant(instanceID, serverID, record.channel, record.user);
	}
};

export const onServerRoleAssignment = (
	instanceID: Instance_t['id'],
	e: RecordSubscription<ServerRoleAssignmentsResponse>,
) => {
	const { action, record } = e;

	const serverID = findServerIDForRole(instanceID, record.role);
	if (!serverID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'onServerRoleAssignment', action, record);

	if (action === 'create' || action === 'update') {
		setRoleAssignment(instanceID, serverID, record.user, record.role);

		// if we just got a role with CHANNEL_READ or ADMINISTRATOR,
		// we may have access to a new channel
		if (
			sunburn[instanceID].myID === record.user &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannelsForServer(instanceID, serverID, null);
		}

		// if we just got a role with SERVER_MEMBER,
		// we may have access to a new server
		else if (
			sunburn[instanceID].myID === record.user &&
			roleHasPermission(instanceID, serverID, record.role, 'SERVER_MEMBER')
		) {
			fetchServersForInstance(instanceID, null);
		}
	} else if (action === 'delete') {
		clearRoleAssignment(instanceID, serverID, record.user, record.role);

		// similarly, we may have lost access to a channel
		//
		// this could be more granular by checking only for
		// channels that have the cleared role, but I think
		// the gains would be marginal
		if (
			sunburn[instanceID].myID === record.user &&
			(roleHasPermission(instanceID, serverID, record.role, 'CHANNEL_READ') ||
				roleHasPermission(instanceID, serverID, record.role, 'ADMINISTRATOR'))
		) {
			fetchChannelsForServer(instanceID, serverID, null);
		}

		// or we may have lost access to the server
		else if (
			sunburn[instanceID].myID === record.user &&
			roleHasPermission(instanceID, serverID, record.role, 'SERVER_MEMBER')
		) {
			fetchServersForInstance(instanceID, null);
		}
	}
};
