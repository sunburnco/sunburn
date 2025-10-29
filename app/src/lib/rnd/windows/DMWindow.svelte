<script lang="ts">
	import DMView from '$lib/components/DMView.svelte';

	import WindowBase from './WindowBase.svelte';

	const {
		windowID: _windowID,
		owner,
		recipient
	}: { windowID: string; owner: string; recipient: string } = $props();
</script>

<WindowBase slim>
	<DMView {owner} {recipient} />
</WindowBase>
