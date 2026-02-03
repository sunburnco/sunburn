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

type LocalAuthStoreKey_t = string; // x@localhost:8090
type InstanceURL_t = string; // http://localhost:8090
export const localAuthStoreKeys = {} as Record<LocalAuthStoreKey_t, InstanceURL_t>;

type Role_t = {
	record: ServerRolesRecord;
	permissions: SvelteSet<string>;
};

type Channel_t = {
	record: ChannelsRecord;
	assignedRolesIDs: SvelteSet<ServerRolesRecord['id']>;
	messages: WithRequired<Omit<MessagesRecord, 'to'>, 'channel'>[];
};

type ServerMember_t = {
	id: UsersRecord['id'];
	roleIDs: SvelteSet<ServerRolesRecord['id']>;
};

type Server_t = {
	record: ServersRecord;
	permissionDefinitions: Record<PermissionsRecord['id'], PermissionsRecord>;
	roles: Record<ServerRolesRecord['id'], Role_t>;
	channels: Record<ChannelsRecord['id'], Channel_t>;
	members: Record<ServerMember_t['id'], ServerMember_t>;
};

type DM_t = {
	recipient: UsersRecord;
	messages: WithRequired<Omit<MessagesRecord, 'channel'>, 'to'>[];
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
 */
export type Instance_t = {
	id: string; // localhost:8090, host (omit port if 443)
	version: string;
	ready: boolean;

	myID: UsersRecord['id'];
	pb: TypedPocketBase;

	servers: Record<Server_t['record']['id'], Server_t>;
	dms: Record<DM_t['recipient']['id'], DM_t>;
	users: Record<UsersRecord['id'], UsersRecord>;
};

export const sunburn = $state<Record<Instance_t['id'], Instance_t>>({});
