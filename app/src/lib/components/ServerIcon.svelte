<script lang="ts">
	import { sunburn } from '../sunburn.svelte';

	const {
		client,
		server,
		textSize = 'md'
	}: {
		client: string;
		server: string | undefined;
		textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	} = $props();

	const avatarFilename = $derived(
		server && server in sunburn.servers ? sunburn.servers[server].icon : undefined
	);
	const avatarURL = $derived(
		server && avatarFilename
			? sunburn.clients[client].files.getURL(sunburn.servers[server], avatarFilename)
			: undefined
	);
</script>

<div
	role="img"
	class={[
		'flex aspect-square items-center justify-center font-display',
		{ xs: 'text-xs', sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl' }[textSize]
	]}
>
	{#if !server || typeof avatarFilename === 'undefined'}
		<div
			class="flex h-full w-full items-center justify-center rounded-box bg-accent text-accent-content"
		>
			?
		</div>
	{:else if avatarFilename === ''}
		<div
			class="flex h-full w-full items-center justify-center rounded-box bg-accent text-accent-content"
		>
			{(sunburn.servers[server].name || '')
				.split(' ')
				.map((word) => (word.length > 0 ? word[0] : ''))
				.filter((letter) => letter !== '')
				.reduce((prev, curr) => (prev.length === 2 ? prev : prev + curr), '')}
		</div>
	{:else}
		<img
			src={avatarURL}
			alt={`${sunburn.servers[server].name}'s icon'`}
			class="aspect-square object-cover"
		/>
	{/if}
</div>
