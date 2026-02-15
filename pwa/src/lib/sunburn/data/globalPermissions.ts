import { ClientResponseError } from 'pocketbase';

import type { PermissionsRecord, PermissionsResponse } from '$lib/pb-types';
import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, sunburn } from '../sunburn.svelte';

export const fetchGlobalPermissions = async (
	instanceID: Instance_t['id'],
	_requestKey?: string | null,
) => {
	try {
		const permissionsResp = await sunburn[instanceID].pb
			.collection('_permissions')
			.getFullList<PermissionsResponse<PermissionsRecord>>({ requestKey: null });
		for (const permission of permissionsResp) {
			sunburn[instanceID].permissionDefinitions[permission.id] = permission;
		}
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 0) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'duplicate fetch request aborted for instance global permissions',
				_requestKey,
			);
			return;
		}

		// eslint-disable-next-line no-console
		console.error(...errorPrefix, 'error fetching instance global permissions\n', err);
	}
};
