import type { ChannelsRecord } from '$lib/pb-types';
import { sunburn } from '$lib/sunburn/sunburn.svelte';

import { debugPrefix } from './logPrefixes';
import { logFriendly } from './username';

// TODO none of these requests explicitly set `requestKey` to `null` -- this may cause issues
export const renameChannel = async (instanceID: string, channelID: string, name: string) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'renaming channel', channelID, 'to', name);
	await sunburn[instanceID].pb.collection('channels').update(channelID, {
		name,
	} as Partial<ChannelsRecord>);
};

export const deleteChannel = async (instanceID: string, channelID: string) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'deleting channel', channelID);
	await sunburn[instanceID].pb.collection('channels').delete(channelID);
};

export const createChannel = async (
	instanceID: string,
	serverID: string,
	channel: ChannelsRecord,
) => {
	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(instanceID), 'creating channel', channel.id);
	await sunburn[instanceID].pb.collection('channels').create(channel);
};
