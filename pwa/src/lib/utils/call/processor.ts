import { CompoundProcessor } from '$lib/streamProcessors/compound';
import { localSettings } from '$lib/sunburn/localSettings.svelte';

export const processor = new CompoundProcessor({
	speexEnabled: localSettings.audio?.settings.speexEnabled.boolValue ?? false,
	rnNoiseEnabled: localSettings.audio?.settings.rnNoiseEnabled.boolValue ?? true,
	noiseGateEnabled: localSettings.audio?.settings.noiseGateEnabled.boolValue ?? false,
	gain: localSettings.audio?.settings.gain.numberValue ?? 1,
	noiseGateCloseThreshold: localSettings.audio?.settings.noiseGateCloseThreshold.numberValue ?? -50,
	noiseGateOpenThreshold: localSettings.audio?.settings.noiseGateOpenThreshold.numberValue ?? -45,
	noiseGateHoldMS: localSettings.audio?.settings.noiseGateOpenMS.numberValue ?? 150,
});
