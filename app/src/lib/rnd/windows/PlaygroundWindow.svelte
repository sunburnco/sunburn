<script lang="ts">
	import WindowBase from './WindowBase.svelte';

	const { windowID, owner }: { windowID: string; owner: string } = $props();
</script>

<WindowBase>
	{windowID}
	{owner}
</WindowBase>
