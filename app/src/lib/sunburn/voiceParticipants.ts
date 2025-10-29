import type { RecordSubscription } from 'pocketbase';

import { debugPrefix } from '$lib/logPrefixes';
import type { VoiceParticipantsRecord, VoiceParticipantsResponse } from '$lib/pb-types';
import { sunburn } from '$lib/sunburn.svelte';
import { logFriendly } from '$lib/utils/username';

export const onVoiceParticipant = (
	clientID: string | undefined,
	e: RecordSubscription<VoiceParticipantsResponse>
) => {
	if (!clientID) {
		return;
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, logFriendly(clientID), e.action, 'voiceParticipant', e.record);

	const { action, record } = e as {
		action: 'create' | 'delete';
		record: VoiceParticipantsRecord;
	};

	if (action === 'create') {
		if (!(record.channel in sunburn.channels)) {
			return;
		}

		sunburn.channelVoiceParticipants[record.channel].add(record.user);
	} else if (action === 'delete') {
		sunburn.channelVoiceParticipants[record.channel].delete(record.user);
	}
};
