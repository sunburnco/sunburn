import type { UsersRecord } from '$lib/pb-types';
import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';

export const logFriendly = (instanceID: Instance_t['id']) => {
	return `<${handleAtHost(instanceID)}>`;
};

export const handleAtHost = (instanceID: Instance_t['id']) => {
	return `${sunburn[instanceID].users[sunburn[instanceID].myID].handle}@${instanceID}`;
};

export const nameOrHandle = (instanceID: Instance_t['id'], userID: UsersRecord['id']) => {
	if (!(userID in sunburn[instanceID].users)) {
		return '';
	}

	return sunburn[instanceID].users[userID].name || sunburn[instanceID].users[userID].handle;
};
