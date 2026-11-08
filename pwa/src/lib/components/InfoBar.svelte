<script lang="ts">
	import type { Snippet } from 'svelte';

	import { localSettings } from '#lib/sunburn/localSettings.svelte.ts';

	type Props_t = {
		children: Snippet;
		title: Snippet;
	};
	const { children, title }: Props_t = $props();
</script>

<div
	class={[
		'flex size-full items-stretch bg-base-300 text-base-content',
		localSettings.appearance.settings.infoBar.stringValue === 'top'
			? 'flex-col'
			: 'flex-col-reverse',
	]}
>
	<header
		class={[
			'flex w-full justify-center border-base-content/50 bg-base-200 p-1 font-bold select-none',
			localSettings.appearance.settings.infoBar.stringValue === 'top' ? 'border-b' : 'border-t',
		]}
	>
		{@render title()}
	</header>
	<content class="relative flex grow items-center justify-center overflow-y-auto">
		<div class="mx-auto max-h-full w-2xl max-w-11/12">
			{@render children()}
		</div>
	</content>
</div>
