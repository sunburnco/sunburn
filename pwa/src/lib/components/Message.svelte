<script lang="ts">
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	import MD from '$lib/md/MD.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	import PBAvatar from './PBAvatar.svelte';

	type Props_t = {
		instanceID: Instance_t['id'];
		record: MessagesRecord;
		cozy?: boolean;
		first?: boolean;
	};

	let { instanceID, record, cozy, first }: Props_t = $props();

	const createdAt = $derived(DateTime.fromSQL(record.created) as DateTime<true>);

	onMount(() => {
		if (!(record.from in sunburn[instanceID].users)) {
			fetchUser(instanceID, record.from, null);
		}
	});
</script>

{#if instanceID in sunburn && record.from in sunburn[instanceID].users}
	<div
		class={['flex items-stretch gap-2', 'group px-2 hover:bg-base-200', !cozy && !first && 'mt-2']}
	>
		<div class="flex w-9 min-w-9 items-center select-none">
			{#if first || !cozy}
				<div class="my-1.5 size-9 self-start">
					<PBAvatar
						size="msg"
						{instanceID}
						name={nameOrHandle(instanceID, record.from)}
						userID={record.from}
						url={sunburn[instanceID].users[record.from].avatar}
					/>
				</div>
			{:else}
				<div
					class="hidden w-full text-center text-[0.55rem] font-normal text-nowrap text-base-content/50 group-hover:block"
				>
					{createdAt.toLocaleString({ hour: 'numeric', minute: '2-digit' })}
				</div>
			{/if}
		</div>
		<div class="grow">
			{#if !cozy}
				<div class="flex items-baseline gap-2">
					<div class="font-bold">{nameOrHandle(instanceID, record.from)}</div>
					<div class="text-xs font-bold text-nowrap text-base-content/50 select-none">
						{createdAt.toLocaleString(
							createdAt.diffNow().as('days') < -1 ? DateTime.DATETIME_SHORT : DateTime.TIME_SIMPLE,
						)}
					</div>
				</div>
			{/if}
			<div class="sb-message select-text">
				<MD text={record.content} />
			</div>
		</div>
		{#if record.edited}
			<div class="my-1.5 flex items-end">
				<div class="text-xs text-base-content/50" title="Edited">(e)</div>
			</div>
		{/if}
	</div>
{/if}
