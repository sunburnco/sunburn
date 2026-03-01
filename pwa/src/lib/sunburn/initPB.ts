import { ClientResponseError } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import {
	type ChannelRoleAssignmentsRecord,
	type ChannelRoleAssignmentsResponse,
	type ChannelsRecord,
	type ServerRoleAssignmentsRecord,
	type ServerRoleAssignmentsResponse,
	type ServerRolesRecord,
	type TypedPocketBase,
	type VoiceParticipantsRecord,
	type VoiceParticipantsResponse,
} from '$lib/pb-types';
import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';
import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';
import { logFriendly } from '$lib/utils/username';

import { fetchInitialMessagesForDM } from './data/dmMessages';
import { fetchPinnedDMs } from './data/pinnedDMs';
import { fetchPinnedServers } from './data/pinnedServers';
import {
	onChannel,
	onChannelRoleAssignment,
	onMessage,
	onServer,
	onServerRole,
	onServerRoleAssignment,
	onServerRolePermission,
	onVoiceParticipant,
} from './data/realtime.svelte';
import { setServerRecord } from './data/server';
import { sunburn } from './sunburn.svelte';

// TODO why did we have onAuthChange?

export const initPB = async (pb: TypedPocketBase, handle: string, noReauth?: boolean) => {
	const instanceID = parseInstanceSlug(pb.baseURL, '');

	let version = '';
	try {
		version = (await fetch(pb.buildURL('/api/health'))).headers.get('x-sb-version') ?? '';
		if (!version) {
			throw new Error('no x-sb-version header');
		}
	} catch (err: unknown) {
		// eslint-disable-next-line no-console
		console.warn(
			...warnPrefix,
			`<${instanceID}> could not fetch version; is Sunburn running?\n`,
			err,
		);
		sunburn[instanceID] = {
			id: instanceID,
			version: '?',
			ready: false,

			myID: '',
			pb,

			permissionDefinitions: {},
			servers: {},
			dms: {},
			users: {},

			pinnedServerIDs: new SvelteSet(),
			pinnedDMIDs: new SvelteSet(),
		};
		return;
	}

	sunburn[instanceID] = {
		id: instanceID,
		version,
		ready: false,

		myID: '',
		pb,

		permissionDefinitions: {},
		servers: {},
		dms: {},
		users: {},

		pinnedServerIDs: new SvelteSet(),
		pinnedDMIDs: new SvelteSet(),
	};

	if (!noReauth) {
		try {
			await pb.collection('users').authRefresh({ requestKey: null });
		} catch (err) {
			if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					`<${instanceID}> could not refresh auth token (you may need to log in again)\n`,
					err,
				);
			} else {
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					`<${instanceID}> unknown error while refreshing auth token\n`,
					err,
				);
			}

			return;
		}
	}

	if (pb.authStore.record?.id) {
		sunburn[instanceID].myID = pb.authStore.record.id;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, `<${pb.authStore.record.id}> fetching self`);
		sunburn[instanceID].users[pb.authStore.record.id] = await pb
			.collection('users')
			.getOne(pb.authStore.record.id);

		try {
			for (const userID of (
				(await pb.collection('dmListFrom').getOne(pb.authStore.record.id, { requestKey: null }))
					.users as string
			).split(',')) {
				if (!userID) {
					continue;
				}

				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `${logFriendly(instanceID)} fetching dm messages`, userID);
				fetchInitialMessagesForDM(instanceID, userID, userID);
			}
		} catch {
			// noop
			const _ = null;
		}

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
					`${logFriendly(instanceID)} fetching dm messages (pt. 2)`,
					userID,
				);
				fetchInitialMessagesForDM(instanceID, userID, userID + '2');
			}
		} catch {
			// noop
			const _ = null;
		}

		try {
			for (const server of await pb.collection('servers').getFullList({ requestKey: null })) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `${logFriendly(instanceID)} fetching server`, server.id);

				setServerRecord(instanceID, server.id, server);
			}
		} catch {
			// noop
			const _ = null;
		}

		try {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `${logFriendly(instanceID)} fetching pinned dms`);
			fetchPinnedDMs(instanceID, instanceID);
		} catch {
			// noop
			const _ = null;
		}

		try {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `${logFriendly(instanceID)} fetching pinned servers`);
			fetchPinnedServers(instanceID, instanceID);
		} catch {
			// noop
			const _ = null;
		}

		// TODO handle voice settings
	}

	if (pb.authStore.isValid && !noReauth) {
		pb.collection('users').authRefresh({ requestKey: null });
	}

	pb.collection('*').unsubscribe();

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, `${logFriendly(instanceID)} registering event listeners`);

	pb.collection('messages').subscribe('*', (e) => onMessage(instanceID, e));

	pb.collection('servers').subscribe('*', (e) => onServer(instanceID, e));
	pb.collection('serverRoles').subscribe('*', (e) => onServerRole(instanceID, e));
	pb.collection('serverRolePermissions').subscribe('*', (e) =>
		onServerRolePermission(instanceID, e),
	);

	pb.collection('channels').subscribe('*', (e) => onChannel(instanceID, e));
	pb.collection('channelRoleAssignments').subscribe<
		ChannelRoleAssignmentsResponse<ChannelRoleAssignmentsRecord & { role: ServerRolesRecord }>
	>('*', (e) => onChannelRoleAssignment(instanceID, e), { expand: 'role' });

	pb.collection('voiceParticipants').subscribe<
		VoiceParticipantsResponse<VoiceParticipantsRecord & { channel: ChannelsRecord }>
	>('*', (e) => onVoiceParticipant(instanceID, e), {
		expand: 'channel',
	});

	pb.collection('serverRoleAssignments').subscribe<
		ServerRoleAssignmentsResponse<ServerRoleAssignmentsRecord & { role: ServerRolesRecord }>
	>('*', (e) => onServerRoleAssignment(instanceID, e), {
		expand: 'role',
	});

	sunburn[instanceID].ready = true;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, `${logFriendly(instanceID)} init done`);
};
