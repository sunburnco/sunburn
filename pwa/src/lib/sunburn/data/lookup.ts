import {
	type Channel_t,
	type Instance_t,
	type Role_t,
	type Server_t,
	sunburn,
} from '../sunburn.svelte';

export const lookupServerIDByChannelID = (
	instanceID: Instance_t['id'],
	channelID: Channel_t['record']['id'],
): Server_t['record']['id'] | null => {
	for (const serverID of Object.keys(sunburn[instanceID].servers)) {
		if (channelID in sunburn[instanceID].servers[serverID].channels) {
			return serverID;
		}
	}

	return null;
};

export const lookupServerIDByRoleID = (
	instanceID: Instance_t['id'],
	roleID: Role_t['record']['id'],
): Server_t['record']['id'] | null => {
	for (const serverID of Object.keys(sunburn[instanceID].servers)) {
		if (roleID in sunburn[instanceID].servers[serverID].roles) {
			return serverID;
		}
	}

	return null;
};
