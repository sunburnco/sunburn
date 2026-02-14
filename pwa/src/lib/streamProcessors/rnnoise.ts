// https://www.linen.dev/s/livekit-users/t/29637196/show-an-example-of-how-to-implement-a-custom-audio-processor

import type { RnnoiseWorkletNode } from '@sapphi-red/web-noise-suppressor';
import rnNoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url';
import rnNoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url';
import rnNoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url';
import type { AudioProcessorOptions, Track, TrackProcessor } from 'livekit-client';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

export class RNNoiseProcessor implements TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
	instanceID: string;
	name: string;
	audioContext: AudioContext | null;
	sourceNode: MediaStreamAudioSourceNode | null;
	rnNoiseNode: RnnoiseWorkletNode | null;
	destinationNode: MediaStreamAudioDestinationNode | null;
	processedTrack?: MediaStreamTrack;

	constructor(instanceID: string) {
		this.instanceID = instanceID;
		this.name = 'RNNoiseProcessor';
		this.audioContext = null;
		this.sourceNode = null;
		this.rnNoiseNode = null;
		this.destinationNode = null;
		this.processedTrack = undefined;
	}

	async init(opts: AudioProcessorOptions) {
		const { track, audioContext } = opts;
		this.audioContext = audioContext;

		const stream = new MediaStream([track]);
		this.sourceNode = audioContext.createMediaStreamSource(stream);

		const wns = await import('@sapphi-red/web-noise-suppressor');
		const { loadRnnoise, RnnoiseWorkletNode } = wns;
		const rnNoiseBinary = await loadRnnoise({
			url: rnNoiseWasmPath,
			simdUrl: rnNoiseSimdWasmPath,
		});
		await this.audioContext.audioWorklet.addModule(rnNoiseWorkletPath);
		this.rnNoiseNode = new RnnoiseWorkletNode(this.audioContext, {
			wasmBinary: rnNoiseBinary,
			maxChannels: 2,
		});

		this.destinationNode = audioContext.createMediaStreamDestination();

		this.sourceNode.connect(this.rnNoiseNode);
		this.rnNoiseNode.connect(this.destinationNode);

		this.processedTrack = this.destinationNode.stream.getAudioTracks()[0];

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(this.instanceID), 'enabled rnnoise processor');
	}

	async restart() {}
	async destroy() {
		if (this.sourceNode) {
			this.sourceNode.disconnect();
		}
		if (this.rnNoiseNode) {
			this.rnNoiseNode.disconnect();
			this.rnNoiseNode.destroy();
		}
	}
}
