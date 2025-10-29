import { rndWindows } from '$lib/rnd/rndState.svelte';

export const resolveTheme = (windowID: string): string | undefined => {
	if (rndWindows[windowID].parent) {
		return resolveTheme(rndWindows[windowID].parent);
	} else {
		return rndWindows[windowID].theme;
	}
};
