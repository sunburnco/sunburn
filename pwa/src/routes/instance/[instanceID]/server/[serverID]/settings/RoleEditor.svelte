<script lang="ts">
	import { LucideCheck, LucidePencil, LucideTrash, LucideX } from '@lucide/svelte';

	import type { Role_t } from '$lib/sunburn/sunburn.svelte';

	const {
		role,
		rename,
		color,
		ordinal,
		del,
		dirty,
	}: {
		role?: Role_t['record'];
		rename: (roleID: Role_t['record']['id'], value: string) => void;
		color: (roleID: Role_t['record']['id'], value: string) => void;
		ordinal: (roleID: Role_t['record']['id'], value: number) => void;
		del: (roleID: Role_t['record']['id']) => void;
		dirty: boolean;
	} = $props();

	let roleName = $derived(role?.name || '');
	let roleColor = $derived(role?.color || '');
	let roleOrdinal = $derived(role?.ordinal || 0);

	let editing = $state(false);

	const onSave = () => {
		if (!role) {
			return;
		}

		const _name = roleName;
		const _color = roleColor;
		const _ordinal = roleOrdinal;

		rename(role.id, _name);
		color(role.id, _color);
		ordinal(role.id, _ordinal);
		editing = false;
	};
</script>

{#if role}
	<li>
		{#if !editing}
			<div
				ondblclick={() => {
					editing = true;
				}}
				class={[
					'flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current',
					dirty && 'italic',
				]}
			>
				<div
					class="size-4 rounded-box border border-base-content/50"
					style:background-color={roleColor}
				></div>
				<div class="grow">{roleName}</div>
				<button
					title="Edit"
					class="btn btn-square btn-sm"
					onclick={() => {
						editing = true;
					}}
				>
					<LucidePencil class="size-4" />
				</button>
				<button title="Delete" class="btn btn-square btn-sm btn-error" onclick={() => del(role.id)}>
					<LucideTrash class="size-4" />
				</button>
			</div>
		{:else}
			<form
				class="flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current"
				onsubmit={(e) => {
					e.preventDefault();
					onSave();
				}}
			>
				<input
					type="color"
					title="Role Color"
					bind:value={roleColor}
					class="input input-sm aspect-square w-min px-0.5 py-0"
				/>
				<input title="Role Name" bind:value={roleName} class="input input-sm grow" />
				<button title="Save" type="submit" class="btn btn-square btn-sm btn-primary">
					<LucideCheck class="size-4" />
				</button>
				<button
					title="Revert"
					type="reset"
					onclick={() => {
						editing = false;
						roleName = role.name;
						roleColor = role.color || '#000000';
						// no ordinal because ordinal is managed by drag and drop
						rename(role.id, role.name);
						color(role.id, role.color || '#000000');
					}}
					class="btn btn-square btn-outline btn-sm"
				>
					<LucideX class="size-4" />
				</button>
			</form>
		{/if}
	</li>
{/if}
