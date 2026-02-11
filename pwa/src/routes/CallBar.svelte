<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import MainMenu from '$lib/components/MainMenu.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';

	let { clientHeight = $bindable() }: { clientHeight?: number } = $props();
</script>

<div
	bind:clientHeight
	class="flex w-full justify-start fl-gap-0.5/1 bg-neutral px-1.5 text-neutral-content sm:flex-row-reverse"
>
	<ScrollArea class="grow overflow-hidden" orientation="horizontal">
		<div class="flex">
			<Button color="neutral">call info</Button>
		</div>
	</ScrollArea>

	<MainMenu />
</div>
