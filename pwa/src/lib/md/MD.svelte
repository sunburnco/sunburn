<script lang="ts">
	import { messageToHTML } from './messageToHTML';

	const { text }: { text: string } = $props();

	let outputPromise = $derived(messageToHTML(text));
</script>

{#await outputPromise then output}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html output}
{/await}
