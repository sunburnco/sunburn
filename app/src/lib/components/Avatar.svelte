<script lang="ts">
	import { fetchUser } from '$lib/sunburn/users';
	import { nameOrHandle } from '$lib/utils/username';

	import { sunburn } from '../sunburn.svelte';

	const {
		client,
		user,
		textSize = 'md'
	}: {
		client: string;
		user: string | undefined;
		textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	} = $props();

	const avatarFilename = $derived(
		user && user in sunburn.users ? sunburn.users[user].record.avatar : undefined
	);
	const avatarURL = $derived(
		user && avatarFilename
			? sunburn.clients[client].files.getURL(sunburn.users[user].record, avatarFilename)
			: undefined
	);

	if (user && !(user in sunburn.users)) {
		fetchUser(sunburn.clients[client], user);
	}
</script>

<div
	role="img"
	class={[
		'flex aspect-square items-center justify-center overflow-hidden rounded-box font-display',
		{ xs: 'text-xs', sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl' }[textSize]
	]}
>
	{#if !user || typeof avatarFilename === 'undefined'}
		<div
			class="flex h-full w-full items-center justify-center rounded-box bg-accent text-accent-content"
		>
			?
		</div>
	{:else if avatarFilename === ''}
		<div
			class="flex h-full w-full items-center justify-center rounded-box bg-accent text-accent-content"
		>
			{nameOrHandle(user)
				.split(' ')
				.map((word) => (word.length > 0 ? word[0] : ''))
				.filter((letter) => letter !== '')
				.reduce((prev, curr) => (prev.length === 2 ? prev : prev + curr), '')}
		</div>
	{:else}
		<img
			src={avatarURL}
			alt={`${sunburn.users[user].record.name}'s profile picture'`}
			class="aspect-square object-cover"
		/>
	{/if}
</div>
