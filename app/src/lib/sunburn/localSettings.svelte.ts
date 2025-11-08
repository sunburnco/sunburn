import { get, set } from 'idb-keyval';

export const defaultLocalSettings = {
	compoundProcessor: {
		speexEnabled: false,
		rnNoiseEnabled: false,
		noiseGateEnabled: false,
		noiseGateCloseThreshold: -50,
		noiseGateOpenThreshold: -45,
		noiseGateHoldMS: 150,
		gain: 1
	}
};

type LocalSettings_t = typeof defaultLocalSettings;

export const localSettings = $state(defaultLocalSettings);

export const saveLocalSettings = async () => set('sbLocalSettings', $state.snapshot(localSettings));
export const loadLocalSettings = async () => {
	const ls: LocalSettings_t = (await get('sbLocalSettings')) ?? defaultLocalSettings;
	for (const key of Object.keys(ls)) {
		// @ts-expect-error I promise this is type-safe
		localSettings[key] = ls[key];
	}
};
