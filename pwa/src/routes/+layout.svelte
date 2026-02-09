<script lang="ts">
	import './layout.css';
	import './katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { themeChange } from 'theme-change';

	import { applicationStart } from '$lib/sunburn/applicationStart';

	import CallBar from './CallBar.svelte';

	let { children } = $props();

	themeChange(false);
	applicationStart();
</script>

<svelte:head><link rel="icon" href="/favicon.ico" /></svelte:head>

<div
	class="flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden bg-base-300 fl-text-sm/base"
	style="overscroll-behavior:contain;"
>
	<div class="grow">
		{@render children()}
	</div>
	<CallBar />
</div>
