<script lang="ts">
	import { onMount } from 'svelte';

	import { sunburn } from '$lib/sunburn.svelte';
	import { loadVoiceSettings } from '$lib/sunburn/voiceSettings.svelte';
	import { resolveTheme } from '$lib/utils/resolveTheme';

	import RND from './RND.svelte';
	import {
		activeWindowID,
		bringIDToTop,
		closeWindowAndChildren,
		loadRNDWindows,
		rndWindows,
		saveRNDWindows,
		windowAreaDimensions,
		windowExtrema
	} from './rndState.svelte';
	import CallCameraWindow from './windows/CallCameraWindow.svelte';
	import CallScreenShareWindow from './windows/CallScreenShareWindow.svelte';
	import CallWindow from './windows/CallWindow.svelte';
	import ClearCachesWindow from './windows/ClearCachesWindow.svelte';
	import CreateServerWindow from './windows/CreateServerWindow.svelte';
	import DMWindow from './windows/DMWindow.svelte';
	import LoginWindow from './windows/LoginWindow.svelte';
	import LogoutWindow from './windows/LogoutWindow.svelte';
	import MultiDMWindow from './windows/MultiDMWindow.svelte';
	import PlaygroundWindow from './windows/PlaygroundWindow.svelte';
	import ServerChannelWindow from './windows/ServerChannelWindow.svelte';
	import ServerPickerWindow from './windows/ServerPickerWindow.svelte';
	import ServerWindow from './windows/ServerWindow.svelte';
	import WelcomeWindow from './windows/WelcomeWindow.svelte';

	const wins = $derived(Object.values(rndWindows));

	onMount(() => {
		loadRNDWindows();
		loadVoiceSettings();
	});
</script>

<div
	bind:clientWidth={windowAreaDimensions.w}
	bind:clientHeight={windowAreaDimensions.h}
	class="dots-300 relative grow select-none overflow-hidden"
	style="box-shadow: inset 0 0 6rem rgb(0 0 0 / 0.2);"
>
	{#each wins as win (win.id)}
		<RND
			parentWidth={windowAreaDimensions.w}
			parentHeight={windowAreaDimensions.h}
			bind:activeID={activeWindowID.id}
			id={win.id}
			bind:locked={rndWindows[win.id].locked}
			onactive={() => {
				bringIDToTop(win.id);
				saveRNDWindows();
			}}
			onclose={() => {
				closeWindowAndChildren(win.id);
				saveRNDWindows();
			}}
			onsave={() => saveRNDWindows()}
			sizeMinW={windowExtrema[win.data.t].minW}
			bind:w={rndWindows[win.id].w}
			sizeMaxW={windowExtrema[win.data.t].maxW}
			sizeMinH={windowExtrema[win.data.t].minH}
			bind:h={rndWindows[win.id].h}
			sizeMaxH={windowExtrema[win.data.t].maxH}
			theme={resolveTheme(win.id)}
			title={win.title}
			bind:x={rndWindows[win.id].x}
			bind:y={rndWindows[win.id].y}
			z={win.z}
		>
			{#if win.data.t === 'welcome'}
				<WelcomeWindow />
			{:else if win.data.t === 'login'}
				<LoginWindow windowID={win.id} />
			{:else if win.data.t === 'logout'}
				<LogoutWindow windowID={win.id} owner={win.data.owner} />
			{:else if win.data.t === 'clearCaches'}
				<ClearCachesWindow windowID={win.id} />
			{:else if win.data.t === 'playground'}
				<PlaygroundWindow owner="" windowID={win.id} />
			{:else if win.data.t === 'dm'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<DMWindow windowID={win.id} owner={win.data.owner} recipient={win.data.recipient} />
				{/if}
			{:else if win.data.t === 'multiDM'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<MultiDMWindow
						windowID={win.id}
						owner={win.data.owner}
						activeThread={win.data.activeRecipient}
					/>
				{/if}
			{:else if win.data.t === 'createServer'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<CreateServerWindow owner={win.data.owner} windowID={win.id} />
				{/if}
			{:else if win.data.t === 'server'}
				{#if sunburn.readyClients.has(win.data.owner) && win.data.server in sunburn.servers}
					<ServerWindow owner={win.data.owner} server={win.data.server} windowID={win.id} />
				{/if}
			{:else if win.data.t === 'serverChannel'}
				{#if sunburn.readyClients.has(win.data.owner) && win.data.channel in sunburn.channels}
					<ServerChannelWindow
						owner={win.data.owner}
						channel={win.data.channel}
						windowID={win.id}
					/>
				{/if}
			{:else if win.data.t === 'serverPicker'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<ServerPickerWindow owner={win.data.owner} windowID={win.id} />
				{/if}
			{:else if win.data.t === 'call'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<CallWindow owner={win.data.owner} channel={win.data.channel} windowID={win.id} />
				{/if}
			{:else if win.data.t === 'callCamera'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<CallCameraWindow
						owner={win.data.owner}
						channel={win.data.channel}
						windowID={win.id}
						user={win.data.user}
					/>
				{/if}
			{:else if win.data.t === 'callScreenShare'}
				{#if sunburn.readyClients.has(win.data.owner)}
					<CallScreenShareWindow
						owner={win.data.owner}
						channel={win.data.channel}
						windowID={win.id}
						user={win.data.user}
					/>
				{/if}
			{/if}
		</RND>
	{/each}
</div>
