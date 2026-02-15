import { parse } from 'tldts';

export const parseInstanceSlug = (input: string, fallback: string) => {
	let port = '';
	const groups = /:(\d{1,5})$/.exec(input);
	if (groups?.length === 2) {
		port = groups[1];
	}

	if (input.startsWith(':') && port) {
		const fbParts = fallback.split(':');
		fbParts.pop();
		return [...fbParts, port].join(':');
	}

	const tld = parse(input, { allowPrivateDomains: true });
	if (tld.domain) {
		return tld.hostname + (port ? `:${port}` : '');
	} else if (!tld.domain && tld.hostname) {
		if (input.split(':')[0].endsWith('.')) {
			return tld.hostname + (port ? `:${port}` : '');
		} else if (!tld.isIp) {
			return tld.hostname + '.on.sb' + (port ? `:${port}` : '');
		} else {
			return tld.hostname + (port ? `:${port}` : '');
		}
	} else {
		return fallback;
	}
};
