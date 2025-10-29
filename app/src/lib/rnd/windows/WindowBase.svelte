<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, slim }: { children: Snippet; slim?: boolean } = $props();
</script>

<div class={['flex min-h-0 min-w-0 grow items-center justify-center', !slim && 'p-3']}>
	{@render children()}
</div>
