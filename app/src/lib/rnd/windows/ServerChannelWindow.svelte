<script lang="ts">
	import ServerChannelView from '$lib/components/ServerChannelView.svelte';

	import WindowBase from './WindowBase.svelte';

	const {
		windowID: _windowID,
		owner,
		channel
	}: { windowID: string; owner: string; channel: string } = $props();
</script>

<WindowBase slim>
	<ServerChannelView {owner} {channel} />
</WindowBase>
