import { ClientResponseError } from 'pocketbase';

import type { PinnedDMsRecord, PinnedDMsResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type DM_t, type Instance_t, sunburn } from '../sunburn.svelte';

export const setPinnedDMRecord = (
	instanceID: Instance_t['id'],
	pinnedDMID: DM_t['recipientID'],
) => {
	sunburn[instanceID].pinnedDMIDs.add(pinnedDMID);
};

export const clearPinnedDMRecord = (
	instanceID: Instance_t['id'],
	pinnedDMID: DM_t['recipientID'],
) => {
	sunburn[instanceID].pinnedDMIDs.delete(pinnedDMID);
};

export const fetchPinnedDMs = async (instanceID: Instance_t['id'], _requestKey?: string | null) => {
	try {
		const pinnedDMsResp = await sunburn[instanceID].pb
			.collection('pinnedDMs')
			.getFullList<PinnedDMsResponse<PinnedDMsRecord>>({ requestKey: null });
		for (const pinnedDM of pinnedDMsResp) {
			setPinnedDMRecord(instanceID, pinnedDM.recipient);
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for pinned DM list',
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(...errorPrefix, logFriendly(instanceID), 'unable to fetch pinned DM list\n', err);
	}
};
