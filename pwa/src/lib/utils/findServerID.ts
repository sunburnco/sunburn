import { type Channel_t, type Instance_t, type Role_t, sunburn } from '$lib/sunburn/sunburn.svelte';

export const findServerIDForRole = (
	instanceID: Instance_t['id'],
	roleID: Role_t['record']['id'],
) => {
	for (const serverID of Object.keys(sunburn[instanceID].servers)) {
		if (!sunburn[instanceID].servers[serverID].loaded) {
			continue;
		}
		if (roleID in sunburn[instanceID].servers[serverID].roles) {
			return serverID;
		}
	}
	return '';
};

export const findServerIDForChannel = (
	instanceID: Instance_t['id'],
	channelID: Channel_t['record']['id'],
) => {
	for (const serverID of Object.keys(sunburn[instanceID].servers)) {
		if (!sunburn[instanceID].servers[serverID].loaded) {
			continue;
		}
		if (channelID in sunburn[instanceID].servers[serverID].channels) {
			return serverID;
		}
	}
	return '';
};
