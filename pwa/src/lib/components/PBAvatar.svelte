<script lang="ts">
	import { Avatar } from 'bits-ui';

	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { parseInitials } from '$lib/utils/parseInitials';

	type Props_t = {
		instanceID: string;
		userID?: string;
		serverID?: string;
		url?: string;
		name: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		color?:
			| 'base-100'
			| 'base-200'
			| 'base-300'
			| 'neutral'
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'info'
			| 'success'
			| 'warning'
			| 'error';
		imgClassName?: string;
	};

	const {
		instanceID,
		userID,
		serverID,
		url,
		name,
		size = 'md',
		color = 'base-100',
		imgClassName,
	}: Props_t = $props();
</script>

<Avatar.Root>
	<div
		class={[
			color === 'base-100' && 'bg-base-content text-base-100',
			color === 'base-200' && 'bg-base-content text-base-200',
			color === 'base-300' && 'bg-base-content text-base-300',
			color === 'neutral' && 'bg-neutral-content text-neutral',
			color === 'primary' && 'bg-primary-content text-primary',
			color === 'secondary' && 'bg-secondary-content text-secondary',
			color === 'accent' && 'bg-accent-content text-accent',
			color === 'info' && 'bg-info-content text-info',
			color === 'success' && 'bg-success-content text-success',
			color === 'warning' && 'bg-warning-content text-warning',
			color === 'error' && 'bg-error-content text-error',

			size === 'sm' && 'fl-size-[4.5/5.5] fl-gap-[0.25/0.5]',
			size === 'md' && 'fl-size-[5.5/6.5] fl-gap-[0.5/0.75]',
			size === 'lg' && 'fl-size-[6/7.5] fl-gap-[0.75/1.25]',

			'flex aspect-square items-center justify-center overflow-hidden rounded-box font-bold',
		]}
	>
		{#if instanceID in sunburn && url && (userID || serverID)}
			<Avatar.Image
				src={sunburn[instanceID].pb.buildURL(
					`/api/files/${userID ? `users/${userID}` : `servers/${serverID}`}/${url}`,
				)}
				alt={name}
				class={imgClassName}
			/>
		{/if}
		<Avatar.Fallback class="text-center fl-text-xs/sm">{parseInitials(name)}</Avatar.Fallback>
	</div>
</Avatar.Root>
