import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type { ChannelsRecord, ChannelsResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Channel_t, type Instance_t, type Server_t, sunburn } from '../sunburn.svelte';
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
