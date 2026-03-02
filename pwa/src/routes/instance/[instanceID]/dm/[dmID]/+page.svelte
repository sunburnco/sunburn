<script lang="ts">
	import { LucideLoaderCircle, LucidePackageOpen } from '@lucide/svelte';
	import { DateTime } from 'luxon';
	import { tick } from 'svelte';
	import { VList, type VListHandle } from 'virtua/svelte';

	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Message from '$lib/components/Message.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { createStaydown } from '$lib/staydown/staydown';
	import { type DM_t, type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { fetchDMMessagesBefore } from '$lib/utils/fetchMessagesBefore';
	import { nameOrHandle } from '$lib/utils/username';

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const dmID: DM_t['recipientID'] = $derived(page.params.dmID || '');

	let scrollRef: VListHandle;
	let noMoreMessages = $derived(sunburn[instanceID].dms[dmID].messages.length < 50);

	const messages = $derived<MessagesRecord[]>([
		{ id: '_', content: '', created: DateTime.fromMillis(0).toSQL(), from: '' } as MessagesRecord,
		...sunburn[instanceID].dms[dmID].messages,
	]);

	$effect(() => {
		let _ = instanceID;
		_ = dmID;
		scrollRef.scrollToIndex(messages.length - 1, { align: 'end' });
	});

	const sendMessage = async (content: string) => {
		if (content === '') {
			return;
		}

		await sunburn[instanceID].pb.collection('messages').create(
			{
				content,
				from: sunburn[instanceID].myID,
				to: dmID,
			} as MessagesRecord,
			{
				requestKey: null,
			},
		);
	};
</script>

<div class="flex h-full w-full flex-col items-stretch">
	<div class="w-full border-b border-base-content/50 bg-base-200 p-1 font-bold select-none">
		<div class="flex items-center justify-center gap-1">
			<PBAvatar
				size="md"
				color="base-200"
				{instanceID}
				name={nameOrHandle(instanceID, dmID)}
				userID={dmID}
				url={sunburn[instanceID].users[dmID].avatar}
			/>
			{nameOrHandle(instanceID, dmID)}
		</div>
	</div>

	<VList
		class="size-full"
		data={messages}
		bind:this={scrollRef}
		getKey={(item) => item.id}
		{@attach createStaydown({ pauseOnUserScroll: true })}
		onscroll={async () => {
			if (scrollRef.getScrollOffset() !== 0 || noMoreMessages) {
				return;
			}

			// 1-indexed for placeholder
			if (messages.length === 1) {
				noMoreMessages = true;
				return;
			}

			const count = await fetchDMMessagesBefore(instanceID, dmID, messages[1].created, null);

			if (count === 0) {
				noMoreMessages = true;
			} else {
				await tick();
				scrollRef.scrollToIndex(count ?? 1);
			}
		}}
	>
		{#snippet children(record, i)}
			{@const prevRecord =
				i > 1
					? // 1-indexed because the first item of `messages` is the placeholder item
						sunburn[instanceID].dms[dmID].messages[i - 1 - 1]
					: record}
			{#if i === 0}
				{#if messages.length === 1}
					<div class="flex w-full flex-col items-center justify-center p-2 opacity-50 select-none">
						<LucidePackageOpen class="size-6" />
						<p>Nothing to display</p>
					</div>
				{:else if !noMoreMessages}
					<div class="flex w-full justify-center p-2 opacity-50 select-none">
						<LucideLoaderCircle class="size-6 animate-spin" />
					</div>
				{:else}
					<div class="flex w-full justify-center p-2 text-sm opacity-50 select-none">
						You&apos;ve reached the beginning of your chat with {nameOrHandle(
							instanceID,
							dmID,
							true,
						)}
					</div>
				{/if}
			{:else}
				<Message
					{instanceID}
					{record}
					first={i === 1}
					cozy={i > 1 &&
						prevRecord.from === record.from &&
						DateTime.fromSQL(record.created)
							.diff(DateTime.fromSQL(prevRecord.created))
							.as('minutes') < 5}
				/>
			{/if}
		{/snippet}
	</VList>

	<div class="w-full">
		<Editor onSend={sendMessage} />
	</div>
</div>
