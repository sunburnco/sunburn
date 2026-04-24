<script lang="ts">
	import {
		LucideCheck,
		LucideHash,
		LucidePencil,
		LucideTrash,
		LucideVolume2,
		LucideX,
	} from '@lucide/svelte';

	import { ChannelType } from '$lib/constants';
	import { type Channel_t } from '$lib/sunburn/sunburn.svelte';

	const {
		channel,
		rename,
		del,
	}: {
		channel?: Channel_t['record'];
		rename: (channelID: string, value: string) => void;
		del: (channelID: string) => void;
	} = $props();

	// const instanceID = $derived(page.params.instanceID || '');
	// const serverID = $derived(page.params.serverID || '');

	let channelName = $derived(channel?.name || '');

	let editing = $state(false);

	const onSave = () => {
		if (!channel) {
			return;
		}

		rename(channel.id, channelName);
		editing = false;
	};
</script>

{#if channel}
	<li>
		<div class="flex w-full flex-row justify-between active:bg-inherit active:text-current">
			{#if !editing}
				<div class="flex items-center gap-1">
					{#if channel.type === ChannelType.TEXT}
						<LucideHash class="inline size-4" />
					{:else if channel.type === ChannelType.VOICE}
						<LucideVolume2 class="inline size-4" />
					{/if}
					{channelName}
				</div>
			{:else}
				<input
					class="input input-sm w-1/2"
					bind:value={channelName}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							onSave();
						}
					}}
				/>
			{/if}

			<div class="flex gap-1">
				{#if !editing}
					<button title="Edit" class="btn btn-square btn-sm" onclick={() => (editing = true)}>
						<LucidePencil class="size-4" />
					</button>
					<button
						title="Delete"
						class="btn btn-square btn-sm btn-error"
						onclick={() => del(channel.id)}
					>
						<LucideTrash class="size-4" />
					</button>
				{:else}
					<button title="Save" onclick={onSave} class="btn btn-square btn-sm btn-primary">
						<LucideCheck class="size-4" />
					</button>
					<button
						title="Revert"
						onclick={() => {
							editing = false;
							channelName = channel.name;
						}}
						class="btn btn-square btn-outline btn-sm"
					>
						<LucideX class="size-4" />
					</button>
				{/if}
			</div>
		</div>
	</li>
{/if}
