<script lang="ts">
	import { LucideLoaderCircle, LucidePackageOpen } from '@lucide/svelte';
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Message from '$lib/components/Message.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { createStaydown } from '$lib/staydown/staydown';
	import {
		type Channel_t,
		type Instance_t,
		type Server_t,
		sunburn,
	} from '$lib/sunburn/sunburn.svelte';
	import { fetchChannelMessagesBefore } from '$lib/utils/fetchMessagesBefore';

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const serverID: Server_t['record']['id'] = $derived(page.params.serverID || '');
	const channelID: Channel_t['record']['id'] = $derived(page.params.channelID || '');

	let scrollRef: HTMLDivElement;
	let noMoreMessages = $state(
		sunburn[instanceID].server[serverID].channel[channelID].messages.length >= 50,
	);
	$effect(() => {
		const _ = instanceID + serverID + channelID;
		noMoreMessages = false;
	});

	const sendMessage = async (content: string) => {
		if (content === '') {
			return;
		}

		await sunburn[instanceID].pb.collection('messages').create(
			{
				content,
				from: sunburn[instanceID].myID,
				channel: channelID,
			} as MessagesRecord,
			{
				requestKey: null,
			},
		);
	};
</script>

<div class="flex size-full max-h-full items-stretch overflow-hidden">
	<!-- TODO implement virtual list -->
	<div
		class="relative box-border flex grow flex-col overflow-y-auto"
		bind:this={scrollRef}
		onscroll={async () => {
			if (scrollRef.scrollTop !== 0 || noMoreMessages) {
				return;
			}

			if (sunburn[instanceID].servers[serverID].channels[channelID].messages.length === 0) {
				noMoreMessages = true;
				return;
			}

			const count = await fetchChannelMessagesBefore(
				instanceID,
				serverID,
				channelID,
				sunburn[instanceID].servers[serverID].channels[channelID].messages[0].created,
				null,
			);

			if (count === 0) {
				noMoreMessages = true;
			} else {
				scrollRef.scrollTop = 32;
			}
		}}
		{@attach createStaydown({ pauseOnUserScroll: true })}
	>
		{#if !noMoreMessages}
			<div class="flex w-full justify-center p-2 opacity-50">
				<LucideLoaderCircle class="size-6 animate-spin" />
			</div>
		{:else}
			<div class="flex w-full justify-center p-2 text-sm opacity-50">
				You&apos;ve reached the beginning of #{sunburn[instanceID].servers[serverID].channels[
					channelID
				].record.name}
			</div>
		{/if}
		{#each sunburn[instanceID].servers[serverID].channels[channelID].messages as record, i (record.id)}
			{@const prevRecord =
				i > 0 ? sunburn[instanceID].servers[serverID].channels[channelID].messages[i - 1] : record}
			<Message
				{instanceID}
				{record}
				first={i === 0}
				cozy={i !== 0 &&
					prevRecord.from === record.from &&
					DateTime.fromSQL(record.created)
						.diff(DateTime.fromSQL(prevRecord.created))
						.as('minutes') < 5}
			/>
		{:else}
			<div
				class="select-none opacity-50 mt-2 gap-1 w-full flex items-center justify-center flex-col"
			>
				<LucidePackageOpen class="size-6" />
				<div>Nothing to display</div>
			</div>
		{/each}
	</div>
</div>

<div class="w-full">
	<Editor onSend={sendMessage} />
</div>
