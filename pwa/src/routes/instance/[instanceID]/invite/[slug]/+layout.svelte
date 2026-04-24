<script lang="ts">
	const { children } = $props();
</script>

<section class="flex size-full flex-col items-stretch bg-base-300 text-base-content">
	<header
		class="flex w-full items-center justify-center border-b border-base-content/50 bg-base-200 p-1 font-bold select-none"
	>
		<p>Accept Invite</p>
	</header>
	<content class="flex grow items-center justify-center overflow-y-auto">
		<div class="max-h-full overflow-y-auto">
			<div class="mx-auto w-2xl max-w-11/12">
				{@render children()}
			</div>
		</div>
	</content>
</section>
