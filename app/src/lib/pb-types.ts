/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	ChannelReadOnlyRoles = "channelReadOnlyRoles",
	ChannelRoleAssignments = "channelRoleAssignments",
	Channels = "channels",
	Deleted = "deleted",
	DmListFrom = "dmListFrom",
	DmListTo = "dmListTo",
	Messages = "messages",
	PinnedDMs = "pinnedDMs",
	PinnedServers = "pinnedServers",
	ServerCounts = "serverCounts",
	ServerQuotas = "serverQuotas",
	ServerRoleAssignments = "serverRoleAssignments",
	ServerRoles = "serverRoles",
	Servers = "servers",
	Users = "users",
	VoiceParticipants = "voiceParticipants",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type ChannelReadOnlyRolesRecord<TroleIDs = unknown> = {
	channelID: RecordIdString
	id: string
	roleIDs?: null | TroleIDs
}

export type ChannelRoleAssignmentsRecord = {
	channel: RecordIdString
	created?: IsoDateString
	id: string
	readonly?: boolean
	role: RecordIdString
	updated?: IsoDateString
}

export type ChannelsRecord = {
	created?: IsoDateString
	id: string
	name: string
	server: RecordIdString
	updated?: IsoDateString
	voice?: boolean
}

export type DeletedRecord<Trecord = unknown> = {
	collection: string
	created?: IsoDateString
	id: string
	record: null | Trecord
	updated?: IsoDateString
}

export type DmListFromRecord<Tusers = unknown> = {
	id: string
	users?: null | Tusers
}

export type DmListToRecord<Tusers = unknown> = {
	id: string
	users?: null | Tusers
}

export type MessagesRecord = {
	channel?: RecordIdString
	content: string
	created?: IsoDateString
	edited?: boolean
	from: RecordIdString
	id: string
	to?: RecordIdString
	updated?: IsoDateString
}

export type PinnedDMsRecord = {
	created?: IsoDateString
	id: string
	recipient: RecordIdString
	updated?: IsoDateString
	user: RecordIdString
}

export type PinnedServersRecord = {
	created?: IsoDateString
	id: string
	server: RecordIdString
	updated?: IsoDateString
	user: RecordIdString
}

export type ServerCountsRecord = {
	id: string
	serverCount?: number
	user: RecordIdString
}

export type ServerQuotasRecord = {
	created?: IsoDateString
	id: string
	maxServers?: number
	updated?: IsoDateString
	user: RecordIdString
}

export type ServerRoleAssignmentsRecord = {
	created?: IsoDateString
	id: string
	role: RecordIdString
	updated?: IsoDateString
	user: RecordIdString
}

export type ServerRolesRecord = {
	color?: string
	created?: IsoDateString
	id: string
	name: string
	ordinal?: number
	server: RecordIdString
	updated?: IsoDateString
}

export type ServersRecord = {
	created?: IsoDateString
	icon?: string
	id: string
	name: string
	owner: RecordIdString
	updated?: IsoDateString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	handle: string
	handle_lowercase: string
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type VoiceParticipantsRecord = {
	channel: RecordIdString
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ChannelReadOnlyRolesResponse<TroleIDs = unknown, Texpand = unknown> = Required<ChannelReadOnlyRolesRecord<TroleIDs>> & BaseSystemFields<Texpand>
export type ChannelRoleAssignmentsResponse<Texpand = unknown> = Required<ChannelRoleAssignmentsRecord> & BaseSystemFields<Texpand>
export type ChannelsResponse<Texpand = unknown> = Required<ChannelsRecord> & BaseSystemFields<Texpand>
export type DeletedResponse<Trecord = unknown, Texpand = unknown> = Required<DeletedRecord<Trecord>> & BaseSystemFields<Texpand>
export type DmListFromResponse<Tusers = unknown, Texpand = unknown> = Required<DmListFromRecord<Tusers>> & BaseSystemFields<Texpand>
export type DmListToResponse<Tusers = unknown, Texpand = unknown> = Required<DmListToRecord<Tusers>> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type PinnedDMsResponse<Texpand = unknown> = Required<PinnedDMsRecord> & BaseSystemFields<Texpand>
export type PinnedServersResponse<Texpand = unknown> = Required<PinnedServersRecord> & BaseSystemFields<Texpand>
export type ServerCountsResponse<Texpand = unknown> = Required<ServerCountsRecord> & BaseSystemFields<Texpand>
export type ServerQuotasResponse<Texpand = unknown> = Required<ServerQuotasRecord> & BaseSystemFields<Texpand>
export type ServerRoleAssignmentsResponse<Texpand = unknown> = Required<ServerRoleAssignmentsRecord> & BaseSystemFields<Texpand>
export type ServerRolesResponse<Texpand = unknown> = Required<ServerRolesRecord> & BaseSystemFields<Texpand>
export type ServersResponse<Texpand = unknown> = Required<ServersRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VoiceParticipantsResponse<Texpand = unknown> = Required<VoiceParticipantsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	channelReadOnlyRoles: ChannelReadOnlyRolesRecord
	channelRoleAssignments: ChannelRoleAssignmentsRecord
	channels: ChannelsRecord
	deleted: DeletedRecord
	dmListFrom: DmListFromRecord
	dmListTo: DmListToRecord
	messages: MessagesRecord
	pinnedDMs: PinnedDMsRecord
	pinnedServers: PinnedServersRecord
	serverCounts: ServerCountsRecord
	serverQuotas: ServerQuotasRecord
	serverRoleAssignments: ServerRoleAssignmentsRecord
	serverRoles: ServerRolesRecord
	servers: ServersRecord
	users: UsersRecord
	voiceParticipants: VoiceParticipantsRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	channelReadOnlyRoles: ChannelReadOnlyRolesResponse
	channelRoleAssignments: ChannelRoleAssignmentsResponse
	channels: ChannelsResponse
	deleted: DeletedResponse
	dmListFrom: DmListFromResponse
	dmListTo: DmListToResponse
	messages: MessagesResponse
	pinnedDMs: PinnedDMsResponse
	pinnedServers: PinnedServersResponse
	serverCounts: ServerCountsResponse
	serverQuotas: ServerQuotasResponse
	serverRoleAssignments: ServerRoleAssignmentsResponse
	serverRoles: ServerRolesResponse
	servers: ServersResponse
	users: UsersResponse
	voiceParticipants: VoiceParticipantsResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'channelReadOnlyRoles'): RecordService<ChannelReadOnlyRolesResponse>
	collection(idOrName: 'channelRoleAssignments'): RecordService<ChannelRoleAssignmentsResponse>
	collection(idOrName: 'channels'): RecordService<ChannelsResponse>
	collection(idOrName: 'deleted'): RecordService<DeletedResponse>
	collection(idOrName: 'dmListFrom'): RecordService<DmListFromResponse>
	collection(idOrName: 'dmListTo'): RecordService<DmListToResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'pinnedDMs'): RecordService<PinnedDMsResponse>
	collection(idOrName: 'pinnedServers'): RecordService<PinnedServersResponse>
	collection(idOrName: 'serverCounts'): RecordService<ServerCountsResponse>
	collection(idOrName: 'serverQuotas'): RecordService<ServerQuotasResponse>
	collection(idOrName: 'serverRoleAssignments'): RecordService<ServerRoleAssignmentsResponse>
	collection(idOrName: 'serverRoles'): RecordService<ServerRolesResponse>
	collection(idOrName: 'servers'): RecordService<ServersResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'voiceParticipants'): RecordService<VoiceParticipantsResponse>
}
