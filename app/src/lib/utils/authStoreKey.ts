import { errorPrefix } from '$lib/logPrefixes';

export const authStoreKey = (instanceURL: string) => {
	try {
		const url = new URL(instanceURL.includes('://') ? instanceURL : `http://${instanceURL}`);

		// const protocol = url.protocol;
		const hostname = url.hostname;
		let port = url.port;

		// if (!port) {
		// 	port = protocol === 'https:' ? '443' : '80';
		// }

		if (port === '443' || port === '80') {
			port = '';
		}

		return `${hostname}${port ? ':' + port : ''}`;
	} catch {
		// eslint-disable-next-line no-console
		console.error(...errorPrefix, 'invalid instance URL\n', instanceURL);
		return '';
	}
};
