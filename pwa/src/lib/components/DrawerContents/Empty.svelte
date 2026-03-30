<script>
	import { LucideCookingPot, LucidePartyPopper, LucideSun, LucideVolleyball } from '@lucide/svelte';

	const NUM_CHOICES = 3;
	let option = $derived(Math.floor(Math.random() * NUM_CHOICES));
</script>

<div class="flex flex-col items-center gap-1 p-4 text-sm opacity-50 select-none">
	{#if option === 0}
		<LucideCookingPot class="size-6" />
		<p>What&apos;s cookin&apos;, good lookin&apos;?</p>
	{:else if option === 1}
		<div class="flex gap-1">
			<LucideSun class="size-6" />
			<LucideVolleyball class="size-6" />
		</div>
		<p>Remember to use sunscreen!</p>
	{:else if option === 2}
		<LucidePartyPopper class="size-6" />
		<p>Yippee!</p>
	{/if}
</div>
