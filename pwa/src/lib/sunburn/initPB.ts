import { SvelteSet } from 'svelte/reactivity';

import type { ServersRecord, TypedPocketBase } from '$lib/pb-types';
import { debugPrefix } from '$lib/utils/logPrefixes';
import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';
import { logFriendly } from '$lib/utils/username';

import { fetchInitialMessagesForDM } from './data/dmMessages';
import { setServerRecord } from './data/server';
import { type Instance_t, sunburn } from './sunburn.svelte';

// TODO why did we have onAuthChange?

export const initPB = async (pb: TypedPocketBase, handle: string, noReauth?: boolean) => {
	const instanceID = parseInstanceSlug(pb.baseURL, '');

	const instance: Instance_t = {
		id: instanceID,
		version: (await fetch(pb.buildURL('/api/health'))).headers.get('x-sb-version') ?? '',
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

	if (pb.authStore.record?.id) {
		instance.myID = pb.authStore.record.id;

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, `<${pb.authStore.record.id}> fetching self`);
		instance.users[instance.myID] = await pb.collection('users').getOne(instance.myID);

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
				fetchInitialMessagesForDM(instanceID, userID, userID);
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
			// TODO fetch pinned DMs
		} catch {
			// noop
			const _ = null;
		}

		try {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `${logFriendly(instanceID)} fetching pinned servers`);
			// TODO fetch pinned servers
		} catch {
			// noop
			const _ = null;
		}

		// TODO handle voice settings
	}

	sunburn[instance.id] = instance;

	if (pb.authStore.isValid && !noReauth) {
		pb.collection('users').authRefresh({ requestKey: null });
	}

	pb.collection('*').unsubscribe();

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, `${logFriendly(instanceID)} registering event listeners`);

	// TODO register event listeners

	sunburn[instance.id].ready = true;

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, `${logFriendly(instanceID)} init done`);
};
