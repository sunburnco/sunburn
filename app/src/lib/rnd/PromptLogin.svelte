<script lang="ts">
	import { spawnLoginWindow } from './spawn/spawnLoginWindow';

	const { windowTitle }: { windowTitle?: string } = $props();

	const handleAtHost = $derived.by(() => {
		const matches = windowTitle?.match(/\((.+)\)/);

		if (matches && matches.length > 0) {
			return matches[1];
		}

		return null;
	});
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-2 p-4">
	<h1 class="font-display text-2xl font-bold">Not Logged In</h1>
	<div>
		The owner of this window
		{#if handleAtHost}
			(possibly <span class="font-display text-sm">{handleAtHost}</span>)
		{/if}
		is not logged in.
		<br />
		Once you log in, this window will automatically refresh.
	</div>
	<button class="btn mt-4 btn-primary" onclick={() => spawnLoginWindow()}>Login</button>
</div>
