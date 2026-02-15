/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
	Authorigins = '_authOrigins',
	Externalauths = '_externalAuths',
	Mfas = '_mfas',
	Otps = '_otps',
	Permissions = '_permissions',
	Superusers = '_superusers',
	ChannelRoleAssignments = 'channelRoleAssignments',
	Channels = 'channels',
	CumulativeChannelPermissions = 'cumulativeChannelPermissions',
	CumulativeServerPermissions = 'cumulativeServerPermissions',
	Deleted = 'deleted',
	DmListFrom = 'dmListFrom',
	DmListTo = 'dmListTo',
	MaxOrdinal = 'maxOrdinal',
	Messages = 'messages',
	PinnedDMs = 'pinnedDMs',
	PinnedServers = 'pinnedServers',
	ServerCounts = 'serverCounts',
	ServerQuotas = 'serverQuotas',
	ServerRoleAssignments = 'serverRoleAssignments',
	ServerRolePermissions = 'serverRolePermissions',
	ServerRoles = 'serverRoles',
	Servers = 'servers',
	Users = 'users',
	VoiceParticipants = 'voiceParticipants',
}

// Alias types for improved usability
export type IsoDateString = string;
export type IsoAutoDateString = string & { readonly autodate: unique symbol };
export type RecordIdString = string;
export type FileNameString = string & { readonly filename: unique symbol };
export type HTMLString = string;

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString;
	collectionId: string;
	collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string;
	created: IsoAutoDateString;
	fingerprint: string;
	id: string;
	recordRef: string;
	updated: IsoAutoDateString;
};

export type ExternalauthsRecord = {
	collectionRef: string;
	created: IsoAutoDateString;
	id: string;
	provider: string;
	providerId: string;
	recordRef: string;
	updated: IsoAutoDateString;
};

export type MfasRecord = {
	collectionRef: string;
	created: IsoAutoDateString;
	id: string;
	method: string;
	recordRef: string;
	updated: IsoAutoDateString;
};

export type OtpsRecord = {
	collectionRef: string;
	created: IsoAutoDateString;
	id: string;
	password: string;
	recordRef: string;
	sentTo?: string;
	updated: IsoAutoDateString;
};

export type PermissionsRecord = {
	created: IsoAutoDateString;
	id: string;
	isServerPermission?: boolean;
	shift?: number;
	updated: IsoAutoDateString;
};

export type SuperusersRecord = {
	created: IsoAutoDateString;
	email: string;
	emailVisibility?: boolean;
	id: string;
	password: string;
	tokenKey: string;
	updated: IsoAutoDateString;
	verified?: boolean;
};

export type ChannelRoleAssignmentsRecord = {
	channel: RecordIdString;
	created: IsoAutoDateString;
	id: string;
	role: RecordIdString;
	updated: IsoAutoDateString;
};

export type ChannelsRecord = {
	created: IsoAutoDateString;
	id: string;
	name: string;
	server: RecordIdString;
	updated: IsoAutoDateString;
	voice?: boolean;
};

export type CumulativeChannelPermissionsRecord<Tpermissions = unknown> = {
	channel: RecordIdString;
	id: string;
	permissions?: null | Tpermissions;
	server: RecordIdString;
	user: RecordIdString;
};

export type CumulativeServerPermissionsRecord<Tpermissions = unknown> = {
	id: string;
	permissions?: null | Tpermissions;
	server: RecordIdString;
	user: RecordIdString;
};

export type DeletedRecord<Trecord = unknown> = {
	collection: string;
	created: IsoAutoDateString;
	id: string;
	record: null | Trecord;
	updated: IsoAutoDateString;
};

export type DmListFromRecord<Tusers = unknown> = {
	id: string;
	users?: null | Tusers;
};

export type DmListToRecord<Tusers = unknown> = {
	id: string;
	users?: null | Tusers;
};

export type MaxOrdinalRecord<TmaxOrdinal = unknown> = {
	id: string;
	maxOrdinal?: null | TmaxOrdinal;
	server: RecordIdString;
	user: RecordIdString;
};

