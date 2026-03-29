import { ChannelType } from '$lib/constants';
import { Permissions } from '$lib/constants';
import type {
	ChannelRoleAssignmentsRecord,
	ChannelsRecord,
	ServerRoleAssignmentsRecord,
	ServerRolePermissionsRecord,
	ServerRolesRecord,
	ServersRecord,
} from '$lib/pb-types';
import { sunburn } from '$lib/sunburn/sunburn.svelte';

import { debugPrefix } from './logPrefixes';
import { pbID } from './pbID';
import { logFriendly } from './username';

export const createServer = async (instanceID: string, serverName: string) => {
	const serverID = pbID();
	const roleID = pbID();
	const generalID = pbID();
	const voiceID = pbID();

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating server record');
	await sunburn[instanceID].pb.collection('servers').create({
		id: serverID,
		name: serverName,
		owner: sunburn[instanceID].myID,
	} as ServersRecord);

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating @everyone role');
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
		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(instanceID),
			`adding ${permission} to @everyone role`,
		);
		await sunburn[instanceID].pb.collection('serverRolePermissions').create({
			role: roleID,
			permission,
		} as ServerRolePermissionsRecord);
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating general channel');
	await sunburn[instanceID].pb.collection('channels').create({
		id: generalID,
		name: 'general',
		server: serverID,
		type: ChannelType.TEXT,
	} as ChannelsRecord);

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating voice channel');
	await sunburn[instanceID].pb.collection('channels').create({
		id: voiceID,
		name: 'voice',
		server: serverID,
		type: ChannelType.VOICE,
	} as ChannelsRecord);

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(instanceID),
		'assigning @everyone role to general channel',
	);
	await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
		channel: generalID,
		role: roleID,
	} as ChannelRoleAssignmentsRecord);
	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(instanceID),
		'assigning @everyone role to voice channel',
	);
	await sunburn[instanceID].pb.collection('channelRoleAssignments').create({
		channel: voiceID,
		role: roleID,
	} as ChannelRoleAssignmentsRecord);

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'giving self @everyone role');
	await sunburn[instanceID].pb.collection('serverRoleAssignments').create({
		role: roleID,
		user: sunburn[instanceID].myID,
	} as ServerRoleAssignmentsRecord);

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'server creation done');

	return {
		serverID,
		roleID,
		generalID,
		voiceID,
	};
};
