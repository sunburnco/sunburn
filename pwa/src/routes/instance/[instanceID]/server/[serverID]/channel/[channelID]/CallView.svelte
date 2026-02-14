<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { ConnectionState, Room, setLogLevel } from 'livekit-client';
	import { DateTime } from 'luxon';
	import { onDestroy, onMount } from 'svelte';

	import { page } from '$app/state';
	import { call } from '$lib/sunburn/call.svelte';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { connect } from '$lib/utils/call/connect';
	import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');
	const channelID = $derived(page.params.channelID || '');

	onMount(async () => {
		try {
			call.room = new Room();
			setLogLevel('silent');

			if (!call.roomToken || call.roomTokenValidUntil.diffNow().as('seconds') < 0) {
				const resp = await sunburn[instanceID].pb.send<{
					token: string;
					expirationUnix: number;
					baseURL: string;
				}>(`/lk/${channelID}/token`, { method: 'POST', requestKey: null });
				call.roomToken = resp.token;
				call.roomTokenValidUntil = DateTime.fromMillis(
					resp.expirationUnix * 1000,
				) as DateTime<true>;
				call.lkBaseURL = resp.baseURL;
			}

			call.room.prepareConnection(call.lkBaseURL, call.roomToken);

			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				logFriendly(instanceID),
				'preparing call for channel',
				channelID,
			);

			// TODO local setting to allow instant connect
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'error fetching token for channel',
				channelID,
				'\n',
				err,
			);
		}
	});

	onDestroy(() => {
		call.room?.disconnect();
	});
</script>

<div class="size-full max-h-full bg-black">
	{#if call.roomState === ConnectionState.Disconnected}
		<div class="flex size-full flex-col items-center justify-center">
			<div
				class="flex flex-col items-center justify-center gap-2 rounded-box bg-base-300 p-4 text-base-content"
			>
				<div class="font-display text-lg font-bold">Disconnected</div>
				<button
					class="btn btn-primary"
					onclick={() => {
						if (!call.roomToken) {
							return;
						}

						call.instanceID = instanceID;
						call.serverID = serverID;
						call.channelID = channelID;
						connect();
					}}
				>
					Connect
				</button>
			</div>
		</div>
	{:else if call.roomState === ConnectionState.Connecting || call.roomState === ConnectionState.Reconnecting || call.roomState === ConnectionState.SignalReconnecting}
		<div class="flex size-full items-center justify-center">
			<div
				class="flex items-center justify-center gap-2 rounded-box bg-base-300 p-4 font-display text-lg font-bold text-base-content"
			>
				Connecting <LucideLoaderCircle class="size-5 animate-spin" />
			</div>
		</div>
	{:else if call.roomState === ConnectionState.Connected}
		<div class="flex w-full flex-col items-stretch">
			<div class="max-size-full flex size-full grow items-center justify-center">content area</div>
			<div class="max-w-full overflow-x-auto">call participants</div>
		</div>
	{/if}
</div>
