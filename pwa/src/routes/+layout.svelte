<script lang="ts">
	import './layout.css';
	import './katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';

	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		themeChange(false);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
