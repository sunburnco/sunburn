<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex flex-col fl-gap-1/2">
	<h1 class="font-display fl-text-lg/xl font-bold select-none">Success</h1>
	<div>
		Successfully logged in as
		{page.url.searchParams.get('handle')}@{page.params.instanceID}
	</div>
</div>
