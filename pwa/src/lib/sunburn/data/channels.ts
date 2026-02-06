import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type {
	ChannelRoleAssignmentsRecord,
	ChannelRoleAssignmentsResponse,
	ChannelsRecord,
	ChannelsResponse,
} from '$lib/pb-types';
import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import {
	type Channel_t,
	type Instance_t,
	type Role_t,
	type Server_t,
	sunburn,
} from '../sunburn.svelte';
import { fetchServer } from './server';

export const setChannelRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	record: ChannelsRecord,
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, record.server).then(() =>
			setChannelRecord(instanceID, serverID, channelID, record),
		);
		return;
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		sunburn[instanceID].servers[serverID].channels[channelID] = {
			assignedRolesIDs: new SvelteSet(),
			messages: [],
			record,
		};
	}
};

export const clearChannelRecord = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
) => {
	delete sunburn[instanceID].servers[serverID].channels[channelID];
};

export const fetchChannel = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	requestKey?: string | null,
) => {
	try {
		const channel = await sunburn[instanceID].pb
			.collection('channels')
			.getOne<ChannelsResponse<ChannelsRecord>>(channelID, { requestKey });
		setChannelRecord(instanceID, serverID, channelID, channel);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for channel',
				channelID,
				requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			clearChannelRecord(instanceID, serverID, channelID);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(...errorPrefix, 'error fetching channel', channelID, '\n', err);
	}
};

export const fetchChannelsForServer = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	requestKey?: string | null,
) => {
	try {
		if (!(serverID in sunburn[instanceID].servers)) {
			await fetchServer(instanceID, serverID);
		}

		const channelsResp = await sunburn[instanceID].pb
			.collection('channels')
			.getFullList<ChannelsResponse<ChannelsRecord>>({
				filter: sunburn[instanceID].pb.filter('server = {:serverID}', { serverID }),
				requestKey,
			});

		for (const channel of channelsResp) {
			setChannelRecord(instanceID, serverID, channel.id, channel);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for full channel list',
				serverID,
				requestKey,
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			// eslint-disable-next-line no-console
			console.warn(...warnPrefix, 'not allowed to fetch channels for server', serverID, '\n', err);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching channels for server',
			serverID,
			'\n',
			err,
		);
	}
};

export const setChannelRoleAssignment = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	roleID: Role_t['record']['id'],
	// TODO should there be a `retry = 1` here?
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, serverID, serverID).then(() =>
			setChannelRoleAssignment(instanceID, serverID, channelID, roleID),
		);
		return;
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		fetchChannel(instanceID, serverID, channelID).then(() =>
			setChannelRoleAssignment(instanceID, serverID, channelID, roleID),
		);
		return;
	}

	sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs.add(roleID);
};

export const clearChannelRoleAssignment = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	roleID: Role_t['record']['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		return;
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		return;
	}

	sunburn[instanceID].servers[serverID].channels[channelID].assignedRolesIDs.delete(roleID);
};

export const fetchChannelRoleAssignmentsForChannel = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	requestKey?: string | null,
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		await fetchServer(instanceID, serverID, requestKey + serverID);
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		await fetchChannel(instanceID, serverID, channelID, requestKey + channelID);
	}

	try {
		const craResp = await sunburn[instanceID].pb
			.collection('channelRoleAssignments')
			.getFullList<ChannelRoleAssignmentsResponse<ChannelRoleAssignmentsRecord>>({
				filter: sunburn[instanceID].pb.filter('channel = {:channelID}', { channelID }),
				requestKey,
			});
		for (const cra of craResp) {
			setChannelRoleAssignment(instanceID, serverID, channelID, cra.role);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for channel role assignments',
				channelID,
				requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching channel role assignments',
			channelID,
			'\n',
			err,
		);
	}
};
