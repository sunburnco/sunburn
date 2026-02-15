import { ClientResponseError } from 'pocketbase';

import type { MessagesRecord, MessagesResponse } from '$lib/pb-types';
import {
	type Channel_t,
	type Instance_t,
	type Server_t,
	sunburn,
} from '$lib/sunburn/sunburn.svelte';

import { binaryUpdateOrInsert } from './binaryArray';
import { debugPrefix, errorPrefix } from './logPrefixes';
import { logFriendly } from './username';

export const fetchChannelMessagesBefore = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	before: MessagesRecord['created'],
	_requestKey?: string | null,
) => {
	try {
		const resp = await sunburn[instanceID].pb
			.collection('messages')
			.getList<MessagesResponse<MessagesRecord>>(1, 50, {
				filter: sunburn[instanceID].pb.filter('created < {:ts} && channel = {:channelID}', {
					channelID,
					ts: before,
				}),
				sort: '-created',
				requestKey: null,
			});

		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(instanceID),
			'fetched',
			resp.items.length,
			'extra messages for channel',
			channelID,
		);

		for (const message of resp.items) {
			binaryUpdateOrInsert(
				message,
				sunburn[instanceID].servers[serverID].channels[channelID].messages,
			);
		}

		return resp.items.length;
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for extra channel messages',
				channelID,
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching extra messages for channel',
			channelID,
			'\n',
			err,
		);
	}

	return 0;
};
