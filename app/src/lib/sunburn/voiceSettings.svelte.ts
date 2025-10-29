import { get, set } from 'idb-keyval';

type UserID_t = string;

type VoiceSettings_t = {
	muted: boolean;
	micVolume: number;
	screenshareMuted: boolean;
	screenshareVolume: number;
};

export const voiceSettings = $state<Record<UserID_t, Record<UserID_t, VoiceSettings_t>>>({});

export const saveVoiceSettings = async () => set('sbVoiceSettings', $state.snapshot(voiceSettings));
export const loadVoiceSettings = async () => {
	const vcs = (await get('sbVoiceSettings')) ?? {};
	for (const key of Object.keys(vcs)) {
		voiceSettings[key] = vcs[key];
	}
};

export const defaultVoiceSettings: VoiceSettings_t = {
	muted: false,
	micVolume: 100,
	screenshareMuted: false,
	screenshareVolume: 100
};
