<script>
	import Button from '$lib/components/Button.svelte';
	import MainMenu from '$lib/components/MainMenu.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import { setTheme } from '$lib/utils/setTheme';
</script>

<div class="flex w-full justify-between fl-gap-0.5/1 bg-neutral fl-px-0.5/1 text-neutral-content">
	<ScrollArea orientation="horizontal">
		<div class="flex">
			<Button color="neutral" onclick={() => setTheme('midnight')}>Midnight</Button>
			<Button color="neutral" onclick={() => setTheme('day')}>Day</Button>
			<Button color="neutral" onclick={() => setTheme('sunset')}>Sunset</Button>
			<Button color="neutral" onclick={() => setTheme('lilac')}>Lilac</Button>
			<Button color="neutral" onclick={() => setTheme('oasis')}>Oasis</Button>
			<Button color="neutral" onclick={() => setTheme('verdant')}>Verdant</Button>
			<Button color="neutral" onclick={() => setTheme('midnight')}>Midnight</Button>
			<Button color="neutral" onclick={() => setTheme('day')}>Day</Button>
			<Button color="neutral" onclick={() => setTheme('sunset')}>Sunset</Button>
			<Button color="neutral" onclick={() => setTheme('lilac')}>Lilac</Button>
			<Button color="neutral" onclick={() => setTheme('oasis')}>Oasis</Button>
			<Button color="neutral" onclick={() => setTheme('verdant')}>Verdant</Button>
			<Button color="neutral" onclick={() => setTheme('midnight')}>Midnight</Button>
			<Button color="neutral" onclick={() => setTheme('day')}>Day</Button>
			<Button color="neutral" onclick={() => setTheme('sunset')}>Sunset</Button>
			<Button color="neutral" onclick={() => setTheme('lilac')}>Lilac</Button>
			<Button color="neutral" onclick={() => setTheme('oasis')}>Oasis</Button>
			<Button color="neutral" onclick={() => setTheme('verdant')}>Verdant</Button>
		</div>
	</ScrollArea>

	<MainMenu />
</div>
