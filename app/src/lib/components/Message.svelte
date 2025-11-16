<script lang="ts">
	import { DateTime } from 'luxon';

	import Avatar from '$lib/components/Avatar.svelte';
	import MD from '$lib/md/MD.svelte';
	import type { MessagesRecord } from '$lib/pb-types';
	import { sunburn } from '$lib/sunburn.svelte';
	import { fetchUser } from '$lib/sunburn/users';
	import { nameOrHandle } from '$lib/utils/username';

	let {
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

	if (!(item.from in sunburn.users)) {
		fetchUser(sunburn.clients[client], item.from, [client, item.from].toString());
	}
</script>

{#if item.from in sunburn.users}
	<div
		class={['flex items-stretch gap-2', 'group px-2 hover:bg-base-200', !cozy && !first && 'mt-2']}
	>
		<div class="flex w-9 min-w-9 items-center select-none">
			{#if first || !cozy}
				<div class="my-1.5 size-9 self-start">
					<Avatar {client} user={item.from} />
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
					<div class="font-bold">{nameOrHandle(item.from)}</div>
					<div class="text-xs font-bold text-nowrap text-base-content/50 select-none">
						{createdAt.toLocaleString(
							createdAt.diffNow().as('days') < -1 ? DateTime.DATETIME_SHORT : DateTime.TIME_SIMPLE
						)}
					</div>
				</div>
			{/if}
			<div class="sb-message select-text">
				<!-- {item.content} -->
				<MD text={item.content} />
			</div>
		</div>
		{#if item.edited}
			<div class="my-1.5 flex items-end">
				<div class="text-xs text-base-content/50" title="Edited">(e)</div>
			</div>
		{/if}
	</div>
{/if}
