<script lang="ts">
	import { LucidePackageOpen, LucideSend, LucideStar } from '@lucide/svelte';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	import Avatar from '$lib/components/Avatar.svelte';
	import Message from '$lib/components/Message.svelte';
	import { errorPrefix } from '$lib/logPrefixes';
	import type { MessagesRecord, PinnedDMsRecord } from '$lib/pb-types';
	import { createStaydown } from '$lib/staydown/staydown';
	import { sunburn } from '$lib/sunburn.svelte';
	import { fetchInitialMessagesForDM } from '$lib/sunburn/messages';
	import { fetchUser } from '$lib/sunburn/users';
	import { handleAtHost, logFriendly, username } from '$lib/utils/username';

	const { owner, recipient }: { owner: string; recipient: string } = $props();

	onMount(async () => {
		if (!recipient) {
			return;
		}

		await fetchUser(sunburn.clients[owner], recipient);
		await fetchInitialMessagesForDM(sunburn.clients[owner], recipient);
	});

	const items = $derived.by(() => {
		if (!(owner in sunburn.dms) || !(recipient in sunburn.dms[owner])) {
			return [];
		}
		return sunburn.dms[owner][recipient].messages;
	});

	let textboxContent = $state('');
	const sendMessage = async (e: SubmitEvent) => {
		e.preventDefault();

		if (textboxContent === '') {
			return;
		}

		const content = textboxContent;
		textboxContent = '';
		try {
			await sunburn.clients[owner].collection('messages').create(
				{
					content,
					from: owner,
					to: recipient
				} as MessagesRecord,
				{
					requestKey: null
				}
			);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(owner), 'error sending message\n', err);
		}
	};

	const togglePin = async () => {
		try {
			if (sunburn.pinnedDMs[owner]?.has(recipient)) {
				sunburn.pinnedDMs[owner]?.delete(recipient);

				const record = (await sunburn.clients[owner]
					.collection('pinnedDMs')
					.getFirstListItem(
						sunburn.clients[owner].filter('recipient = {:recipient}', { recipient })
					)) as PinnedDMsRecord;

				if (record.id) {
					await sunburn.clients[owner].collection('pinnedDMs').delete(record.id);
				}
			} else {
				sunburn.pinnedDMs[owner]?.add(recipient);

				await sunburn.clients[owner].collection('pinnedDMs').create({ user: owner, recipient });
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(owner), 'error pinning dm', recipient, '\n', err);
		}
	};
</script>

<div class="flex h-full w-full flex-col items-stretch justify-center">
	{#if recipient}
		<div class="flex items-center gap-2 border-b border-base-content/50 bg-base-100 px-3 py-3.5">
			<div class="size-6">
				<Avatar client={owner} user={recipient} textSize="sm" />
			</div>
			<div class="grow">
				<span class="font-bold">
					{username(owner, recipient)}
				</span>
				<span class="text-sm font-light">
					{handleAtHost(owner, recipient)}
				</span>
			</div>
			<div class="flex">
				<button title="Favorite" onclick={togglePin} class="btn btn-square btn-ghost btn-sm">
					<LucideStar
						size="1rem"
						class={sunburn.pinnedDMs[owner]?.has(recipient) ? 'fill-neutral' : 'fill-none'}
					/>
				</button>
			</div>
		</div>
	{/if}
	{#if items.length === 0}
		<div class="flex w-full grow items-center justify-center gap-1 px-2 text-base-content/50">
			<LucidePackageOpen size="1rem" /> Nothing to display
		</div>
	{:else}
		<!-- <SvelteVirtualList
			bind:this={vlist}
			defaultEstimatedItemHeight={48}
			{items}
			contentClass="h-min"
			itemsClass="flex flex-col"
		> -->
		<!-- {#snippet renderItem(item: MessagesRecord, i: number)} -->
		<div
			class="flex grow flex-col overflow-y-auto"
			{@attach createStaydown({ pauseOnUserScroll: true })}
		>
			{#each items as item, i (item.id)}
				<Message
					client={owner}
					{item}
					first={i === 0}
					cozy={i !== 0 &&
						items[i - 1].from === items[i].from &&
						DateTime.fromSQL(items[i].created!)
							.diff(DateTime.fromSQL(items[i - 1].created!))
							.as('minutes') < 5}
				/>
			{/each}
		</div>
		<!-- {/snippet} -->
		<!-- </SvelteVirtualList> -->
	{/if}
	<form onsubmit={sendMessage} class="mt-2 flex w-full items-center gap-2 px-2 pb-2">
		<input
			name="editor"
			class="input grow"
			bind:value={textboxContent}
			placeholder="Send a message..."
			autocomplete={null}
		/>
		<button type="submit" class="btn btn-square btn-primary">
			<LucideSend size="1.25rem" />
		</button>
	</form>
</div>
