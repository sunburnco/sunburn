<script lang="ts">
	import { LucideCheck, LucideCopy, LucideTrash, LucideUserPlus } from '@lucide/svelte';

	import { page } from '$app/state';
	import type { InvitesRecord } from '$lib/pb-types';

	let copied = $state(false);

	const {
		invite,
		pendingDelete,
		del,
	}: {
		invite: InvitesRecord;
		pendingDelete: boolean;
		del: (inviteID: string) => void;
	} = $props();

	const instanceID = $derived(page.params.instanceID || '');
</script>

<li class={pendingDelete ? 'italic line-through' : ''}>
	<div class="flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current">
		<LucideUserPlus class="inline size-4" />
		<p class="grow">{invite.id}</p>
		<button
			title="Copy"
			class="btn btn-square btn-sm"
			onclick={() => {
				copied = true;
				setTimeout(() => (copied = false), 450);
				navigator.clipboard.writeText(`${instanceID}/${invite.id}`);
			}}
		>
			{#if !copied}
				<LucideCopy class="size-4" />
			{:else}
				<LucideCheck class="size-4" />
			{/if}
		</button>
		<button title="Delete" class="btn btn-square btn-sm btn-error" onclick={() => del(invite.id)}>
			<LucideTrash class="size-4" />
		</button>
	</div>
</li>
