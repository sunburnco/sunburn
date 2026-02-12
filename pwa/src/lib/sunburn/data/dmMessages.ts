import { fromAbsolute, getLocalTimeZone } from '@internationalized/date';
import { ClientResponseError } from 'pocketbase';

import type { MessagesRecord, UsersRecord } from '$lib/pb-types';
import { binaryUpdateOrInsert } from '$lib/utils/binaryArray';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { parseTimeFromPB } from '$lib/utils/parseTimeFromPB';
import { logFriendly } from '$lib/utils/username';

import { type DM_t, type Instance_t, sunburn } from '../sunburn.svelte';
import { fetchUser } from './users';

export const setDMMessages = (
	instanceID: Instance_t['id'],
	recipientID: UsersRecord['id'],
	messages: MessagesRecord[],
) => {
	if (!(recipientID in sunburn[instanceID].dms)) {
		sunburn[instanceID].dms[recipientID] = {
			recipientID,
			updated: fromAbsolute(0, getLocalTimeZone()),
			messages: [],
		};
	}

	for (const message of messages) {
		binaryUpdateOrInsert(message, sunburn[instanceID].dms[recipientID].messages);
	}
};

export const clearDMMessages = (instanceID: Instance_t['id'], recipientID: UsersRecord['id']) => {
	delete sunburn[instanceID].dms[recipientID];
};

export const fetchInitialMessagesForDM = async (
	instanceID: Instance_t['id'],
	recipientID: DM_t['recipientID'],
	_requestKey?: string | null,
) => {
	try {
		const messagesResp = await sunburn[instanceID].pb.collection('messages').getList(1, 50, {
			filter: sunburn[instanceID].pb.filter(
				'(from = {:recipientID} || to = {:recipientID}) && channel = null',
				{
					recipientID,
				},
			),
			sort: '-created',
			requestKey: null,
		});

		if (!(recipientID in sunburn[instanceID].dms)) {
			sunburn[instanceID].dms[recipientID] = {
				recipientID,
				updated: fromAbsolute(0, getLocalTimeZone()),
				messages: [],
			};
		}

		if (!(recipientID in sunburn[instanceID].users)) {
			fetchUser(instanceID, recipientID, recipientID);
		}

		let isFirst = true;
		for (const message of messagesResp.items) {
			binaryUpdateOrInsert(message, sunburn[instanceID].dms[recipientID].messages);

			if (!isFirst) {
				continue;
			}
			const t = parseTimeFromPB(message.updated);
			if (t.compare(sunburn[instanceID].dms[recipientID].updated) > 0) {
				sunburn[instanceID].dms[recipientID].updated = t;
			}
			isFirst = false;
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for dm messages',
				recipientID,
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching messages for dm with recipient',
			recipientID,
			'\n',
			err,
		);
	}
};
