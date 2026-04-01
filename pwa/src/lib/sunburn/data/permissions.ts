import type { PermissionsRecord } from '$lib/pb-types';
import { errorPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

import { type Instance_t, sunburn } from '../sunburn.svelte';

export const setPermissionDefinitions = (
	instanceID: Instance_t['id'],
	permissions: PermissionsRecord[],
) => {
	for (const permission of permissions) {
		sunburn[instanceID].permissionDefinitions[permission.id] = permission;
	}
};

export const fetchPermissionDefinitions = async (instanceID: Instance_t['id']) => {
	try {
		const pd = await sunburn[instanceID].pb
			.collection('_permissions')
			.getFullList({ requestKey: null });
		setPermissionDefinitions(instanceID, pd);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(
			...errorPrefix,
			logFriendly(instanceID),
			'error fetching permission definitions\n',
			err,
		);
	}
};
