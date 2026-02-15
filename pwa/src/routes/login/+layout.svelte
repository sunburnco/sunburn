<script lang="ts">
	const { children } = $props();
</script>

<div class="flex size-full items-center justify-center bg-base-300 text-base-content">
	<div class="mx-auto w-96 max-w-11/12">
		{@render children()}
	</div>
</div>
