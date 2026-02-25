export const setTheme = (theme: string) => {
	if (!window || !Document) {
		return;
	}

	if (!theme) {
		return;
	}

	window.localStorage.setItem('theme', theme);
	document.documentElement.setAttribute('data-theme', theme);
};
