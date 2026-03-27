import { ChannelType } from '$lib/constants';
import { Permissions } from '$lib/constants';
import type {
	ChannelRoleAssignmentsRecord,
	ChannelsRecord,
	ServerRolePermissionsRecord,
	ServerRolesRecord,
	ServersRecord,
} from '$lib/pb-types';
import { sunburn } from '$lib/sunburn/sunburn.svelte';

import { pbID } from './pbID';

export const createServer = async (instanceID: string, serverName: string) => {
	const serverID = pbID();
	const roleID = pbID();
	const generalID = pbID();
	const voiceID = pbID();

	await sunburn[instanceID].pb.collection('servers').create({
		id: serverID,
		name: serverName,
		owner: sunburn[instanceID].myID,
	} as ServersRecord);

	await sunburn[instanceID].pb.collection('serverRoles').create({
		id: roleID,
		server: serverID,
		name: 'everyone',
		ordinal: 0,
	} as ServerRolesRecord);

	for (const permission of [
		Permissions.SERVER_MEMBER,
		Permissions.CHANNEL_READ,
		Permissions.CHANNEL_SEND,
		Permissions.CALL_VIDEO,
		Permissions.ADD_REACTIONS,
		Permissions.USE_ATTACHMENTS,
	]) {
		await sunburn[instanceID].pb.collection('serverRolePermissions').create({
			role: roleID,
			permission,
		} as ServerRolePermissionsRecord);
	}

	await sunburn[instanceID].pb.collection('channels').create({
		id: generalID,
		name: 'general',
		server: serverID,
		type: ChannelType.TEXT,
	} as ChannelsRecord);

	await sunburn[instanceID].pb.collection('channels').create({
		id: voiceID,
		name: 'voice',
		server: serverID,
		type: ChannelType.VOICE,
	} as ChannelsRecord);

	await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
		channel: generalID,
		role: roleID,
	} as ChannelRoleAssignmentsRecord);
	await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
		channel: voiceID,
		role: roleID,
	} as ChannelRoleAssignmentsRecord);

	return {
		serverID,
		roleID,
		generalID,
		voiceID,
	};
};
