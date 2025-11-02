<script lang="ts">
	import {
		LucideGripVertical,
		LucideHash,
		LucidePictureInPicture,
		LucideStar,
		LucideVolume2
	} from '@lucide/svelte';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	import { errorPrefix } from '$lib/logPrefixes';
	import type { PinnedServersRecord } from '$lib/pb-types';
	import { rndWindows } from '$lib/rnd/rndState.svelte';
	import { spawnCallWindow } from '$lib/rnd/spawn/spawnCallWindow';
	import { spawnServerChannelWindow } from '$lib/rnd/spawn/spawnServerChannelWindow';
	import { sunburn } from '$lib/sunburn.svelte';
	import { fetchChannel } from '$lib/sunburn/channels';
	import { fetchInitialMessagesForChannel } from '$lib/sunburn/messages';
	import { logFriendly, nameOrHandle } from '$lib/utils/username';

	import Avatar from './Avatar.svelte';
	import ServerChannelView from './ServerChannelView.svelte';
	import ServerIcon from './ServerIcon.svelte';

	let {
		windowID,
		owner,
		server
	}: {
		windowID: string;
		owner: string;
		server: string;
	} = $props();

	let wasLocked = $state(false);
	let activeChannel = $state('');

	$effect(() => {
		if (!activeChannel) {
			return;
		}

		fetchInitialMessagesForChannel(sunburn.clients[owner], activeChannel);
	});

	$effect(() => {
		const _ = server;
		activeChannel = '';
	});

	const serverChannels = $derived.by(() => {
		if (!(server in sunburn.serverChannels)) {
			return [];
		}

		const channels = Array.from(sunburn.serverChannels[server]).map((id) => ({
			id,
			record: sunburn.channels[id]
		}));
		for (const channel of channels) {
			if (typeof channel.record === 'undefined') {
				fetchChannel(sunburn.clients[owner], channel.id);
			}
		}

		return (
			channels
				// TODO add ordinals
				.sort((a, b) => (a.record.name ?? '').localeCompare(b.record.name ?? ''))
				.map((c) => c.id)
		);
	});

	const iconSize = '0.75rem';

	const togglePin = async () => {
		try {
			if (sunburn.pinnedServers[owner]?.has(server)) {
				sunburn.pinnedServers[owner]?.delete(server);

				const record = (await sunburn.clients[owner]
					.collection('pinnedServers')
					.getFirstListItem(
						sunburn.clients[owner].filter('server = {:server}', { server })
					)) as PinnedServersRecord;

				if (record.id) {
					await sunburn.clients[owner].collection('pinnedServers').delete(record.id);
				}
			} else {
				sunburn.pinnedServers[owner]?.add(server);

				await sunburn.clients[owner].collection('pinnedServers').create({ user: owner, server });
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, logFriendly(owner), 'error pinning server', server, '\n', err);
		}
	};
</script>

{#if sunburn.visibleServers[owner].has(server)}
	<PaneGroup autoSaveId={windowID} direction="horizontal">
		<Pane defaultSize={30} class="flex min-w-16 overflow-visible bg-base-200">
			<div class="flex w-full flex-col overflow-x-hidden overflow-y-auto">
				<div class="flex justify-between">
					<div class="flex items-center gap-3 p-5">
						<div class="size-8 min-h-0 min-w-0">
							<ServerIcon client={owner} {server} />
						</div>
						<div class="font-bold">
							{sunburn.servers[server].name}
						</div>
					</div>
					<div class="flex items-center gap-1 p-2">
						<button title="Favorite" onclick={togglePin} class="btn btn-square btn-ghost btn-sm">
							<LucideStar
								size="1rem"
								class={sunburn.pinnedServers[owner]?.has(server) ? 'fill-neutral' : 'fill-none'}
							/>
						</button>
					</div>
				</div>
				<ul class="menu w-full grow flex-nowrap overflow-x-hidden overflow-y-auto">
					<li class="menu-title">Channels</li>
					{#each serverChannels as channel (channel)}
						<li>
							<button
								class={[
									activeChannel === channel && 'menu-active',
									// TODO bold when unread
									'font-normal'
								]}
								onclick={() => {
									if (sunburn.channels[channel].voice) {
										spawnCallWindow(owner, channel, windowID);
									} else {
										activeChannel = channel;
									}
								}}
							>
								{#if sunburn.channels[channel].voice}
									<LucideVolume2 size={iconSize} class="shrink-0" />
								{:else}
									<LucideHash size={iconSize} class="shrink-0" />
								{/if}
								{sunburn.channels[channel].name}
							</button>
							{#if sunburn.channels[channel].voice}
								<ul>
									{#each sunburn.channelVoiceParticipants[channel].values() as participant (participant)}
										<li>
											<div class="flex flex-nowrap text-sm whitespace-nowrap text-base-content/80">
												<div class="size-5 max-w-5 min-w-5">
													<Avatar client={owner} user={participant} textSize="sm" />
												</div>
												{nameOrHandle(participant)}
											</div>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
				<div class="flex justify-start ps-2 pb-2">
					<button
						class="btn btn-square btn-ghost btn-sm"
						disabled={!activeChannel}
						title="Pop out active channel"
						onclick={() =>
							spawnServerChannelWindow(owner, activeChannel, {
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
			class="flex w-3 items-center justify-center border-e border-base-content/50 bg-base-200 text-base-content hover:bg-base-100"
		>
			<LucideGripVertical />
		</PaneResizer>
		<Pane defaultSize={70}>
			<ServerChannelView {owner} channel={activeChannel} />
		</Pane>
	</PaneGroup>
{/if}
