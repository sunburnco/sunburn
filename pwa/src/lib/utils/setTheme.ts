import { localSettings, saveLocalSettings } from '$lib/sunburn/localSettings.svelte';

export const setTheme = (theme: string) => {
	if (!window || !Document) {
		return;
	}

	if (!theme) {
		return;
	}

	localSettings.appearance.settings.theme.stringValue = theme;
	saveLocalSettings();
	window.localStorage.setItem('theme', theme);
	document.documentElement.setAttribute('data-theme', theme);
};
