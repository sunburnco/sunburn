<script lang="ts">
	import { localSettings } from '$lib/sunburn/localSettings.svelte';
</script>

<header class="p-4 pb-0">
	<h1 class="font-display text-xl font-bold">Sections</h1>
</header>
<ul class="menu w-full pt-0">
	<li>
		<a href="#accounts">Accounts</a>
	</li>
	{#each Object.keys(localSettings) as section (section)}
		{#if !section.startsWith('_')}
			<li>
				<a href={`#${section}`}>{localSettings[section as keyof typeof localSettings].name}</a>
			</li>
		{/if}
	{/each}
</ul>
