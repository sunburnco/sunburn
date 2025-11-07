import type { SpeexWorkletNode } from '@sapphi-red/web-noise-suppressor';
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url';
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url';
import type { AudioProcessorOptions, Track, TrackProcessor } from 'livekit-client';

import { debugPrefix } from '$lib/logPrefixes';
import { logFriendly } from '$lib/utils/username';

export class SpeexProcessor implements TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
	owner: string;
	name: string;
	audioContext: AudioContext | null;
	sourceNode: MediaStreamAudioSourceNode | null;
	rnNoiseNode: SpeexWorkletNode | null;
	destinationNode: MediaStreamAudioDestinationNode | null;
	processedTrack?: MediaStreamTrack;

	constructor(owner: string) {
		this.owner = owner;
		this.name = 'SpeexProcessor';
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
		const { loadSpeex, SpeexWorkletNode } = wns;
		const rnNoiseBinary = await loadSpeex({
			url: speexWasmPath
		});
		await this.audioContext.audioWorklet.addModule(speexWorkletPath);
		this.rnNoiseNode = new SpeexWorkletNode(this.audioContext, {
			wasmBinary: rnNoiseBinary,
			maxChannels: 2
		});

		this.destinationNode = audioContext.createMediaStreamDestination();

		this.sourceNode.connect(this.rnNoiseNode);
		this.rnNoiseNode.connect(this.destinationNode);

		this.processedTrack = this.destinationNode.stream.getAudioTracks()[0];

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(this.owner), 'enabled speex processor');
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
