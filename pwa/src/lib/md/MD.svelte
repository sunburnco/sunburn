<script lang="ts">
	import { messageToHTML } from './messageToHTML';

	const { text }: { text: string } = $props();
	let output = $state('');

	$effect(() => {
		messageToHTML(text).then((res) => {
			output = res;
		});
	});
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html output}
