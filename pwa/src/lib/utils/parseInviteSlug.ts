import { parseInstanceSlug } from './parseInstanceSlug';

export const parseInviteSlug = (
	input: string,
	fallback: string,
): {
	display: string;
	instanceID: string;
	slug: string;
} => {
	if (!input) {
		return { display: '', instanceID: '', slug: '' };
	}

	const parts = input.split('/');

	if (parts.length === 1) {
		// on.sb short URL
		// on.sb/slug
		return { display: `on.sb/${parts[0]}`, instanceID: 'on.sb', slug: parts[0] };
	} else {
		const instanceID = parseInstanceSlug(parts[0], fallback);
		return { display: `${instanceID}/${parts[1]}`, instanceID, slug: parts[1] };
	}
};
