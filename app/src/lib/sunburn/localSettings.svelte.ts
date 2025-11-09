import { get, set } from 'idb-keyval';

import { debugPrefix } from '$lib/logPrefixes';

export type LocalSettings_t = {
	showAdvanced: boolean;
	compoundProcessor: {
		speexEnabled: boolean;
		rnNoiseEnabled: boolean;
		noiseGateEnabled: boolean;
		noiseGateCloseThreshold: number;
		noiseGateOpenThreshold: number;
		noiseGateHoldMS: number;
		gain: number;
	};
	window: {
		call: {
			positionX: number;
			positionY: number;
			sizeW: number;
			sizeH: number;
		};
	};
};

export const defaultLocalSettings: LocalSettings_t = {
	showAdvanced: false,
	compoundProcessor: {
		speexEnabled: false,
		rnNoiseEnabled: false,
		noiseGateEnabled: false,
		noiseGateCloseThreshold: -50,
		noiseGateOpenThreshold: -45,
		noiseGateHoldMS: 150,
		gain: 1
	},
	window: {
		call: {
			positionX: -1,
			positionY: -1,
			sizeW: -1,
			sizeH: -1
		}
	}
};

export const localSettings = $state(defaultLocalSettings);

export const saveLocalSettings = async () => {
	set('sbLocalSettings', $state.snapshot(localSettings));

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, 'saved local settings');
};
export const loadLocalSettings = async () => {
	const ls: LocalSettings_t = (await get('sbLocalSettings')) ?? defaultLocalSettings;
	for (const key of Object.keys(ls)) {
		// @ts-expect-error I promise this is type-safe
		localSettings[key] = ls[key];
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, 'loaded local settings');
};
