<script lang="ts">
	import InfoBar from '#lib/components/InfoBar.svelte';

	const { children } = $props();
</script>

<InfoBar>
	{#snippet title()}
		<p>Log In</p>
	{/snippet}
	{@render children()}
</InfoBar>
