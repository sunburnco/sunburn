import { clamp } from './clamp';

export const localSettingsOrDefault = (
	setting: number,
	fallback: number,
	min: number,
	max: number
) => (setting === -1 ? fallback : clamp(min, setting, max));
