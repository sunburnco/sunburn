<script lang="ts">
	import {
		LucideMic,
		LucideMicOff,
		LucideMonitorUp,
		LucideMonitorX,
		LucidePhoneMissed,
		LucideVideo,
		LucideVideoOff,
	} from '@lucide/svelte';
	import { ConnectionState } from 'livekit-client';

	import { call } from '$lib/sunburn/call.svelte';
	import { disconnect } from '$lib/utils/call/disconnect';
	import { muteCamera } from '$lib/utils/call/muteCamera';
	import { muteMic } from '$lib/utils/call/muteMic';
	import { startScreenShare } from '$lib/utils/call/startScreenShare';
	import { stopScreenShare } from '$lib/utils/call/stopScreenShare';
	import { unmuteCamera } from '$lib/utils/call/unmuteCamera';
	import { unmuteMic } from '$lib/utils/call/unmuteMic';
</script>

<div
	class="sticky bottom-0 mt-auto w-full border-t border-base-content/50 bg-base-100 p-2 text-base-content"
>
	<div class="flex w-full justify-end gap-2">
		<button
			disabled={call.roomState !== ConnectionState.Connected}
			class={['group btn btn-square btn-sm', call.me?.micUnmuted ? 'btn-accent' : 'btn-ghost']}
			onclick={call.me?.micUnmuted ? muteMic : unmuteMic}
			title={call.me?.micUnmuted ? 'Mute (you are unmuted)' : 'Unmute (you are muted)'}
		>
			<div class="group-disabled:opacity-20">
				{#if call.me?.micUnmuted}
					<LucideMic class="size-5" />
				{:else}
					<LucideMicOff class="size-5 stroke-base-content" />
				{/if}
			</div>
		</button>
		<button
			disabled={call.roomState !== ConnectionState.Connected}
			class={['group btn btn-square btn-sm', call.me?.cameraUnmuted ? 'btn-accent' : 'btn-ghost']}
			onclick={call.me?.cameraUnmuted ? muteCamera : unmuteCamera}
			title={call.me?.cameraUnmuted
				? 'Stop camera (your camera is on)'
				: 'Start camera (your camera is off)'}
		>
			<div class="text-base-content group-disabled:opacity-20">
				{#if call.me?.cameraUnmuted}
					<LucideVideo class="size-5" />
				{:else}
					<LucideVideoOff class="size-5" />
				{/if}
			</div>
		</button>
		<button
			disabled={call.roomState !== ConnectionState.Connected}
			class={[
				'group btn btn-square btn-sm',
				call.me?.screenShareUnmuted ? 'btn-accent' : 'btn-ghost',
			]}
			onclick={call.me?.screenShareUnmuted ? stopScreenShare : startScreenShare}
			title={call.me?.screenShareUnmuted
				? 'Stop sharing your screen (your screen is being shared)'
				: 'Begin sharing your screen (your screen is not being shared)'}
		>
			<div class="text-base-content group-disabled:opacity-20">
				{#if call.me?.screenShareUnmuted}
					<LucideMonitorUp class="size-5" />
				{:else}
					<LucideMonitorX class="size-5" />
				{/if}
			</div>
		</button>
		<button
			disabled={call.roomState === ConnectionState.Disconnected}
			class="group btn btn-square btn-sm btn-primary"
			onclick={disconnect}
			title="Disconnect"
		>
			<div class="text-base-content group-disabled:opacity-20">
				<LucidePhoneMissed class="size-5" />
			</div>
		</button>
	</div>
</div>
