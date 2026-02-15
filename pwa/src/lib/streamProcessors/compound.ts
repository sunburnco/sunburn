import type {
	NoiseGateWorkletNode,
	RnnoiseWorkletNode,
	SpeexWorkletNode,
} from '@sapphi-red/web-noise-suppressor';
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url';
import rnNoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url';
import rnNoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url';
import rnNoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url';
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url';
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url';
import type { AudioProcessorOptions, Track, TrackProcessor } from 'livekit-client';

import { debugPrefix } from '$lib/utils/logPrefixes';
import { logFriendly } from '$lib/utils/username';

export class CompoundProcessor implements TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
	instanceID: string;
	name: string;
	audioContext: AudioContext | null;
	sourceNode: MediaStreamAudioSourceNode | null;
	speexNode: SpeexWorkletNode | null;
	rnNoiseNode: RnnoiseWorkletNode | null;
	noiseGateNode: NoiseGateWorkletNode | null;
	gainNode: GainNode | null;
	destinationNode: MediaStreamAudioDestinationNode | null;
	processedTrack?: MediaStreamTrack | undefined;

	speexEnabled: boolean;
	rnNoiseEnabled: boolean;
	noiseGateEnabled: boolean;
	noiseGateCloseThreshold: number;
	noiseGateOpenThreshold: number;
	noiseGateHoldMS: number;
	gain: number;

	constructor(
		instanceID: string,
		opts: {
			speexEnabled: boolean;
			rnNoiseEnabled: boolean;
			noiseGateEnabled: boolean;
			noiseGateCloseThreshold: number;
			noiseGateOpenThreshold: number;
			noiseGateHoldMS: number;
			gain: number;
		},
	) {
		this.instanceID = instanceID;
		this.name = 'CompoundProcessor';
		this.audioContext = null;
		this.sourceNode = null;
		this.speexNode = null;
		this.speexEnabled = opts.speexEnabled;
		this.rnNoiseNode = null;
		this.rnNoiseEnabled = opts.rnNoiseEnabled;
		this.noiseGateNode = null;
		this.noiseGateEnabled = opts.noiseGateEnabled;
		this.noiseGateCloseThreshold = opts.noiseGateCloseThreshold;
		this.noiseGateOpenThreshold = opts.noiseGateOpenThreshold;
		this.noiseGateHoldMS = opts.noiseGateHoldMS;
		this.gainNode = null;
		this.gain = opts.gain;
		this.destinationNode = null;
		this.processedTrack = undefined;
	}

	async init(opts: AudioProcessorOptions) {
		const { track, audioContext } = opts;
		this.audioContext = audioContext;

		const stream = new MediaStream([track]);
		this.sourceNode = audioContext.createMediaStreamSource(stream);
		this.destinationNode = audioContext.createMediaStreamDestination();

		const wns = await import('@sapphi-red/web-noise-suppressor');

		const { loadSpeex, SpeexWorkletNode } = wns;
		const speexBinary = await loadSpeex({
			url: speexWasmPath,
		});
		await this.audioContext.audioWorklet.addModule(speexWorkletPath);
		this.speexNode = new SpeexWorkletNode(this.audioContext, {
			wasmBinary: speexBinary,
			maxChannels: 2,
		});
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
		const { NoiseGateWorkletNode } = wns;
		await this.audioContext.audioWorklet.addModule(noiseGateWorkletPath);
		this.noiseGateNode = new NoiseGateWorkletNode(this.audioContext, {
			maxChannels: 2,
			closeThreshold: this.noiseGateCloseThreshold,
			openThreshold: this.noiseGateOpenThreshold,
			holdMs: this.noiseGateHoldMS,
		});

		this.gainNode = new GainNode(this.audioContext, { channelCount: 2, gain: this.gain });

		this.buildChain();
	}

	async restart(opts: AudioProcessorOptions) {
		if (!this.audioContext) {
			return;
		}

		const { track } = opts;

		const stream = new MediaStream([track]);
		this.sourceNode = this.audioContext.createMediaStreamSource(stream);
		this.destinationNode = this.audioContext.createMediaStreamDestination();
		this.buildChain();
	}

	async destroy() {
		if (this.sourceNode) {
			this.sourceNode.disconnect();
		}
		if (this.speexNode) {
			this.speexNode.disconnect();
			this.speexNode.destroy();
		}
		if (this.rnNoiseNode) {
			this.rnNoiseNode.disconnect();
			this.rnNoiseNode.destroy();
		}
		if (this.noiseGateNode) {
			this.noiseGateNode.disconnect();
		}
	}

	setSpeexOptions(opts: Partial<{ enabled: boolean }>) {
		this.speexEnabled = opts.enabled ?? this.speexEnabled;
		this.buildChain();
	}

	setRNNoiseOptions(opts: Partial<{ enabled: boolean }>) {
		this.rnNoiseEnabled = opts.enabled ?? this.rnNoiseEnabled;
		this.buildChain();
	}

	setNoiseGateOptions(
		opts: Partial<{
			enabled: boolean;
			closeThreshold: number;
			openThreshold: number;
			holdMS: number;
		}>,
	) {
		this.noiseGateEnabled = opts.enabled ?? this.noiseGateEnabled;
		this.noiseGateCloseThreshold = opts.closeThreshold ?? this.noiseGateCloseThreshold;
		this.noiseGateOpenThreshold = opts.openThreshold ?? this.noiseGateOpenThreshold;
		this.noiseGateHoldMS = opts.holdMS ?? this.noiseGateHoldMS;
		this.buildChain();
	}

	setGainOptions(opts: Partial<{ gain: number }>) {
		this.gain = opts.gain ?? this.gain;
		this.buildChain();
	}

	buildChain() {
		if (!this.sourceNode || !this.destinationNode || !this.audioContext) {
			return;
		}

		this.sourceNode.disconnect();
		this.speexNode?.disconnect();
		this.rnNoiseNode?.disconnect();
		this.noiseGateNode?.disconnect();
		this.gainNode?.disconnect();

		this.gainNode = new GainNode(this.audioContext!, { channelCount: 2, gain: this.gain });

		const chain: AudioNode[] = [this.sourceNode];
		const logChain = ['source'];
		if (this.speexNode && this.speexEnabled) {
			chain.push(this.speexNode);
			logChain.push('speex');
		}
		if (this.rnNoiseNode && this.rnNoiseEnabled) {
			chain.push(this.rnNoiseNode);
			logChain.push('rnNoise');
		}
		if (this.noiseGateNode && this.noiseGateEnabled) {
			chain.push(this.noiseGateNode);
			logChain.push('noiseGate');
		}
		chain.push(this.gainNode);
		logChain.push('gain');
		chain.push(this.destinationNode);
		logChain.push('destination');

		for (let i = 0; i < chain.length - 1; i++) {
			chain[i].connect(chain[i + 1]);
		}

		this.processedTrack = this.destinationNode.stream.getAudioTracks()[0];

		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			logFriendly(this.instanceID),
			'built audio processing chain',
			logChain,
		);
	}
}
