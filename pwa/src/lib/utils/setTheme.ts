export const setTheme = (theme: string) => {
	if (!window || !Document) {
		return;
	}

	window.localStorage.setItem('theme', theme);
	document.documentElement.setAttribute('data-theme', theme);
};
