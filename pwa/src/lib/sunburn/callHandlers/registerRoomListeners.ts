import type { Room } from 'livekit-client';

import { onConnected } from './onConnected';
import { onConnectionStateChanged } from './onConnectionStateChanged';
import { onLocalTrackUnpublished } from './onLocalTrackUnpublished';
import { onParticipantConnected } from './onParticipantConnected';
import { onParticipantDisconnected } from './onParticipantDisconnected';
import { onTrackMuteStatusChanged } from './onTrackMuteStatusChanged';
import { onTrackPublished } from './onTrackPublished';
import { onTrackSubscriptionStatusChanged } from './onTrackSubscriptionStatusChanged';
import { onTrackUnpublished } from './onTrackUnpublished';

export const registerRoomListeners = (r: Room) => {
	r.addListener('connected', onConnected);
	r.addListener('connectionStateChanged', onConnectionStateChanged);
	r.addListener('localTrackUnpublished', onLocalTrackUnpublished);
	r.addListener('participantConnected', onParticipantConnected);
	r.addListener('participantDisconnected', onParticipantDisconnected);
	r.addListener('trackMuted', onTrackMuteStatusChanged);
	r.addListener('trackPublished', onTrackPublished);
	r.addListener('trackSubscriptionStatusChanged', onTrackSubscriptionStatusChanged);
	r.addListener('trackUnmuted', onTrackMuteStatusChanged);
	r.addListener('trackUnpublished', onTrackUnpublished);
};
