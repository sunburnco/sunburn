<script lang="ts">
	import { localSettings, saveLocalSettings } from '$lib/sunburn/localSettings.svelte';

	import { rndWindows } from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const { windowID }: { windowID: string } = $props();

	let wasLocked = $state(false);
</script>

<WindowBase>
	<div class="flex h-full w-full flex-col overflow-y-auto pb-2">
		<h1 class="mt-2 px-2 font-display text-2xl font-bold">Local Settings</h1>
		<div class="px-2.5 text-sm">
			Local settings apply <span class="font-bold">only to this device</span> and are not synced to the
			server.
		</div>

		<ul class="menu mt-4 w-full p-0">
			<!-- #region advanced -->
			<li>
				<div class="menu-title">Advanced Settings</div>
				<ul>
					<li>
						<label class="inline-flex justify-between">
							<div>
								<div class="font-semibold">Show Advanced Settings</div>
							</div>
							<input
								type="checkbox"
								class="toggle"
								name="localSettings.showAdvanced"
								bind:checked={localSettings.showAdvanced}
								onchange={saveLocalSettings}
							/>
						</label>
					</li>
				</ul>
			</li>
			<!-- #endregion -->

			<!-- #region microphone -->
			<li class="mt-4">
				<div class="menu-title">Microphone</div>
				<ul>
					<li>
						<label class="inline-flex justify-between">
							<div>
								<div class="font-semibold">
									{#if localSettings.showAdvanced}<span class="badge badge-sm">Advanced</span>{/if}
									Gain
								</div>
								<div class="text-xs">
									Set microphone sensitivity.
									{#if localSettings.showAdvanced}
										<br />
										When advanced settings are shown, gain can be set up to 200%.
									{/if}
								</div>
							</div>
							<!-- TODO add floating tooltip -->
							<input
								type="range"
								class="range max-w-1/3"
								min={0}
								max={localSettings.showAdvanced ? 2 : 1}
								step={0.05}
								name="localSettings.compoundProcessor.gain"
								bind:value={localSettings.compoundProcessor.gain}
								onchange={saveLocalSettings}
								onpointerdown={() => {
									wasLocked = rndWindows[windowID].locked;
									rndWindows[windowID].locked = true;
								}}
								onpointerup={() => (rndWindows[windowID].locked = wasLocked)}
							/>
						</label>
					</li>
					<li>
						<label class="inline-flex justify-between">
							<div>
								<div class="font-semibold">Use RNNoise</div>
								<div class="text-xs">
									Enables noise cancellation with
									<a href="https://github.com/xiph/rnnoise" class="link">xiph/rnnoise</a>. Try using
									this if call participants complain about keyboard noises.
								</div>
							</div>
							<input
								type="checkbox"
								class="toggle"
								name="localSettings.compoundProcessor.rnNoiseEnabled"
								bind:checked={localSettings.compoundProcessor.rnNoiseEnabled}
								onchange={saveLocalSettings}
							/>
						</label>
					</li>
					<li>
						<label class="inline-flex justify-between">
							<div>
								<div class="font-semibold">Use Speex</div>
								<div class="text-xs">
									Enables noise cancellation with
									<a href="https://github.com/xiph/speexdsp" class="link">xiph/speexdsp</a>
									preprocessing. In our testing, RNNoise works better.
								</div>
							</div>
							<input
								type="checkbox"
								class="toggle"
								name="localSettings.compoundProcessor.speexEnabled"
								bind:checked={localSettings.compoundProcessor.speexEnabled}
								onchange={saveLocalSettings}
							/>
						</label>
					</li>
					<li>
						<label class="inline-flex justify-between">
							<div>
								<div class="font-semibold">Use Noise Gate</div>
							</div>
							<input
								type="checkbox"
								class="toggle"
								name="localSettings.compoundProcessor.noiseGateEnabled"
								bind:checked={localSettings.compoundProcessor.noiseGateEnabled}
								onchange={saveLocalSettings}
							/>
						</label>
					</li>
					{#if localSettings.showAdvanced}
						<li>
							<label class="inline-flex justify-between">
								<div class="">
									<div class="font-semibold">
										<span class="badge badge-sm">Advanced</span> Noise Gate: Open Threshold
									</div>
									<div class="text-xs">
										The minimum volume your mic must pick up before opening the gate.
										<br />
										Default: -45dB
									</div>
								</div>
								<label class="input input-sm w-min gap-0 font-display">
									<input
										type="number"
										class="min-w-12 px-0 text-end"
										name="localSettings.compoundProcessor.noiseGateOpenThreshold"
										bind:value={localSettings.compoundProcessor.noiseGateOpenThreshold}
										onchange={saveLocalSettings}
									/>
									<span>dB</span>
								</label>
							</label>
						</li>
						<li>
							<label class="inline-flex justify-between">
								<div class="">
									<div class="font-semibold">
										<span class="badge badge-sm">Advanced</span> Noise Gate: Close Threshold
									</div>
									<div class="text-xs">
										The minimum volume your mic must pick up to keep the gate open. This should be
										~5dB lower than yuor open threshold.
										<br />
										Default: -50dB
									</div>
								</div>
								<label class="input input-sm w-min gap-0 font-display">
									<input
										type="number"
										class="min-w-12 px-0 text-end"
										name="localSettings.compoundProcessor.noiseGateCloseThreshold"
										bind:value={localSettings.compoundProcessor.noiseGateCloseThreshold}
										onchange={saveLocalSettings}
									/>
									<span>dB</span>
								</label>
							</label>
						</li>
						<li>
							<label class="inline-flex justify-between">
								<div class="">
									<div class="font-semibold">
										<span class="badge badge-sm">Advanced</span> Noise Gate: Hold MS
									</div>
									<div class="text-xs">
										The time the gate stays open after dropping below the close threshold.
										<br />
										Default: 150ms
									</div>
								</div>
								<label class="input input-sm w-min gap-0 font-display">
									<input
										type="number"
										class="min-w-12 px-0 text-end"
										name="localSettings.compoundProcessor.noiseGateHoldMS"
										bind:value={localSettings.compoundProcessor.noiseGateHoldMS}
										onchange={saveLocalSettings}
									/>
									<span>ms</span>
								</label>
							</label>
						</li>
					{/if}
				</ul>
			</li>
			<!-- #endregion -->

			<!-- #region window -->
			<li class="mt-4">
				<div class="menu-title">Window</div>
				<ul>
					<li>
						<label class="inline-flex justify-between">
							<div class="">
								<div class="font-semibold">Call Window: Default Coordinates</div>
								<div class="text-xs">
									Open call windows at these coordinates.
									<br />
									Default: -1 (center of screen)
								</div>
							</div>
							<div class="flex flex-col items-end gap-1">
								<label class="input input-sm w-min font-display">
									<span>x =</span>
									<input
										type="number"
										class="min-w-12 px-0"
										name="localSettings.window.call.positionX"
										bind:value={localSettings.window.call.positionX}
										onchange={saveLocalSettings}
									/>
								</label>
								<label class="input input-sm w-min font-display">
									<span>y =</span>
									<input
										type="number"
										class="min-w-12 px-0"
										name="localSettings.window.call.positionY"
										bind:value={localSettings.window.call.positionY}
										onchange={saveLocalSettings}
									/>
								</label>
							</div>
						</label>
					</li>
					<li>
						<label class="inline-flex justify-between">
							<div class="">
								<div class="font-semibold">Call Window: Default Size</div>
								<div class="text-xs">
									Open call windows with this size or the minima, whichever is higher.
									<br />
									Default: -1
								</div>
							</div>
							<div class="flex flex-col items-end gap-1">
								<label class="input input-sm w-min font-display">
									<span>w =</span>
									<input
										type="number"
										class="min-w-12 px-0"
										name="localSettings.window.call.sizeW"
										bind:value={localSettings.window.call.sizeW}
										onchange={saveLocalSettings}
									/>
								</label>
								<label class="input input-sm w-min font-display">
									<span>h =</span>
									<input
										type="number"
										class="min-w-12 px-0"
										name="localSettings.window.call.sizeH"
										bind:value={localSettings.window.call.sizeH}
										onchange={saveLocalSettings}
									/>
								</label>
							</div>
						</label>
					</li>
				</ul>
			</li>
			<!-- #endregion -->
		</ul>
	</div>
</WindowBase>
