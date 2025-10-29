<script lang="ts">
	import { sunburn } from '$lib/sunburn.svelte';

	import MainBarAuth from './MainBar_Auth.svelte';
	import MainBarLogoButton from './MainBar_LogoButton.svelte';

	const { kbarModal }: { kbarModal: HTMLDialogElement | null } = $props();
</script>

<div
	class="bg-base-100 border-base-content/50 max-w-dvw flex min-h-10 w-dvw flex-none items-center gap-2 overflow-auto border-t shadow-md"
	style="scrollbar-width:thin;"
>
	<MainBarLogoButton {kbarModal} />
	<div class="mr-2 flex gap-2">
		{#each Object.keys(sunburn.auths) as authKey (authKey)}
			<MainBarAuth {authKey} />
		{/each}
	</div>
</div>
