import { ClientResponseError, type RecordSubscription } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
import type {
	ServerRoleAssignmentsRecord,
	ServerRoleAssignmentsResponse,
	ServerRolesRecord,
	ServerRolesResponse,
	ServersRecord,
	ServersResponse,
	TypedPocketBase
} from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { logFriendly } from '$lib/utils/username';

import { fetchChannelsForServer } from './channels';

export const onServer = (
	clientID: string | undefined,
	e: RecordSubscription<ServersResponse<unknown>>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'server', e.record);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: ServersRecord;
	};

	if (action === 'create' || action === 'update') {
		addServerToMemory(clientID, record);
	} else if (action === 'delete') {
		removeServerFromMemory(clientID, record);
	}
};

export const onServerRole = (
	clientID: string | undefined,
	e: RecordSubscription<ServerRolesResponse<unknown>>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'server role', e.record);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: ServerRolesRecord;
	};

	if (action === 'create' || action === 'update') {
		if (!(record.server in sunburn.servers)) {
			fetchCompleteServer(clientID, record.server);
		}
		addServerRoleToMemory(record);
	} else if (action === 'delete') {
		sunburn.serverRoles[record.server]?.delete(record.id);
		delete sunburn.serverRoleRecords[record.id];
		delete sunburn.serverRoleAssignments[record.id];
		fetchCompleteServer(clientID, record.server);
	}
};

export const onServerRoleAssignment = (
	clientID: string | undefined,
	e: RecordSubscription<ServerRoleAssignmentsResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(
		...debugPrefix,
		logFriendly(clientID),
		e.action,
		'server role assignmetn',
		e.record
	);

	const { action, record } = e as {
		action: 'create' | 'update' | 'delete';
		record: ServerRoleAssignmentsRecord;
	};

	if (action === 'create' || action === 'update') {
		if (!(record.role in sunburn.serverRoleRecords)) {
			if (clientID in sunburn.clients) {
				sunburn.clients[clientID]
					.collection('serverRoles')
					.getOne(record.role)
					.then((record) => fetchCompleteServer(clientID, record.server));
			}
		} else {
			fetchCompleteServer(clientID, sunburn.serverRoleRecords[record.role].server);
		}
		addServerRoleAssignmentToMemory(record);
	} else if (action === 'delete') {
		fetchCompleteServer(clientID, sunburn.serverRoleRecords[record.role].server);
		sunburn.serverRoleAssignments[record.role]?.delete(record.user);
	}
};

export const fetchAllServers = async (client: TypedPocketBase, requestKey?: string | null) => {
	try {
		const servers = (await client
			.collection('servers')
			.getFullList({ requestKey })) as ServersRecord[];
		for (const server of servers) {
			addServerToMemory(client.authStore.record?.id, server);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for all servers',
				requestKey
			);
			return;
		}
		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching all servers\n',
			err
		);
	}
};

export const fetchServer = async (
	client: TypedPocketBase,
	server: string,
	requestKey?: string | null
) => {
	try {
		const record = (await client
			.collection('servers')
			.getOne(server, { requestKey })) as ServersRecord;
		addServerToMemory(client.authStore.record?.id, record);
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for server',
				server,
				requestKey
			);
			return;
		} else if (err instanceof ClientResponseError && err.status >= 400 && err.status < 500) {
			removeServerFromMemory(client.authStore.record?.id, sunburn.servers[server]);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching server',
			server,
			'\n',
			err
		);
	}
};

export const fetchServerRoles = async (
	client: TypedPocketBase,
	server: string,
	requestKey?: string | null
) => {
	try {
		const roles = (await client.collection('serverRoles').getFullList({
			filter: client.filter('server = {:server}', { server }),
			requestKey
		})) as ServerRolesRecord[];

		for (const role of roles) {
			addServerRoleToMemory(role);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for server roles',
				server,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching server roles',
			server,
			'\n',
			err
		);
	}
};

export const fetchServerRoleAssignments = async (
	client: TypedPocketBase,
	server: string,
	requestKey?: string | null
) => {
	try {
		const assignments = (await client.collection('serverRoleAssignments').getFullList({
			filter: client.filter('role.server = {:server}', { server }),
			requestKey
		})) as ServerRoleAssignmentsRecord[];

		for (const assignment of assignments) {
			addServerRoleAssignmentToMemory(assignment);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(client.authStore.record?.id),
				'duplicate fetch request aborted for server role assignments',
				server,
				requestKey
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(client.authStore.record?.id),
			'error fetching server role assignments',
			server,
			'\n',
			err
		);
	}
};

const addServerToMemory = (client: string | undefined, record: ServersRecord) => {
	if (!client) {
		return;
	}

	sunburn.servers[record.id] = record;
	sunburn.visibleServers[client].add(record.id);

	if (!(record.id in sunburn.serverChannels)) {
		sunburn.serverChannels[record.id] = new SvelteSet();
	}
	if (!(record.id in sunburn.serverRoles)) {
		sunburn.serverRoles[record.id] = new SvelteSet();
	}
};

const addServerRoleToMemory = (record: ServerRolesRecord) => {
	if (!(record.server in sunburn.serverRoles)) {
		sunburn.serverRoles[record.server] = new SvelteSet();
	}

	if (!(record.id in sunburn.serverRoleAssignments)) {
		sunburn.serverRoleAssignments[record.id] = new SvelteSet();
	}

	sunburn.serverRoles[record.server].add(record.id);
	sunburn.serverRoleRecords[record.id] = record;
};

const addServerRoleAssignmentToMemory = (record: ServerRoleAssignmentsRecord) => {
	if (!(record.role in sunburn.serverRoleAssignments)) {
		sunburn.serverRoleAssignments[record.role] = new SvelteSet();
	}

	sunburn.serverRoleAssignments[record.role].add(record.user);
};

const removeServerFromMemory = (client: string | undefined, record?: ServersRecord) => {
	if (!client || !record) {
		return;
	}

	sunburn.visibleServers[client]?.delete(record.id);
	// delete sunburn.servers[record.id];
	// delete sunburn.serverChannels[record.id];
	// delete sunburn.serverRoles[record.id];
};

export const fetchCompleteServer = async (client: string | undefined, server: string) => {
	if (!client) {
		return;
	}

	await fetchServer(sunburn.clients[client], server, [client, server].toString());
	await fetchChannelsForServer(sunburn.clients[client], server, [client, server].toString());
	await fetchServerRoles(sunburn.clients[client], server, [client, server].toString());
	fetchServerRoleAssignments(sunburn.clients[client], server, [client, server].toString());
};
