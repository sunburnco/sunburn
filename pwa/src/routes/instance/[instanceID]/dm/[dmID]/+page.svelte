<script lang="ts">
	import { LucidePackageOpen } from '@lucide/svelte';
	import { DateTime } from 'luxon';

	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Message from '$lib/components/Message.svelte';
	import PBAvatar from '$lib/components/PBAvatar.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { createStaydown } from '$lib/staydown/staydown';
	import { type DM_t, type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	const instanceID: Instance_t['id'] = $derived(page.params.instanceID || '');
	const dmID: DM_t['recipientID'] = $derived(page.params.dmID || '');

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

	<div class="flex size-full max-h-full items-stretch overflow-hidden">
		<!-- TODO virtual list -->
		<div
			class="relative box-border flex grow flex-col overflow-y-auto"
			{@attach createStaydown({ pauseOnUserScroll: true })}
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
</div>
