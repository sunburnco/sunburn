<script lang="ts">
	import '../app.css';
	import '../katex.css';
	import '@fontsource-variable/quicksand'; // sans
	import '@fontsource/league-mono'; // display
	import '@fontsource/oxygen-mono'; // mono
	import '@fontsource-variable/playwrite-us-trad'; // script

	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';

	onMount(() => {
		themeChange(false);
	});

	let { children } = $props();
</script>

<div class="">
	{@render children()}
</div>
