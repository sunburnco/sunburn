<script lang="ts">
	import ServerIcon from '$lib/components/ServerIcon.svelte';
	import ServerView from '$lib/components/ServerView.svelte';
	import { sunburn } from '$lib/sunburn.svelte';
	import { handleAtHost } from '$lib/utils/username';

	import { rndWindows } from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const { owner, windowID }: { owner: string; windowID: string } = $props();

	let activeServer = $state('');

	const onServer = (server: string) => {
		activeServer = server;
		rndWindows[windowID].title = `${sunburn.servers[server].name} (${handleAtHost(owner, owner)})`;
	};
</script>

<WindowBase slim>
	<div class="flex h-full grow items-stretch">
		<div
			class="flex w-19 min-w-19 flex-col overflow-x-visible overflow-y-auto border-e border-base-content/50 bg-base-100 p-2"
		>
			{#each sunburn.visibleServers[owner].values() as server (server)}
				<button
					class={[
						'btn min-h-fit p-2 btn-ghost',
						activeServer === server && 'btn-active btn-neutral'
					]}
					onclick={() => onServer(server)}
				>
					<!-- // TODO add tooltip for server name -->
					<div class="size-10">
						<ServerIcon client={owner} {server} />
					</div>
				</button>
			{/each}
		</div>
		<div class="grow">
			{#if activeServer}
				<ServerView {owner} server={activeServer} {windowID} />
			{/if}
		</div>
	</div>
</WindowBase>
