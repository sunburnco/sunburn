import type { ChannelsRecord, ServerRolesRecord } from '$lib/pb-types';
import { type Channel_t, type Instance_t, type Role_t, sunburn } from '$lib/sunburn/sunburn.svelte';

import { debugPrefix } from './logPrefixes';
import { logFriendly } from './username';

// TODO none of these requests explicitly set `requestKey` to `null` -- this may cause issues
export const renameChannel = async (
	instanceID: Instance_t['id'],
	channelID: Channel_t['record']['id'],
	name: string,
) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'renaming channel', channelID, 'to', name);
	await sunburn[instanceID].pb.collection('channels').update(channelID, {
		name,
	} as Partial<ChannelsRecord>);
};
export const deleteChannel = async (
	instanceID: Instance_t['id'],
	channelID: Channel_t['record']['id'],
) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'deleting channel', channelID);
	await sunburn[instanceID].pb.collection('channels').delete(channelID);
};
export const createChannel = async (instanceID: Instance_t['id'], channel: ChannelsRecord) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating channel', channel.id);
	await sunburn[instanceID].pb.collection('channels').create(channel);
};

export const editRole = async (
	instanceID: Instance_t['id'],
	roleID: Role_t['record']['id'],
	data: Partial<ServerRolesRecord>,
) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'editing role', roleID, 'with data', data);
	await sunburn[instanceID].pb.collection('serverRoles').update(roleID, data);
};
export const deleteRole = async (instanceID: Instance_t['id'], roleID: Role_t['record']['id']) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'deleting role', roleID);
	await sunburn[instanceID].pb.collection('serverRoles').delete(roleID);
};
export const createRole = async (instanceID: Instance_t['id'], role: ServerRolesRecord) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating role', role.id);
	await sunburn[instanceID].pb.collection('serverRoles').create(role);
};
