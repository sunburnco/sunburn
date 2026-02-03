import { sunburn } from '$lib/sunburn/sunburn.svelte';

export const logFriendly = (instanceID: string) => {
	return `<${handleAtHost(instanceID)}>`;
};

export const handleAtHost = (instanceID: string) => {
	return `${sunburn[instanceID].users[sunburn[instanceID].myID].handle}@${instanceID}`;
};