export type MessagesRecord = {
	channel?: RecordIdString;
	content: string;
	created: IsoAutoDateString;
	edited?: boolean;
	from: RecordIdString;
	id: string;
	to?: RecordIdString;
	updated: IsoAutoDateString;
};

export type PinnedDMsRecord = {
	created: IsoAutoDateString;
	id: string;
	recipient: RecordIdString;
	updated: IsoAutoDateString;
	user: RecordIdString;
};

export type PinnedServersRecord = {
	created: IsoAutoDateString;
	id: string;
	server: RecordIdString;
	updated: IsoAutoDateString;
	user: RecordIdString;
};

export type ServerCountsRecord = {
	id: string;
	serverCount?: number;
	user: RecordIdString;
};

export type ServerQuotasRecord = {
	created: IsoAutoDateString;
	id: string;
	maxServers?: number;
	updated: IsoAutoDateString;
	user: RecordIdString;
};

export type ServerRoleAssignmentsRecord = {
	created: IsoAutoDateString;
	id: string;
	role: RecordIdString;
	updated: IsoAutoDateString;
	user: RecordIdString;
};

export type ServerRolePermissionsRecord = {
	created: IsoAutoDateString;
	id: string;
	permission: RecordIdString;
	role: RecordIdString;
	updated: IsoAutoDateString;
};

export type ServerRolesRecord = {
	color?: string;
	created: IsoAutoDateString;
	id: string;
	name: string;
	ordinal?: number;
	server: RecordIdString;
	updated: IsoAutoDateString;
};

export type ServersRecord = {
	created: IsoAutoDateString;
	icon?: FileNameString;
	id: string;
	name: string;
	owner: RecordIdString;
	updated: IsoAutoDateString;
};

export type UsersRecord = {
	avatar?: FileNameString;
	created: IsoAutoDateString;
	email: string;
	emailVisibility?: boolean;
	handle: string;
	handle_lowercase: string;
	id: string;
	name?: string;
	password: string;
	tokenKey: string;
	updated: IsoAutoDateString;
	verified?: boolean;
};

