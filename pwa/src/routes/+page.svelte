<script lang="ts">
	import { setTheme } from '$lib/utils/setTheme';
</script>

{#snippet ThemeChanger(color: string)}
	<div
		class="rounded-box border border-base-content/50 bg-base-300 p-8"
		data-theme={color.toLocaleLowerCase()}
	>
		<button class="btn btn-primary" onclick={() => setTheme(color.toLocaleLowerCase())}>
			{color}
		</button>
	</div>
{/snippet}

<div class="flex flex-col items-center justify-center gap-8">
	<a href="/login">
		<button class="btn btn-primary">Log In</button>
	</a>

	<div class="flex flex-wrap gap-2">
		{#each ['day', 'midnight', 'sunset', 'oasis', 'verdant', 'lilac'] as color (color)}
			{@render ThemeChanger(color)}
		{/each}
	</div>
</div>
