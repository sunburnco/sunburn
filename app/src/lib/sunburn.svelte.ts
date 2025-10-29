import type { DateTime } from 'luxon';
import type { AuthRecord } from 'pocketbase';
import { SvelteSet } from 'svelte/reactivity';

import type {
	ChannelRoleAssignmentsRecord,
	ChannelsRecord,
	MessagesRecord,
	ServerRolesRecord,
	ServersRecord,
	TypedPocketBase,
	UsersRecord
} from './pb-types';

type RecipientID_t = string;
type ServerID_t = string;
type ChannelID_t = string;
type UserID_t = string;
type ClientID_t = UserID_t;
type ServerRoleID_t = string;
type ChannelRoleAssignmentID_t = string;

type DM_t = {
	updated: DateTime;
	recipient: RecipientID_t;
	messages: MessagesRecord[];
};

type User_t = {
	record: UsersRecord;
};

type InstanceID_t = string;
type Instance_t = {
	url: InstanceID_t;
	version: string;
};

export const sunburn = $state({
	instances: {} as Record<InstanceID_t, Instance_t>,

	clients: {} as Record<ClientID_t, TypedPocketBase>,
	readyClients: new SvelteSet<ClientID_t>(),
	auths: {} as Record<ClientID_t, AuthRecord>,

	users: {} as Record<UserID_t, User_t>,

	dms: {} as Record<UserID_t, Record<RecipientID_t, DM_t>>,

	servers: {} as Record<ServerID_t, ServersRecord>,
	serverChannels: {} as Record<ServerID_t, SvelteSet<ChannelID_t>>,
	channels: {} as Record<ChannelID_t, ChannelsRecord>,
	channelMessages: {} as Record<ChannelID_t, MessagesRecord[]>,
	channelVoiceParticipants: {} as Record<ChannelID_t, SvelteSet<UserID_t>>,

	serverRoles: {} as Record<ServerID_t, SvelteSet<ServerRoleID_t>>,
	serverRoleRecords: {} as Record<ServerRoleID_t, ServerRolesRecord>,
	channelRoleAssignments: {} as Record<ChannelID_t, SvelteSet<ChannelRoleAssignmentID_t>>,
	channelRoleAssignmentRecords: {} as Record<
		ChannelRoleAssignmentID_t,
		ChannelRoleAssignmentsRecord
	>,
	serverRoleAssignments: {} as Record<ServerRoleID_t, SvelteSet<UserID_t>>,

	pinnedDMs: {} as Record<UserID_t, SvelteSet<UserID_t>>,
	pinnedServers: {} as Record<UserID_t, SvelteSet<ServerID_t>>,

	visibleServers: {} as Record<UserID_t, SvelteSet<ServerID_t>>,
	visibleChannels: {} as Record<UserID_t, SvelteSet<ChannelID_t>>,
	visibleUsers: {} as Record<UserID_t, SvelteSet<UserID_t>>
});

type LocalAuthStoreKey_t = string; // q@localhost:8090
type InstanceURL_t = string; // http://localhost:8090

export const localAuthStoreKeys = {} as Record<LocalAuthStoreKey_t, InstanceURL_t>;
