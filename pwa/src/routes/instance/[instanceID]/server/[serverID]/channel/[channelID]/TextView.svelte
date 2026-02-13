<script lang="ts">
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Message from '$lib/components/Message.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
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

<ScrollArea
	color="base-300"
	orientation="vertical"
	class="flex grow items-stretch justify-center overflow-hidden"
	viewportClassName="max-h-full box-border grow relative"
	staydown
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
				DateTime.fromSQL(record.created).diff(DateTime.fromSQL(prevRecord.created)).as('minutes') <
					5}
		/>
	{/each}
</ScrollArea>

<div class="w-full">
	<Editor onSend={sendMessage} />
</div>
