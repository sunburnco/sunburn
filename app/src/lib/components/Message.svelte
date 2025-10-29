<script lang="ts">
	import { DateTime } from 'luxon';

	import Avatar from '$lib/components/Avatar.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { sunburn } from '$lib/sunburn.svelte';
	import { nameOrHandle } from '$lib/utils/username';

	const {
		client,
		item,
		cozy,
		first
	}: {
		client: string;
		item: MessagesRecord;
		cozy?: boolean;
		first?: boolean;
	} = $props();

	const createdAt = DateTime.fromSQL(item.created!);
</script>

{#if item.from in sunburn.users}
	<div
		class={['flex items-center gap-2', 'hover:bg-base-200 group px-2', !cozy && !first && 'mt-2']}
	>
		<div class="w-9 min-w-9 select-none">
			{#if first || !cozy}
				<div class="size-9">
					<Avatar {client} user={item.from} />
				</div>
			{:else}
				<div
					class="text-base-content/50 hidden w-full text-nowrap text-center text-[0.55rem] font-normal group-hover:block"
				>
					{createdAt.toLocaleString({ hour: 'numeric', minute: '2-digit' })}
				</div>
			{/if}
		</div>
		<div class="grow">
			{#if !cozy}
				<div class="flex items-baseline gap-2">
					<div class="font-bold">{nameOrHandle(item.from)}</div>
					<div class="text-base-content/50 select-none text-nowrap text-xs font-bold">
						{createdAt.toLocaleString(
							createdAt.diffNow().as('days') < -1 ? DateTime.DATETIME_SHORT : DateTime.TIME_SIMPLE
						)}
					</div>
				</div>
			{/if}
			<div class="select-text">
				{item.content}
			</div>
		</div>
	</div>
{/if}
