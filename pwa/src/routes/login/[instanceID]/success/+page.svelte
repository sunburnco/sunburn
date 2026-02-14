<script lang="ts">
	import { page } from '$app/state';

	const instanceID = $derived(page.params.instanceID);
</script>

<div class="flex flex-col gap-2">
	<h1 class="font-display text-xl font-bold select-none">Success</h1>
	<div>
		Successfully logged in as
		{page.url.searchParams.get('handle')}@{instanceID}
	</div>
</div>
