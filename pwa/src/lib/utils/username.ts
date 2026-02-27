import type { UsersRecord } from '$lib/pb-types';
import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';

export const logFriendly = (instanceID: Instance_t['id']) => {
	return `<${handleAtHost(instanceID)}>`;
};

export const handleAtHost = (instanceID: Instance_t['id'], userID?: UsersRecord['id']) => {
	if (!userID) {
		return `${sunburn[instanceID].users[sunburn[instanceID].myID].handle}@${instanceID}`;
	}

	if (!(userID in sunburn[instanceID].users)) {
		return `<unknown>@${instanceID}`;
	}

	return `${sunburn[instanceID].users[userID].handle}@${instanceID}`;
};

export const nameOrHandle = (
	instanceID: Instance_t['id'],
	userID: UsersRecord['id'],
	includeAt?: boolean,
) => {
	if (!userID) {
		return '';
	}

	if (!(userID in sunburn[instanceID].users)) {
		return '';
	}

	return (
		sunburn[instanceID].users[userID].name ||
		`${includeAt ? '@' : ''}${sunburn[instanceID].users[userID].handle}`
	);
};
