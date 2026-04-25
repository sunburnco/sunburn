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
		{#if !editing}
			<div class="flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current">
				{#if channel.type === ChannelType.TEXT}
					<LucideHash class="inline size-4" />
				{:else if channel.type === ChannelType.VOICE}
					<LucideVolume2 class="inline size-4" />
				{/if}
				<div class="grow">{channelName}</div>
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
			</div>
		{:else}
			<form
				class="flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current"
				onsubmit={(e) => {
					e.preventDefault();
					onSave();
				}}
			>
				<input class="input input-sm grow" bind:value={channelName} />
				<button title="Save" type="submit" class="btn btn-square btn-sm btn-primary">
					<LucideCheck class="size-4" />
				</button>
				<button
					title="Revert"
					type="reset"
					onclick={() => {
						editing = false;
						channelName = channel.name;
						rename(channel.id, channel.name);
					}}
					class="btn btn-square btn-outline btn-sm"
				>
					<LucideX class="size-4" />
				</button>
			</form>
		{/if}
	</li>
{/if}
