import type { ServersRecord } from '$lib/pb-types';

import { type Instance_t, sunburn } from '../sunburn.svelte';
import { fetchServer } from './server';

export const lazyLoadServer = async (
	instanceID: Instance_t['id'],
	serverID: ServersRecord['id'],
) => {
	if (!(serverID in sunburn[instanceID].servers)) {
		fetchServer(instanceID, serverID);
	}

	// fetch channels
	// fetch roles
	// fetch role assignments
	// etc etc
};
