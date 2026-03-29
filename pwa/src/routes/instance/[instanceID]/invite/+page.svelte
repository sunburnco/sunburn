<script lang="ts">
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { drawerState } from '$lib/drawerState.svelte';

	onMount(() => {
		drawerState.activeChannelID = '';
		drawerState.activeDMID = '';
		drawerState.activeInstanceID = '';
		drawerState.activeServerID = 'new';
		goto('/new');
	});
</script>
