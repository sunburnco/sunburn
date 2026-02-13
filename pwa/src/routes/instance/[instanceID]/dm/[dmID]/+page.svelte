<script lang="ts">
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Message from '$lib/components/Message.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { type DM_t, type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const dmID: DM_t['recipientID'] = $derived(page.params.dmID || '');

	// TODO use effect to load DM

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
	<div class="w-full border-b border-base-content/50 bg-base-200 flp-md font-bold select-none">
		<div class="flex items-stretch justify-center fl-gap-[0.75/1.25]">
			<PBAvatar
				size="md"
				{instanceID}
				userID={dmID}
				name={nameOrHandle(instanceID, dmID)}
				url={sunburn[instanceID].users[dmID].avatar}
			/>
			{nameOrHandle(instanceID, dmID)}
		</div>
	</div>

	<ScrollArea
		color="base-300"
		orientation="vertical"
		class="flex grow items-stretch justify-center overflow-hidden"
		viewportClassName="max-h-full box-border grow relative"
		staydown
	>
		{#each sunburn[instanceID].dms[dmID].messages as record, i (record.id)}
			{@const prevRecord = i > 0 ? sunburn[instanceID].dms[dmID].messages[i - 1] : record}
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
		{/each}
	</ScrollArea>

	<div class="w-full">
		<Editor onSend={sendMessage} />
	</div>
</div>
