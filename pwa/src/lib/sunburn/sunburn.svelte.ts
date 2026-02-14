import type { DateTime } from 'luxon';
import { type SvelteSet } from 'svelte/reactivity';

import type {
	ChannelsRecord,
	MessagesRecord,
	PermissionsRecord,
	ServerRolesRecord,
	ServersRecord,
	TypedPocketBase,
	UsersRecord,
} from '$lib/pb-types';
import type { WithRequired } from '$lib/utils/withRequired';

export type LocalAuthStoreKey_t = `${string}@${string}`; // x@localhost:8090
export type BaseURL_t = string; // http://localhost:8090
export const localAuthStoreKeys = {} as Record<LocalAuthStoreKey_t, BaseURL_t>;

export type DMMessage_t = WithRequired<Omit<MessagesRecord, 'channel'>, 'to'>;
export type ChannelMessage_t = WithRequired<Omit<MessagesRecord, 'to'>, 'channel'>;

export type Role_t = {
	record: ServerRolesRecord;
	permissions: SvelteSet<string>;
};

export type Channel_t = {
	record: ChannelsRecord;
	assignedRolesIDs: SvelteSet<ServerRolesRecord['id']>;
	messages: ChannelMessage_t[];
	voiceParticipants: SvelteSet<ServerMember_t['id']>;
};

export type ServerMember_t = {
	id: UsersRecord['id'];
	roleIDs: SvelteSet<ServerRolesRecord['id']>;
};

export type Server_t = {
	record: ServersRecord;
	roles: Record<ServerRolesRecord['id'], Role_t>;
	channels: Record<ChannelsRecord['id'], Channel_t>;
	members: Record<ServerMember_t['id'], ServerMember_t>;

	// this is true when the roles, channels, and members have been fetched
	// a server only becomes "loaded" when it's selected from the server picker
	// this cuts down on event processing
	//
	// for events, the check is performed by `find{Server|Role}IDForChannel()`
	loaded: boolean;
};

export type DM_t = {
	// TODO figure out some sort of "loaded" state for DMs too
	recipientID: UsersRecord['id'];
	updated: DateTime;
	messages: DMMessage_t[];
};

/**
 *  - []instance ID (sunburn.gg)
 *  - version 0.5.0
 *  - []servers
 *    - name
 *    - picture
 *    - []_permission definitions (should be identical between all instances)
 *      - name
 *      - isServerPerm
 *    - []roles
 *      - id
 *      - name
 *      - color
 *      - ordinal
 *      - []permissions
 *    - []channels
 *      - id
 *      - name
 *      - []assignedRoles
 *      - []messages
 *    - []users
 *      - id
 *      - name
 *      - picture
 *      - []roles
 *  - []dms
 *    - target
 *    - []messages
 *
 */
export type Instance_t = {
	id: string; // localhost:8090, host (omit port if 443)
	version: string;
	ready: boolean;

	myID: UsersRecord['id'];
	pb: TypedPocketBase;

	permissionDefinitions: Record<PermissionsRecord['id'], PermissionsRecord>;
	servers: Record<Server_t['record']['id'], Server_t>;
	dms: Record<DM_t['recipientID'], DM_t>;
	users: Record<UsersRecord['id'], UsersRecord>;

	pinnedServerIDs: SvelteSet<Server_t['record']['id']>;
	pinnedDMIDs: SvelteSet<DM_t['recipientID']>;

	// TODO add memo for which server a channel belongs to
};

export const sunburn = $state<Record<Instance_t['id'], Instance_t>>({});
