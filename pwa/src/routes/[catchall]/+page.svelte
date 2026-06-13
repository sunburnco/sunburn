<script lang="ts">
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	onMount(() => {
		goto(`/instance/${page.url.host}/invite/${page.params.catchall}`);
	});
</script>
