import { localSettings, saveLocalSettings } from '#lib/sunburn/localSettings.svelte.ts';

export const setTheme = (theme: string, opts?: Partial<{ skipSave: boolean }>) => {
	if (!window || !Document) {
		return;
	}

	if (!theme) {
		return;
	}

	localSettings.appearance.settings.theme.stringValue = theme;
	if (!opts?.skipSave) {
		saveLocalSettings();
	}
	window.localStorage.setItem('theme', theme);
	document.documentElement.setAttribute('data-theme', theme);
};
