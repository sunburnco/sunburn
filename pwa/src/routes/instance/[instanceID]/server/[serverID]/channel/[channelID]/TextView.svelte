<script lang="ts">
	import { LucidePackageOpen } from '@lucide/svelte';
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

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const serverID: Server_t['record']['id'] = $derived(page.params.serverID || '');
	const channelID: Channel_t['record']['id'] = $derived(page.params.channelID || '');

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
		{@attach createStaydown({ pauseOnUserScroll: true })}
	>
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
				<div>Nothing to display.</div>
			</div>
		{/each}
	</div>
</div>

<div class="w-full">
	<Editor onSend={sendMessage} />
</div>
