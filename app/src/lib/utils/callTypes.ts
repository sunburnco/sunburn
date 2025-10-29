import type {
	LocalParticipant,
	LocalTrackPublication,
	RemoteParticipant,
	RemoteTrackPublication
} from 'livekit-client';

export type CallTrackID_t = string;
export type CallUserID_t = string;

export type CallLocalParticipant_t = {
	participant: LocalParticipant;
	tracks: Record<CallTrackID_t, LocalTrackPublication>;
	micUnmuted: boolean;
	cameraUnmuted: boolean;
	screenShareActive: boolean;
};
export type CallRemoteParticipant_t = {
	participant: RemoteParticipant;
	tracks: Record<CallTrackID_t, RemoteTrackPublication>;
	micUnmuted: boolean;
	cameraUnmuted: boolean;
};

export type CallParticipants_t = Record<CallUserID_t, CallRemoteParticipant_t>;
