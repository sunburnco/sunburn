<script lang="ts">
	import { onMount } from 'svelte';

	import { messageToHTML } from './messageToHTML';

	const { text }: { text: string } = $props();
	let output = $state('');

	onMount(async () => {
		output = await messageToHTML(text);
		console.log(output);
	});
</script>
