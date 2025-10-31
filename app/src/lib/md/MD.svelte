<script lang="ts">
	import { onMount } from 'svelte';

	import { messageToHTML } from './messageToHTML';

	const { text }: { text: string } = $props();
	let output = $state('');

	onMount(async () => {
		output = await messageToHTML(text);
		// eslint-disable-next-line no-console
		console.log(output);
	});
</script>
