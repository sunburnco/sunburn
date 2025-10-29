import { ClientResponseError, type RecordSubscription } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
import type {
	ChannelRoleAssignmentsRecord,
	ChannelRoleAssignmentsResponse,
	ChannelsRecord,
	ChannelsResponse,
	TypedPocketBase,
	VoiceParticipantsRecord
} from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { logFriendly } from '$lib/utils/username';

import { fetchInitialMessagesForChannel } from './messages';

export const onChannel = (
	clientID: string | undefined,
	e: RecordSubscription<ChannelsResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'channel', e.record);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: ChannelsRecord;
	};

	if (action === 'create' || action === 'update') {
		if (!(record.server in sunburn.servers)) {
			return;
		}

		addChannelToMemory(clientID, record);
	} else if (action === 'delete') {
		removeChannelFromMemory(clientID, record);
	}
};

export const onChannelRoleAssignment = (
	clientID: string | undefined,
	e: RecordSubscription<ChannelRoleAssignmentsResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(clientID),
		e.action,
		'channel role assignment',
		e.record
	);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: ChannelRoleAssignmentsRecord;
	};

	if (action === 'create' || action === 'update') {
		if (!(record.channel in sunburn.channels)) {
			fetchChannel(sunburn.clients[clientID], record.channel);
		}

		addChannelRoleAssignmentToMemory(record);
	} else if (action === 'delete') {
		sunburn.channelRoleAssignments[record.channel]?.delete(record.id);
		delete sunburn.channelRoleAssignmentRecords[record.id];
		fetchChannel(sunburn.clients[clientID], record.channel);
	}
};

export const fetchChannelsForServer = async (
	client: TypedPocketBase,
	server: string,
	requestKey?: string | null
) => {
	try {
		const channels = (await client.collection('channels').getFullList({
			filter: client.filter('server = {:server}', { server }),
			requestKey
		})) as ChannelsRecord[];

		for (const channel of channels) {
			addChannelToMemory(client.authStore.record?.id, channel);

			fetchChannelRoleAssignments(client, channel.id, [requestKey, channel.id, 'role'].toString());
			fetchChannelVoiceParticipants(
				client,
				channel.id,
				[requestKey, channel.id, 'voice'].toString()
			);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for server channels',
				server,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching channels for server',
			server,
			'\n',
			err
		);
	}
};

export const fetchChannel = async (
	client: TypedPocketBase,
	channel: string,
	requestKey?: string | null
) => {
	try {
		const record = await client.collection('channels').getOne(channel, { requestKey });
		addChannelToMemory(client.authStore.record?.id, record);
		fetchInitialMessagesForChannel(client, channel);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for channel',
				channel,
				requestKey
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			removeChannelFromMemory(client.authStore.record?.id, sunburn.channels[channel]);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching channel',
			channel,
			'\n',
			err
		);
	}
};

export const fetchChannelRoleAssignments = async (
	client: TypedPocketBase,
	channel: string,
	requestKey?: string | null
) => {
	try {
		const assignments = await client.collection('channelRoleAssignments').getFullList({
			filter: client.filter('channel = {:channel}', { channel }),
			requestKey
		});

		for (const assignment of assignments) {
			addChannelRoleAssignmentToMemory(assignment);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for channel role assignments',
				channel,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching channel role assignments',
			channel,
			'\n',
			err
		);
	}
};

export const fetchChannelVoiceParticipants = async (
	client: TypedPocketBase,
	channel: string,
	requestKey?: string | null
) => {
	try {
		const voiceParticipants = (await client.collection('voiceParticipants').getFullList({
			filter: client.filter('channel = {:channel}', { channel }),
			requestKey
		})) as VoiceParticipantsRecord[];

		for (const participant of voiceParticipants) {
			sunburn.channelVoiceParticipants[channel].add(participant.user);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for channel voice participants',
				channel,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching voice participants for channel',
			channel,
			'\n',
			err
		);
	}
};

const addChannelToMemory = (client: string | undefined, record: ChannelsRecord) => {
	if (!client) {
		return;
	}

	if (!(record.server in sunburn.serverChannels)) {
		sunburn.serverChannels[record.server] = new SvelteSet();
	}
	sunburn.serverChannels[record.server].add(record.id);
	sunburn.channels[record.id] = record;

	sunburn.visibleChannels[client].add(record.id);

	if (!(record.id in sunburn.channelMessages)) {
		sunburn.channelMessages[record.id] = [];
	}
	if (!(record.id in sunburn.channelRoleAssignments)) {
		sunburn.channelRoleAssignments[record.id] = new SvelteSet();
	}
	if (!(record.id in sunburn.channelVoiceParticipants)) {
		sunburn.channelVoiceParticipants[record.id] = new SvelteSet();
	}
};

const removeChannelFromMemory = (client: string | undefined, record?: ChannelsRecord) => {
	if (!client || !record) {
		return;
	}

	// sunburn.serverChannels[record.server]?.delete(record.id);
	sunburn.visibleChannels[client]?.delete(record.id);
	// delete sunburn.channels[record.id];
	// delete sunburn.channelMessages[record.id];
	// delete sunburn.channelRoleAssignments[record.id];
	// delete sunburn.channelVoiceParticipants[record.id];
};

const addChannelRoleAssignmentToMemory = (record: ChannelRoleAssignmentsRecord) => {
	if (!(record.channel in sunburn.channelRoleAssignments)) {
		sunburn.channelRoleAssignments[record.channel] = new SvelteSet();
	}

	sunburn.channelRoleAssignments[record.channel].add(record.id);
	sunburn.channelRoleAssignmentRecords[record.id] = record;
};
