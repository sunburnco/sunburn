<script lang="ts">
	import { LucideArrowRight, LucideGripVertical, LucidePictureInPicture } from '@lucide/svelte';
	import createFuzzySearch from '@nozbe/microfuzz';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';
	import { ClientResponseError } from 'pocketbase';

	import Avatar from '$lib/components/Avatar.svelte';
	import DMView from '$lib/components/DMView.svelte';
	import { debugPrefix, errorPrefix } from '$lib/logPrefixes';
	import type { UsersRecord } from '$lib/pb-types';
	import { sunburn } from '$lib/sunburn.svelte';
	import { emptyDM } from '$lib/sunburn/empty';
	import { fetchInitialMessagesForDM } from '$lib/sunburn/messages';
	import { authStoreKey } from '$lib/utils/authStoreKey';
	import { handleAtHost, logFriendly, username, usernamePlusHandle } from '$lib/utils/username';

	import { rndWindows, type TypeMultiDM_t } from '../rndState.svelte';
	import { spawnDMWindow } from '../spawn/spawnDMWindow';
	import WindowBase from './WindowBase.svelte';

	const {
		windowID,
		owner,
		activeThread
	}: {
		windowID: string;
		owner: string;
		activeThread: string;
	} = $props();

	// const recipientName = $derived(
	// 	activeThread && activeThread in sunburn.users ? nameOrHandle(activeThread) : ''
	// );
	// const recipientAddress = $derived(
	// 	activeThread && activeThread in sunburn.users ? handleAtHost(owner, activeThread) : ''
	// );
	const recipientDisplay = $derived(
		activeThread && activeThread in sunburn.users ? usernamePlusHandle(owner, activeThread) : 'DMs'
	);
	$effect(() => {
		if (!(owner in sunburn.users)) {
			return;
		}

		rndWindows[windowID].title =
			`${recipientDisplay || 'DM List'} (${handleAtHost(owner, activeThread)})`;
	});

	const recipients = $derived(
		Object.values(sunburn.dms[owner]).sort((a, b) => b.updated.diff(a.updated).as('seconds'))
	);

	let searchString = $state('');
	const recipientsFuzz = $derived.by(() =>
		createFuzzySearch(recipients, {
			getText: (item: (typeof recipients)[0]) => [
				sunburn.users[item.recipient]?.record.handle ?? null,
				sunburn.users[item.recipient]?.record.name ?? null
			]
		})
	);
	const recipientsList = $derived.by(() => {
		if (!searchString) {
			return recipients;
		} else {
			return recipientsFuzz(searchString).map((res) => res.item);
		}
	});

	const onsubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!(owner in sunburn.clients)) {
			return;
		}

		try {
			const res = (await sunburn.clients[owner].collection('users').getFirstListItem(
				sunburn.clients[owner].filter('handle_lowercase = {:ss}', {
					ss: searchString.toLowerCase()
				})
			)) as UsersRecord;

			if (res.id in sunburn.dms[owner]) {
				return;
			}

			sunburn.dms[owner][res.id] = { ...emptyDM, recipient: res.id };
			await fetchInitialMessagesForDM(sunburn.clients[owner], res.id);
			(rndWindows[windowID].data as TypeMultiDM_t).activeRecipient = res.id;

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, owner, 'starting DM with', res.id);

			searchString = '';
		} catch (err) {
			if (err instanceof ClientResponseError) {
				if (err.status === 404) {
					// eslint-disable-next-line no-console
					console.error(
						...errorPrefix,
						logFriendly(owner),
						'could not find user',
						`${searchString}@${authStoreKey(sunburn.clients[owner].baseURL)}`,
						'\n',
						err
					);
					return;
				}
			}
		}
	};

	let wasLocked = $state(false);
</script>

<WindowBase slim>
	<PaneGroup autoSaveId={windowID} direction="horizontal">
		<Pane defaultSize={30} class="bg-base-200 flex min-w-16 overflow-visible">
			<div class="flex w-full flex-col overflow-y-auto overflow-x-hidden">
				<form class="group mb-2 flex w-full max-w-full overflow-visible px-2 pt-2" {onsubmit}>
					<input
						name="searchbar"
						bind:value={searchString}
						class="input input-sm w-full min-w-0"
						placeholder="Enter a username"
					/>
					<button
						class={[
							'btn btn-sm btn-ghost btn-primary btn-square ms-0 w-0 border-0 transition-[width]',
							'group-focus-within:ms-2 group-focus-within:w-8 group-hover:ms-2 group-hover:w-8'
						]}
					>
						<LucideArrowRight size="1rem" />
					</button>
				</form>
				<ul class="menu w-full grow">
					{#each recipientsList as recipient (recipient.recipient)}
						<li>
							<button
								class={[
									activeThread === recipient.recipient && 'menu-active',
									// TODO bold when unread
									'font-normal'
								]}
								onclick={() => {
									(rndWindows[windowID].data as TypeMultiDM_t).activeRecipient =
										recipient.recipient;
								}}
							>
								<div class="size-9 min-w-9">
									<Avatar client={owner} user={recipient.recipient} />
								</div>
								<div class="flex flex-col items-start">
									<div class="text-nowrap">
										{username(owner, recipient.recipient)}
									</div>
									{#if sunburn.dms[owner][recipient.recipient]?.messages.length > 0}
										<div class="text-nowrap text-xs">
											{#if sunburn.dms[owner][recipient.recipient].messages.at(-1)!.from === owner}
												You:
											{/if}
											{sunburn.dms[owner][recipient.recipient].messages.at(-1)!.content}
										</div>
									{/if}
								</div>
							</button>
						</li>
					{:else}
						<div class="text-base-content/80 ms-2 text-sm px-2">
							{#if searchString}
								<kbd class="kbd kbd-sm">Enter</kbd>
								to DM
								<span class="text-nowrap">
									{searchString}@{authStoreKey(sunburn.clients[owner].baseURL)}
								</span>
							{:else}
								Search for a user to begin
							{/if}
						</div>
					{/each}
				</ul>
				<div class="flex justify-start pb-2 ps-2">
					<button
						class="btn btn-ghost btn-square btn-sm"
						disabled={!activeThread}
						title="Pop out active thread"
						onclick={() =>
							spawnDMWindow(owner, activeThread, {
								x: rndWindows[windowID].x + 32,
								y: rndWindows[windowID].y + 32,
								theme: rndWindows[windowID].theme
							})}
					>
						<LucidePictureInPicture size="1rem" />
					</button>
				</div>
			</div>
		</Pane>
		<PaneResizer
			onpointerdown={() => {
				wasLocked = rndWindows[windowID].locked;
				rndWindows[windowID].locked = true;
			}}
			onpointerup={() => {
				rndWindows[windowID].locked = wasLocked;
			}}
			class="bg-base-200 text-base-content hover:bg-base-100 border-base-content/50 flex w-3 items-center justify-center border-e"
		>
			<LucideGripVertical />
		</PaneResizer>
		<Pane defaultSize={70}>
			<DMView {owner} recipient={activeThread} />
		</Pane>
	</PaneGroup>
</WindowBase>
