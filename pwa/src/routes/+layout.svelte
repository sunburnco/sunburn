<script lang="ts">
	import './layout.css';
	import './katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { themeChange } from 'theme-change';

	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import { applicationStart } from '$lib/sunburn/applicationStart';

	import CallBar from './CallBar.svelte';
	import SideBar from './SideBar.svelte';

	let { children } = $props();

	themeChange(false);
	applicationStart();

	let barHeight = $state(0);
	let windowHeight = $state(0);
</script>

<svelte:head><link rel="icon" href="/favicon.ico" /></svelte:head>
<svelte:window bind:innerHeight={windowHeight} />

<!-- TODO use env() and CSS safe areas -->
<div
	class="flex h-dvh max-h-dvh w-full max-w-full flex-col items-stretch justify-center bg-base-300 fl-text-sm/base"
	style="overscroll-behavior:contain;"
>
	<div
		class="flex grow items-stretch sm:flex-row-reverse"
		style={`height:${windowHeight - barHeight}px`}
	>
		<ScrollArea
			color="base-300"
			orientation="vertical"
			class="flex grow items-stretch justify-center overflow-hidden"
			viewportClassName="max-h-full box-border flp-sm"
		>
			{@render children()}
		</ScrollArea>
		<SideBar />
	</div>
	<CallBar bind:clientHeight={barHeight} />
</div>
