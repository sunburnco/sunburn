import {
	ConnectionState,
	type LocalParticipant,
	type LocalTrackPublication,
	type RemoteParticipant,
	type RemoteTrackPublication,
	type Room,
} from 'livekit-client';
import { DateTime } from 'luxon';

import type { Channel_t, Instance_t, Server_t } from './sunburn.svelte';

export type CallTrackID_t = string;
export type CallUserID_t = string;

export type CallLocalParticipant_t = {
	participant: LocalParticipant;
	tracks: Record<CallTrackID_t, LocalTrackPublication>;
	micUnmuted: boolean;
	cameraUnmuted: boolean;
	screenShareUnmuted: boolean;
	screenShareAudioUnmuted: boolean;
};
export type CallRemoteParticipant_t = {
	participant: RemoteParticipant;
	tracks: Record<CallTrackID_t, RemoteTrackPublication>;
	micUnmuted: boolean;
	cameraUnmuted: boolean;
	screenShareUnmuted: boolean;
	screenShareAudioUnmuted: boolean;
};

export type CallParticipants_t = Record<CallUserID_t, CallRemoteParticipant_t>;

export type ActiveCall_t = {
	instanceID: Instance_t['id'];
	serverID: Server_t['record']['id'];
	channelID: Channel_t['record']['id'];

	room: Room | null;
	roomState: ConnectionState;
	roomToken: string;
	roomTokenValidUntil: DateTime;

	roomParticipants: CallParticipants_t;

	lkBaseURL: string;

	me: CallLocalParticipant_t | null;
};

export const blankCall: ActiveCall_t = {
	instanceID: '',
	serverID: '',
	channelID: '',

	room: null,
	roomState: ConnectionState.Disconnected,
	roomToken: '',
	roomTokenValidUntil: DateTime.fromMillis(0),

	roomParticipants: {},

	lkBaseURL: '',

	me: null,
};

export const call = $state<ActiveCall_t>(blankCall);
