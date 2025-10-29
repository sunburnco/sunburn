<script lang="ts">
	import { onMount } from 'svelte';

	import MainBar from '$lib/components/MainBar.svelte';
	import GlobalShortcuts from '$lib/GlobalShortcuts.svelte';
	import KBar from '$lib/kbar/KBar.svelte';
	import WindowArea from '$lib/rnd/WindowArea.svelte';
	import { applicationStart } from '$lib/sunburn/applicationStart';

	let modal = $state<HTMLDialogElement | null>(null);

	onMount(applicationStart);
</script>

<svelte:head>
	<title>Sunburn</title>
</svelte:head>

<div class="relative flex h-dvh max-h-dvh w-dvw flex-col items-stretch">
	<GlobalShortcuts />
	<KBar bind:modal />
	<WindowArea />
	<MainBar kbarModal={modal} />
</div>
