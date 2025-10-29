import { DateTime } from 'luxon';
import { ClientResponseError, type RecordSubscription } from 'pocketbase';

import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
import type { MessagesRecord, MessagesResponse, TypedPocketBase } from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { binaryDelete, binaryUpdateOrInsert } from '$lib/utils/binaryArray';
import { logFriendly } from '$lib/utils/username';

import { emptyDM } from './empty';
import { fetchUser } from './users';

export const onMessage = (
	clientID: string | undefined,
	e: RecordSubscription<MessagesResponse<unknown>>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'message', e.record);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: MessagesRecord;
	};

	if (action === 'create' || action === 'update') {
		if (record.to) {
			// sent to DM
			const recipient = record.to === clientID ? record.from : record.to;
			if (!(recipient in sunburn.dms[clientID])) {
				sunburn.dms[clientID][recipient] = {
					messages: [],
					updated: DateTime.now(),
					recipient: recipient
				};
			}

			binaryUpdateOrInsert(record, sunburn.dms[clientID][recipient].messages);
			sunburn.dms[clientID][recipient].updated = DateTime.fromSQL(record.created!);
		} else if (record.channel) {
			// sent to channel
			if (!(record.channel in sunburn.channels)) {
				// on page load, user downloads channels that they're interested in and the first few messages
				// since they haven't downloaded the channel, we can forgo the event
				return;
			}

			binaryUpdateOrInsert(record, sunburn.channelMessages[record.channel]);
		}
	} else if (action === 'delete') {
		if (record.to) {
			// sent to DM
			const recipient = record.to === clientID ? record.from : record.to;
			binaryDelete(record, sunburn.dms[clientID][recipient].messages);
		} else if (record.channel) {
			// sent to channel
			if (!(record.channel in sunburn.channels)) {
				// nothing to delete because nothing is saved
				return;
			}

			binaryDelete(record, sunburn.channelMessages[record.channel]);
		}
	}
};

export const fetchInitialMessagesForChannel = async (
	client: TypedPocketBase,
	channel: string,
	requestKey?: string | null
) => {
	try {
		const messagesResp = await client.collection('messages').getList(1, 50, {
			filter: client.filter('channel = {:channel}', { channel }),
			sort: '-created',
			requestKey
		});

		for (const message of messagesResp.items) {
			binaryUpdateOrInsert(message, sunburn.channelMessages[channel]);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for channel messages',
				channel,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching messages for channel',
			channel,
			'\n',
			err
		);
	}
};

export const fetchInitialMessagesForDM = async (
	client: TypedPocketBase,
	recipient: string,
	requestKey?: string | null
) => {
	const clientID = client.authStore.record?.id;
	if (!clientID) {
		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'could not fetch DM messages because client is not logged in',
			client
		);
		return;
	}

	await fetchUser(client, recipient);

	try {
		const messagesResp = await client.collection('messages').getList(1, 50, {
			filter: client.filter('(from = {:recipient} || to = {:recipient}) && channel = null', {
				recipient
			}),
			sort: '-created',
			requestKey
		});

		let isFirst = true;
		for (const message of messagesResp.items) {
			if (!(recipient in sunburn.dms[clientID])) {
				sunburn.dms[clientID][recipient] = { ...emptyDM, recipient };
			}
			binaryUpdateOrInsert(message, sunburn.dms[clientID][recipient].messages);

			if (!isFirst) {
				continue;
			}
			const messageDT = DateTime.fromSQL(message.created!);
			if (messageDT.diff(sunburn.dms[clientID][recipient].updated).as('seconds') > 0) {
				sunburn.dms[clientID][recipient].updated = messageDT;
			}
			isFirst = false;
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for dm messages',
				recipient,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching messages for dm with recipient',
			recipient,
			'\n',
			err
		);
	}
};
