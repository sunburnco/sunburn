<script lang="ts">
	import './layout.css';
	import './katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { themeChange } from 'theme-change';

	import { page } from '$app/state';
	import { applicationStart } from '$lib/sunburn/applicationStart';

	import DrawerContents from './DrawerContents.svelte';

	let { children } = $props();

	themeChange(false);
	applicationStart();

	const isChannel = $derived(Boolean(page.params.channelID) || Boolean(page.params.dmID));
</script>

<svelte:head><link rel="icon" href="/favicon.ico" /></svelte:head>

<!-- TODO use env() and CSS safe areas -->
<div class="drawer grow md:drawer-open">
	<input id="rootDrawerInput" type="checkbox" class="drawer-toggle" />
	<div
		class={['drawer-content flex h-dvh flex-col items-center justify-center', !isChannel && 'p-1']}
	>
		{@render children()}
	</div>
	<div class="drawer-side">
		<label for="rootDrawerInput" aria-label="close sidebar" class="drawer-overlay"></label>
		<DrawerContents />
	</div>
</div>

<!-- <label for="rootDrawerInput" class="drawer-button btn md:hidden">Open Drawer</label> -->
