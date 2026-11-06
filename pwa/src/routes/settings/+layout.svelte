<script lang="ts">
	const { children } = $props();
</script>

<div class="flex size-full flex-col items-stretch bg-base-300 text-base-content">
	<header
		class="flex w-full items-center justify-center border-b border-base-content/50 bg-base-200 p-1 font-bold select-none"
	>
		<p>Local Settings</p>
	</header>
	<content class="relative flex grow items-center justify-center overflow-y-auto">
		<div class="mx-auto max-h-full w-2xl max-w-11/12">
			{@render children()}
		</div>
	</content>
</div>
