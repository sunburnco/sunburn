import { parseAbsolute, ZonedDateTime } from '@internationalized/date';

export const parseTimeFromPB = (t: string): ZonedDateTime => {
	return parseAbsolute(t.replaceAll(' ', 'T'), 'Etc/GMT');
};
