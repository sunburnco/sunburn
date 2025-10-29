<script lang="ts">
	import { LucideHash, LucidePackageOpen, LucideSend } from '@lucide/svelte';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	import type { MessagesRecord } from '$lib/pb-types';
	import { createStaydown } from '$lib/staydown/staydown';
	import { sunburn } from '$lib/sunburn.svelte';
	import { fetchChannel } from '$lib/sunburn/channels';
	import { fetchInitialMessagesForChannel } from '$lib/sunburn/messages';

	import Message from './Message.svelte';

	const { owner, channel }: { owner: string; channel: string } = $props();

	onMount(async () => {
		if (!channel) {
			return;
		}

		await fetchChannel(sunburn.clients[owner], channel);
		await fetchInitialMessagesForChannel(sunburn.clients[owner], channel);
	});

	let textboxContent = $state('');
	const sendMessage = async (e: SubmitEvent) => {
		e.preventDefault();

		if (textboxContent === '') {
			return;
		}

		const content = textboxContent;
		textboxContent = '';
		await sunburn.clients[owner].collection('messages').create(
			{
				content,
				from: owner,
				channel
			} as MessagesRecord,
			{
				requestKey: null
			}
		);
	};
</script>

{#if sunburn.visibleChannels[owner].has(channel)}
	<div class="flex h-full w-full flex-col items-stretch justify-center">
		<div class="bg-base-100 border-base-content/50 flex items-center gap-2 border-b px-3 py-3.5">
			<div class="grow">
				<div class="flex items-center gap-1 font-bold">
					<LucideHash size="1rem" />
					{sunburn.channels[channel].name}
				</div>
			</div>
		</div>
		{#if channel in sunburn.channelMessages && sunburn.channelMessages[channel].length === 0}
			<div class="text-base-content/50 flex w-full grow items-center justify-center gap-1 px-2">
				<LucidePackageOpen size="1.25rem" /> Nothing to display
			</div>
		{:else}
			<div
				class="flex grow flex-col overflow-y-auto"
				{@attach createStaydown({ pauseOnUserScroll: true })}
			>
				{#each sunburn.channelMessages[channel] as item, i (item.id)}
					<Message
						client={owner}
						{item}
						first={i === 0}
						cozy={i !== 0 &&
							sunburn.channelMessages[channel][i - 1].from ===
								sunburn.channelMessages[channel][i].from &&
							DateTime.fromSQL(sunburn.channelMessages[channel][i].created!)
								.diff(DateTime.fromSQL(sunburn.channelMessages[channel][i - 1].created!))
								.as('minutes') < 5}
					/>
				{/each}
			</div>
		{/if}
		<form onsubmit={sendMessage} class="mt-2 flex w-full items-center gap-2 px-2 pb-2">
			<input
				name="editor"
				class="input grow"
				bind:value={textboxContent}
				placeholder="Send a message..."
				autocomplete={null}
			/>
			<button type="submit" class="btn btn-primary btn-square">
				<LucideSend size="1.25rem" />
			</button>
		</form>
	</div>
{/if}