export type VoiceParticipantsRecord = {
	channel: RecordIdString;
	created: IsoAutoDateString;
	id: string;
	updated: IsoAutoDateString;
	user: RecordIdString;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> &
	BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> &
	BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>;
export type PermissionsResponse<Texpand = unknown> = Required<PermissionsRecord> &
	BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> &
	AuthSystemFields<Texpand>;
export type ChannelRoleAssignmentsResponse<Texpand = unknown> =
	Required<ChannelRoleAssignmentsRecord> & BaseSystemFields<Texpand>;
export type ChannelsResponse<Texpand = unknown> = Required<ChannelsRecord> &
	BaseSystemFields<Texpand>;
export type CumulativeChannelPermissionsResponse<
	Tpermissions = unknown,
	Texpand = unknown,
> = Required<CumulativeChannelPermissionsRecord<Tpermissions>> & BaseSystemFields<Texpand>;
export type CumulativeServerPermissionsResponse<
	Tpermissions = unknown,
	Texpand = unknown,
> = Required<CumulativeServerPermissionsRecord<Tpermissions>> & BaseSystemFields<Texpand>;
export type DeletedResponse<Trecord = unknown, Texpand = unknown> = Required<
	DeletedRecord<Trecord>
> &
	BaseSystemFields<Texpand>;
export type DmListFromResponse<Tusers = unknown, Texpand = unknown> = Required<
	DmListFromRecord<Tusers>
> &
	BaseSystemFields<Texpand>;
export type DmListToResponse<Tusers = unknown, Texpand = unknown> = Required<
	DmListToRecord<Tusers>
> &
	BaseSystemFields<Texpand>;
export type MaxOrdinalResponse<TmaxOrdinal = unknown, Texpand = unknown> = Required<
	MaxOrdinalRecord<TmaxOrdinal>
> &
	BaseSystemFields<Texpand>;
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> &
	BaseSystemFields<Texpand>;
export type PinnedDMsResponse<Texpand = unknown> = Required<PinnedDMsRecord> &
	BaseSystemFields<Texpand>;
export type PinnedServersResponse<Texpand = unknown> = Required<PinnedServersRecord> &
	BaseSystemFields<Texpand>;
export type ServerCountsResponse<Texpand = unknown> = Required<ServerCountsRecord> &
	BaseSystemFields<Texpand>;
export type ServerQuotasResponse<Texpand = unknown> = Required<ServerQuotasRecord> &
	BaseSystemFields<Texpand>;
export type ServerRoleAssignmentsResponse<Texpand = unknown> =
	Required<ServerRoleAssignmentsRecord> & BaseSystemFields<Texpand>;
export type ServerRolePermissionsResponse<Texpand = unknown> =
	Required<ServerRolePermissionsRecord> & BaseSystemFields<Texpand>;
export type ServerRolesResponse<Texpand = unknown> = Required<ServerRolesRecord> &
	BaseSystemFields<Texpand>;
export type ServersResponse<Texpand = unknown> = Required<ServersRecord> &
	BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;
export type VoiceParticipantsResponse<Texpand = unknown> = Required<VoiceParticipantsRecord> &
	BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord;
	_externalAuths: ExternalauthsRecord;
	_mfas: MfasRecord;
	_otps: OtpsRecord;
	_permissions: PermissionsRecord;
	_superusers: SuperusersRecord;
	channelRoleAssignments: ChannelRoleAssignmentsRecord;
	channels: ChannelsRecord;
	cumulativeChannelPermissions: CumulativeChannelPermissionsRecord;
	cumulativeServerPermissions: CumulativeServerPermissionsRecord;
	deleted: DeletedRecord;
	dmListFrom: DmListFromRecord;
	dmListTo: DmListToRecord;
	maxOrdinal: MaxOrdinalRecord;
	messages: MessagesRecord;
	pinnedDMs: PinnedDMsRecord;
	pinnedServers: PinnedServersRecord;
	serverCounts: ServerCountsRecord;
	serverQuotas: ServerQuotasRecord;
	serverRoleAssignments: ServerRoleAssignmentsRecord;
	serverRolePermissions: ServerRolePermissionsRecord;
	serverRoles: ServerRolesRecord;
	servers: ServersRecord;
	users: UsersRecord;
	voiceParticipants: VoiceParticipantsRecord;
};

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse;
	_externalAuths: ExternalauthsResponse;
	_mfas: MfasResponse;
	_otps: OtpsResponse;
	_permissions: PermissionsResponse;
	_superusers: SuperusersResponse;
	channelRoleAssignments: ChannelRoleAssignmentsResponse;
	channels: ChannelsResponse;
	cumulativeChannelPermissions: CumulativeChannelPermissionsResponse;
	cumulativeServerPermissions: CumulativeServerPermissionsResponse;
	deleted: DeletedResponse;
	dmListFrom: DmListFromResponse;
	dmListTo: DmListToResponse;
	maxOrdinal: MaxOrdinalResponse;
	messages: MessagesResponse;
	pinnedDMs: PinnedDMsResponse;
	pinnedServers: PinnedServersResponse;
	serverCounts: ServerCountsResponse;
	serverQuotas: ServerQuotasResponse;
	serverRoleAssignments: ServerRoleAssignmentsResponse;
	serverRolePermissions: ServerRolePermissionsResponse;
	serverRoles: ServerRolesResponse;
	servers: ServersResponse;
	users: UsersResponse;
	voiceParticipants: VoiceParticipantsResponse;
};

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<
	{
		// Omit AutoDate fields
		[K in keyof T as Extract<T[K], IsoAutoDateString> extends never
			? K
			: never]: T[K] extends infer U // Convert FileNameString to File
			? U extends FileNameString | FileNameString[]
				? U extends any[]
					? File[]
					: File
				: U
			: never;
	},
	'id'
>;

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString;
	email: string;
	emailVisibility?: boolean;
	password: string;
	passwordConfirm: string;
	verified?: boolean;
} & ProcessCreateAndUpdateFields<T>;

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString;
} & ProcessCreateAndUpdateFields<T>;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string;
	emailVisibility?: boolean;
	oldPassword?: string;
	password?: string;
	passwordConfirm?: string;
	verified?: boolean;
};

// Update type for Base collections
export type UpdateBase<T> = Partial<Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>>;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>;

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T,
	): RecordService<CollectionResponses[T]>;
} & PocketBase;
