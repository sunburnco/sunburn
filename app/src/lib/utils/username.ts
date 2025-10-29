import { sunburn } from '$lib/sunburn.svelte';

import { authStoreKey } from './authStoreKey';

export const nameOrHandle = (user: string) => {
	if (!user || !(user in sunburn.users)) {
		return user;
	}
	const name = sunburn.users[user].record.name;
	const handle = sunburn.users[user].record.handle;
	return (handle ? handle : name) ?? '';
};

export const username = (client: string, user: string) => {
	if (!user || !(user in sunburn.users)) {
		return user;
	}
	const recipientName = sunburn.users[user].record.name;
	const recipientAddress = handleAtHost(client, user);
	return recipientName ?? recipientAddress;
};

export const handleAtHost = (client: string, user: string) => {
	if (!user || !(user in sunburn.users)) {
		return user;
	}

	return `${sunburn.users[user].record.handle}@${authStoreKey(sunburn.clients[client].baseURL)}`;
};

export const usernamePlusHandle = (client: string, user: string) => {
	if (!user || !(user in sunburn.users)) {
		return '';
	}
	const recipientName = sunburn.users[user].record.name;
	const recipientAddress = handleAtHost(client, user);

	if (recipientName) {
		return `${recipientName} <${recipientAddress}>`;
	} else {
		return recipientAddress;
	}
};

export const logFriendly = (user: string | undefined) => {
	if (!user || !(user in sunburn.users)) {
		return '';
	}

	return `<${handleAtHost(user, user)}>`;
};
