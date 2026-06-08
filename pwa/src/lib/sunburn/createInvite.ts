import type { InvitesRecord } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { pbID } from '$lib/utils/pbID';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, type Server_t, sunburn } from './sunburn.svelte';

/**
 * ⚠️ This function will silently fail if the instance is not ready
 */
export const createInvite = async (
	instanceID: Instance_t['id'],
	serverID: Server_t['record']['id'],
	record?: InvitesRecord,
): Promise<InvitesRecord | null> => {
	if (!(instanceID in sunburn) || !sunburn[instanceID].ready) {
		return null;
	}

	const inviteID = pbID(6);
	const rec = { id: inviteID, ...record, server: serverID } as InvitesRecord;
	try {
		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(instanceID), 'creating invite record\n', rec);
		await sunburn[instanceID].pb.collection('invites').create(rec);
		return rec;
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			`error creating invite for server ${serverID}\n`,
			err,
		);
		return null;
	}
};
