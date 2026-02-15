import { ClientResponseError } from 'pocketbase';

import type { VoiceParticipantsRecord, VoiceParticipantsResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import {
	type Channel_t,
	type Instance_t,
	type Server_t,
	type ServerMember_t,
	sunburn,
} from '../sunburn.svelte';
import { fetchChannel } from './channels';
import { fetchServer } from './server';

export const setVoiceParticipant = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	memberID: ServerMember_t['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, serverID, serverID).then(() =>
			setVoiceParticipant(instanceID, serverID, channelID, memberID),
		);
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		fetchChannel(instanceID, serverID, channelID, channelID).then(() =>
			setVoiceParticipant(instanceID, serverID, channelID, memberID),
		);
	}

	sunburn[instanceID].servers[serverID].channels[channelID].voiceParticipants.add(memberID);
};

export const clearVoiceParticipant = (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	memberID: ServerMember_t['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		return;
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		return;
	}

	sunburn[instanceID].servers[serverID].channels[channelID].voiceParticipants.delete(memberID);
};

export const fetchVoiceParticipantsForChannel = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	channelID: Channel_t['record']['id'],
	_requestKey?: string | null,
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		await fetchServer(instanceID, serverID, null);
	}

	if (!(channelID in sunburn[instanceID].servers[serverID].channels)) {
		await fetchChannel(instanceID, serverID, channelID, null);
	}

	try {
		const vpResp = await sunburn[instanceID].pb
			.collection('voiceParticipants')
			.getFullList<VoiceParticipantsResponse<VoiceParticipantsRecord>>({
				filter: sunburn[instanceID].pb.filter('channel = {:channelID}', { channelID }),
				requestKey: null,
			});
		for (const vp of vpResp) {
			setVoiceParticipant(instanceID, serverID, channelID, vp.user);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for voice participants',
				channelID,
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching voice participants for channel',
			channelID,
			'\n',
			err,
		);
	}
};
