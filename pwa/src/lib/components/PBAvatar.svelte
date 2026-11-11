<script lang="ts">
	import { LucideCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { XOR } from 'ts-xor';

	import type { ServersRecord } from '#lib/pb-types.ts';
	import { fetchUser } from '#lib/sunburn/data/users.ts';
	import { sunburn } from '#lib/sunburn/sunburn.svelte.ts';
	import { parseInitials } from '#lib/utils/parseInitials.ts';

	type AvatarSize_t = 'sm' | 'md' | 'lg' | 'xl' | 'msg' | 'grow' | 'full';
	type AvatarColor_t =
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

	type CommonProps_t = {
		size?: AvatarSize_t;
		color?: AvatarColor_t;
		className?: string;
		imgClassName?: string;
		fallbackClassName?: string;
	};

	type ServerAvatarForInviteProps_t = {
		server?: ServersRecord;
	} & CommonProps_t;

	type ServerAvatarProps_t = {
		instanceID: string;
		serverID: string;
		size?: AvatarSize_t;
		color?: AvatarColor_t;
	} & CommonProps_t;

	type UserAvatarProps_t = {
		instanceID: string;
		userID: string;
		overrideName?: string;
		size?: AvatarSize_t;
		color?: AvatarColor_t;
	} & CommonProps_t;

	type _NewProps_t = XOR<ServerAvatarForInviteProps_t, ServerAvatarProps_t, UserAvatarProps_t>;

	type Props_t = {
		instanceID: string;
		userID?: string;
		serverID?: string;
		url?: string;
		name: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'msg' | 'grow' | 'full';
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
		className?: string;
		imgClassName?: string;
		fallbackClassName?: string;
		// use this prop when rendering invites, since the server isn't loaded yet
		server?: ServersRecord;
		noPresence?: boolean;
	};

	const {
		instanceID,
		userID,
		serverID,
		url,
		name,
		size = 'md',
		color = 'base-100',
		className,
		imgClassName,
		fallbackClassName,
		server,
		noPresence,
	}: Props_t = $props();

	onMount(() => {
		if (userID && !(userID in sunburn[instanceID].users)) {
			fetchUser(instanceID, userID, null);
		}
		// no need to fetch server because server icons are always loaded
	});

	let imgLoaded = $derived(!!url);
</script>

<div
	class={[
		size === 'sm' && 'size-5 text-xs',
		size === 'md' && 'size-6 text-sm',
		size === 'lg' && 'size-7 text-base',
		size === 'xl' && 'size-8 text-lg',
		size === 'msg' && 'size-9 gap-2 text-xl',
		size === 'grow' && 'grow text-xl',
		size === 'full' && 'size-full text-xl',

		'relative',

		className,
	]}
>
	<div
		class={[
			'grid aspect-square grid-cols-1 grid-rows-1 items-center justify-center overflow-hidden rounded-box font-bold select-none',
			userID && !noPresence && 'clip-presence',
		]}
	>
		{#if instanceID in sunburn && url && (userID || serverID || server)}
			<img
				onload={() => (imgLoaded = true)}
				src={sunburn[instanceID].pb.buildURL(
					`/api/files/${userID ? `users/${userID}` : `servers/${server ? server.id : serverID}`}/${url}`,
				)}
				alt={name}
				class={['col-start-1 row-start-1 size-full bg-transparent object-cover', imgClassName]}
			/>
		{/if}

		{#if !imgLoaded}
			<p
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

					'flex size-full items-center justify-center',
					'col-start-1 row-start-1',
					// 'transition-colors duration-700 ease-linear',

					fallbackClassName,
				]}
			>
				{parseInitials(server ? server.name : name)}
			</p>
		{/if}
	</div>

	{#if userID && !noPresence}
		<span class={['absolute right-0 bottom-0 size-9/20', 'translate-1/4']} title="user is online">
			<LucideCircle class={['size-full stroke-2', 'fill-warning stroke-base-content']} />
		</span>
	{/if}
</div>

<style>
	.clip-presence {
		clip-path: shape(
			from 0% 0%,
			hline to 100%,
			vline to 67%,
			arc to 67% 100% of 24.2%,
			hline to 0%,
			vline to 0%
		);
	}
</style>
