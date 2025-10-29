<script lang="ts">
	import ServerView from '$lib/components/ServerView.svelte';

	import WindowBase from './WindowBase.svelte';

	const { windowID, owner, server }: { windowID: string; owner: string; server: string } = $props();
</script>

<WindowBase slim>
	<ServerView {windowID} {owner} {server} />
</WindowBase>
