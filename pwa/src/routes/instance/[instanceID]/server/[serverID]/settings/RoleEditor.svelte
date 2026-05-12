<script lang="ts">
	import {
		LucideCheck,
		LucideChevronDown,
		LucideChevronUp,
		LucidePencil,
		LucideTrash,
		LucideX,
	} from '@lucide/svelte';

	import type { Role_t } from '$lib/sunburn/sunburn.svelte';

	const DOWN = -1;
	const UP = 1;

	const {
		role,
		rename,
		color,
		ordinal,
		del,
		atTop,
		atBottom,
	}: {
		role?: Role_t['record'];
		rename: (roleID: Role_t['record']['id'], value: string) => void;
		color: (roleID: Role_t['record']['id'], value: string) => void;
		ordinal: (roleID: Role_t['record']['id'], dir: typeof DOWN | typeof UP) => void;
		del: (roleID: Role_t['record']['id']) => void;
		atTop?: boolean;
		atBottom?: boolean;
	} = $props();

	let roleName = $derived(role?.name || '');
	let roleColor = $derived(role?.color || '');

	let editing = $state(false);

	const onSave = () => {
		if (!role) {
			return;
		}

		const _name = roleName;
		const _color = roleColor;

		rename(role.id, _name);
		color(role.id, _color);
		editing = false;
	};
</script>

{#if role}
	{#if !editing}
		<div
			ondblclick={() => {
				editing = true;
			}}
			class="group flex w-full flex-row justify-between gap-1 active:bg-inherit active:text-current"
		>
			<div
				class="size-4 rounded-box border border-base-content/50"
				style:background-color={roleColor}
			></div>
			<div class="grow">{roleName}</div>
			<button
				title="Move up"
				type="button"
				class="btn hidden btn-square btn-ghost btn-sm group-hover:inline-flex"
				disabled={atTop}
				onclick={() => ordinal(role.id, UP)}
			>
				<LucideChevronUp class="size-4" />
			</button>
			<button
				title="Move down"
				type="button"
				class="btn hidden btn-square btn-ghost btn-sm group-hover:inline-flex"
				disabled={atBottom}
				onclick={() => ordinal(role.id, DOWN)}
			>
				<LucideChevronDown class="size-4" />
			</button>
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
			<button
				title="Move up"
				type="button"
				class="btn btn-square btn-ghost btn-sm"
				disabled={atTop}
				onclick={() => ordinal(role.id, UP)}
			>
				<LucideChevronUp class="size-4" />
			</button>
			<button
				title="Move down"
				type="button"
				class="btn btn-square btn-ghost btn-sm"
				disabled={atBottom}
				onclick={() => ordinal(role.id, DOWN)}
			>
				<LucideChevronDown class="size-4" />
			</button>
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
{/if}
