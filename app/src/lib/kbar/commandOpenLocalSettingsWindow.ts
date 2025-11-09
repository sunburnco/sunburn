import { spawnLocalSettingsWindow } from '$lib/rnd/spawn/spawnLocalSettingsWindow';

import type { KBarCommand_t } from './commands';

export const openLocalSettingsWindowCommand: KBarCommand_t = {
	title: 'Open Local Settings',
	description:
		'Open settings that apply to this device only, such as gain, noise cancellation, and default window positions.',
	args: [],
	callback: () => {
		spawnLocalSettingsWindow();
	}
};
