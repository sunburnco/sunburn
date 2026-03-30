<script lang="ts">
	import { LucidePackageOpen } from '@lucide/svelte';
	import type { DateTime } from 'luxon';
	import { Debounced } from 'runed';

	import type { UsersRecord, UsersResponse } from '$lib/pb-types';
	import { fetchUser } from '$lib/sunburn/data/users';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { nameOrHandle } from '$lib/utils/username';

	import PBAvatar from '../PBAvatar.svelte';
	import { drawerState } from './drawerState.svelte';

	let dmList = $derived.by(() => {
		if (drawerState.serverID !== 'dms') {
			return [];
		}
		const ret: { dmID: string; instanceID: string; updated: DateTime }[] = [];

		for (const instanceID of Object.keys(sunburn)) {
			if (!sunburn[instanceID].ready) {
				continue;
			}

			for (const dmID of Object.keys(sunburn[instanceID].dms)) {
				ret.push({ dmID, instanceID, updated: sunburn[instanceID].dms[dmID].updated });

				if (!(dmID in sunburn[instanceID].users)) {
					fetchUser(instanceID, dmID, dmID);
				}
			}
		}

		ret.sort((a, b) => b.updated.diff(a.updated).as('seconds'));

		return ret;
	});

	let dmSearch = $state('');
	let debouncedDMSearch = new Debounced(() => dmSearch, 350);
	let searchedUserList = $state<(UsersResponse<UsersRecord> & { instanceID: string })[]>([]);
	// prefer effect over derived to show most recent search while waiting for other searches to complete
	// TODO "stream" responses by immediately pushing to state as soon as a promise resolves
	$effect(() => {
		if (!debouncedDMSearch.current) {
			return;
		}

		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, 'searching for users', debouncedDMSearch.current);

		// functional programming is so wonderful
		// we should remove the async/await API and go back to .then()
		// this is so readable
		// I had so much fun writing ts
		Promise.all(
			Object.keys(sunburn).map((instanceID) =>
				sunburn[instanceID].pb
					.collection('users')
					.getList<UsersResponse<UsersRecord>>(0, 50, {
						filter: sunburn[instanceID].pb.filter(
							'(handle_lowercase ~ {:ss} || name ~ {:ss}) && id != {:id}',
							{
								ss: debouncedDMSearch.current,
								id: sunburn[instanceID].myID,
							},
						),
						requestKey: null,
					})
					.then((res) =>
						res.items.map((i) => {
							return { ...i, instanceID };
						}),
					)
					.catch(() => [] as (UsersResponse<UsersRecord> & { instanceID: string })[]),
			),
		)
			.then((vals) =>
				vals.reduce((prev, curr) => {
					prev.push(...curr);
					return prev;
				}, []),
			)
			.then((reduced) => (searchedUserList = reduced));
	});
</script>

<div class="p-2">
	<input class="input" placeholder="Search for a user..." bind:value={dmSearch} />
</div>

<ul class="menu w-full">
	{#if dmSearch}
		{#each searchedUserList as user (user.id)}
			<li class="rounded-box">
				<a
					href={`/instance/${user.instanceID}/dm/${user.id}`}
					onclick={() => {
						dmSearch = '';
					}}
				>
					<PBAvatar
						color="base-200"
						instanceID={user.instanceID}
						userID={user.id}
						url={user.avatar}
						name={user.name ?? user.handle}
					/>
					<div>
						<p>{nameOrHandle(user.instanceID, user.id, true)}</p>
						<p class="text-xs opacity-60">{user.instanceID}</p>
					</div>
				</a>
			</li>
		{:else}
			<div class="select-none opacity-50 gap-1 w-full flex items-center flex-col">
				<LucidePackageOpen class="size-6" />
				<div class="w-1/2 text-center">Nothing to display</div>
			</div>
		{/each}
	{:else}
		{#each dmList as dm (dm.dmID)}
			{#if dm.dmID in sunburn[dm.instanceID].users}
				<li class={['rounded-box', drawerState.dmID === dm.dmID && 'menu-active']}>
					<a href={`/instance/${dm.instanceID}/dm/${dm.dmID}`}>
						<PBAvatar
							color={drawerState.dmID === dm.dmID ? 'neutral' : 'base-200'}
							instanceID={dm.instanceID}
							userID={dm.dmID}
							url={sunburn[dm.instanceID].users[dm.dmID].avatar}
							name={nameOrHandle(dm.instanceID, dm.dmID)}
						/>
						{nameOrHandle(dm.instanceID, dm.dmID, true)}
					</a>
				</li>
			{/if}
		{:else}
			<div class="select-none opacity-50 gap-1 w-full flex items-center flex-col">
				<LucidePackageOpen class="size-6" />
				<div class="w-1/2 text-center">Nothing to display. Try searching for a user.</div>
			</div>
		{/each}
	{/if}
</ul>
