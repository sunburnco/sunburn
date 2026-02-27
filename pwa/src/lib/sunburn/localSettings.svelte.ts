import { get, set } from 'idb-keyval';
import type { XOR } from 'ts-xor';

import { debugPrefix } from '$lib/utils/logPrefixes';

export type LocalSettingKey_t = string;
export type LocalSettingsValue_t = XOR<
	{
		stringValue: string;
		placeholder?: string;
		acceptableValues?: { label?: string; value: string }[];
	},
	{ boolValue: boolean },
	{
		numberValue: number;
		min?: number;
		max?: number;
		step?: number;
		preferRange?: 'includeCurrent' | boolean;
	}
>;
export type LocalSetting_t = {
	name: string;
	description?: string;
} & LocalSettingsValue_t;

export type LocalSettingGroupKey_t = string;
export type LocalSettingGroup_t = {
	name: string;
	settings: Record<LocalSettingKey_t, LocalSetting_t>;
};

export type LocalSettings_t = Record<LocalSettingGroupKey_t, LocalSettingGroup_t>;

// add the type when creating new local settings
// remove the type to get intellisense
//   |
//   |
//   V

// export const defaultLocalSettings: LocalSettings_t = {
export const defaultLocalSettings = {
	appearance: {
		name: 'Appearance',
		settings: {
			theme: {
				name: 'Theme',
				stringValue: 'day',
				acceptableValues: [
					{ label: 'Day', value: 'day' },
					{ label: 'Midnight', value: 'midnight' },
					{ label: 'Sunset', value: 'sunset' },
					{ label: 'Oasis', value: 'oasis' },
					{ label: 'Verdant', value: 'verdant' },
					{ label: 'Lilac', value: 'lilac' },
				],
			},
		},
	},
	audio: {
		name: 'Audio',
		settings: {
			gain: {
				name: 'Microphone Gain Multiplier',
				description: 'Default: 1',
				numberValue: 1,
				min: 0,
				max: 2,
				step: 0.01,
				preferRange: 'includeCurrent',
			},
			noiseGateEnabled: {
				name: 'Enable Noise Gate',
				boolValue: false,
			},
			noiseGateCloseThreshold: {
				name: 'Noise Gate Close Threshold (dB)',
				description: 'Default: -50',
				numberValue: -50,
				min: -80,
				max: 6,
				step: 1,
				preferRange: 'includeCurrent',
			},
			noiseGateOpenThreshold: {
				name: 'Noise Gate Open Threshold (dB)',
				description: 'Default: -45',
				numberValue: -45,
				min: -80,
				max: 6,
				step: 1,
				preferRange: 'includeCurrent',
			},
			noiseGateOpenMS: {
				name: 'Noise Gate Open Duration (ms)',
				description: 'Default: 150',
				numberValue: 150,
				min: 0,
				max: 1000,
				step: 10,
			},
			rnNoiseEnabled: {
				name: 'Enable RNNoise',
				boolValue: true,
			},
			speexEnabled: {
				name: 'Enable Speex DSP',
				boolValue: false,
			},
		},
	},
	_voiceParticipantVolumes: {
		name: '',
		settings: {
			// example:
			// twopyramids@sunburn.co: {
			//   name: "",
			//   numberValue: 1,
			//   min: 0,
			//   max: 100,
			//   step: 1
			// }
		},
	} as LocalSettingGroup_t,
};

export const localSettings = $state<typeof defaultLocalSettings>(defaultLocalSettings);

export const saveLocalSettings = async () => {
	set('sbLocalSettings', $state.snapshot(localSettings));

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, 'saved local settings');
};

export const loadLocalSettings = async () => {
	const ls: LocalSettings_t =
		(await get('sbLocalSettings')) ?? (defaultLocalSettings as LocalSettings_t);
	for (const key of Object.keys(ls)) {
		// @ts-expect-error I promise this is fine
		localSettings[key] = ls[key];
	}

	// eslint-disable-next-line no-console
	console.debug(...debugPrefix, 'loaded local settings');
};
