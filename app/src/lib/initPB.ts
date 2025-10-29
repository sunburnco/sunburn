import type { OnStoreChangeFunc } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import { debugPrefix } from './logPrefixes';
import type { ServersRecord, TypedPocketBase, UsersRecord } from './pb-types';
import { sunburn } from './sunburn.svelte';
import { fetchChannelsForServer, onChannel, onChannelRoleAssignment } from './sunburn/channels';
import { fetchInitialMessagesForDM, onMessage } from './sunburn/messages';
import { fetchPinnedDMs, fetchPinnedServers, onPinnedDM, onPinnedServer } from './sunburn/pins';
import {
	fetchServer,
	fetchServerRoleAssignments,
	fetchServerRoles,
	onServer,
	onServerRole,
	onServerRoleAssignment
} from './sunburn/servers';
import { onUser } from './sunburn/users';
import { onVoiceParticipant } from './sunburn/voiceParticipants';
import { voiceSettings } from './sunburn/voiceSettings.svelte';
import { logFriendly } from './utils/username';

const onAuthChange: OnStoreChangeFunc = async (_, record) => {
	if (record) {
		// TODO why was this here?
		// sunburn.dms[record.id] = {};
		sunburn.auths[record.id] = record;
		sunburn.users[record.id] = {
			record: (await sunburn.clients[record.id]
				.collection('users')
				.getOne(record.id)) as UsersRecord
		};
	}
};

export const initPB = async (pb: TypedPocketBase, noReauth?: boolean) => {
	sunburn.instances[pb.baseURL] = {
		url: pb.baseURL,
		version: (await fetch(pb.buildURL('/api/health'))).headers.get('x-sb-version') ?? ''
	};

	if (pb.authStore.record?.id) {
		sunburn.clients[pb.authStore.record.id] = pb;
		sunburn.auths[pb.authStore.record.id] = pb.authStore.record;
		sunburn.dms[pb.authStore.record.id] = {};

		sunburn.visibleUsers[pb.authStore.record.id] = new SvelteSet();
		sunburn.visibleServers[pb.authStore.record.id] = new SvelteSet();
		sunburn.visibleChannels[pb.authStore.record.id] = new SvelteSet();

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, `<${pb.authStore.record.id}> fetching self`);
		sunburn.users[pb.authStore.record.id] = {
			record: (await sunburn.clients[pb.authStore.record.id]
				.collection('users')
				.getOne(pb.authStore.record.id, { requestKey: null })) as UsersRecord
		};

		try {
			for (const userID of (
				(await pb.collection('dmListFrom').getOne(pb.authStore.record.id, { requestKey: null }))
					.users as string
			).split(',')) {
				if (!userID) {
					continue;
				}
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					`${logFriendly(pb.authStore.record.id)} fetching dm messages`,
					userID
				);
				fetchInitialMessagesForDM(pb, userID, userID);
			}
		} catch {
			// noop
			const _ = null;
		}

		try {
			for (const userID of (
				(await pb.collection('dmListTo').getOne(pb.authStore.record.id, { requestKey: null }))
					.users as string
			).split(',')) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					`${logFriendly(pb.authStore.record.id)} fetching dm messages (pt. 2)`,
					userID
				);
				fetchInitialMessagesForDM(pb, userID);
			}
		} catch {
			// noop
			const _ = null;
		}

		try {
			for (const server of (await pb
				.collection('servers')
				.getFullList({ requestKey: null })) as ServersRecord[]) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					`${logFriendly(pb.authStore.record.id)} fetching server`,
					server.id
				);
				await fetchServer(pb, server.id, [pb.authStore.record.id, server.id].toString());
				await fetchChannelsForServer(pb, server.id, [pb.authStore.record.id, server.id].toString());
				await fetchServerRoles(pb, server.id, [pb.authStore.record.id, server.id].toString());
				fetchServerRoleAssignments(pb, server.id, [pb.authStore.record.id, server.id].toString());
			}
		} catch {
			// noop
			const _ = null;
		}

		try {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `${logFriendly(pb.authStore.record.id)} fetching pinned DMs`);
			fetchPinnedDMs(pb, null);
		} catch {
			// noop
			const _ = null;
		}

		try {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				`${logFriendly(pb.authStore.record.id)} fetching pinned servers`
			);
			fetchPinnedServers(pb, null);
		} catch {
			// noop
			const _ = null;
		}

		if (!(pb.authStore.record.id in voiceSettings)) {
			voiceSettings[pb.authStore.record.id] = {};
		}
	}

	pb.authStore.onChange(onAuthChange);
	if (pb.authStore.isValid && !noReauth) {
		pb.collection('users').authRefresh({ requestKey: null });
	}

	pb.collection('*').unsubscribe();

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		`${logFriendly(pb.authStore.record?.id)} registering event listeners`
	);

	pb.collection('users').subscribe('*', (e) => onUser(pb.authStore.record?.id, e));

	pb.collection('messages').subscribe('*', (e) => onMessage(pb.authStore.record?.id, e));

	pb.collection('servers').subscribe('*', (e) => onServer(pb.authStore.record?.id, e));
	pb.collection('channels').subscribe('*', (e) => onChannel(pb.authStore.record?.id, e));
	pb.collection('serverRoles').subscribe('*', (e) => onServerRole(pb.authStore.record?.id, e));
	pb.collection('channelRoleAssignments').subscribe('*', (e) =>
		onChannelRoleAssignment(pb.authStore.record?.id, e)
	);
	pb.collection('serverRoleAssignments').subscribe('*', (e) =>
		onServerRoleAssignment(pb.authStore.record?.id, e)
	);

	pb.collection('voiceParticipants').subscribe('*', (e) =>
		onVoiceParticipant(pb.authStore.record?.id, e)
	);

	pb.collection('pinnedDMs').subscribe('*', (e) => onPinnedDM(pb.authStore.record?.id, e));
	pb.collection('pinnedServers').subscribe('*', (e) => onPinnedServer(pb.authStore.record?.id, e));

	if (pb.authStore.record?.id) {
		sunburn.readyClients.add(pb.authStore.record?.id);
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, `${logFriendly(pb.authStore.record?.id)} init done`);
};
