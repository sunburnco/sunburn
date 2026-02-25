<script lang="ts">
	const { children } = $props();
</script>

<div
	class="flex size-full items-center justify-center overflow-y-auto bg-base-300 text-base-content"
>
	<div class="max-h-full overflow-y-auto">
		<div class="mx-auto w-xl max-w-11/12">
			{@render children()}
		</div>
	</div>
</div>
