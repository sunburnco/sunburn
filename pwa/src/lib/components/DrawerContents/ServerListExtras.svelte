<script lang="ts">
	import { LucideCog, LucidePlus } from '@lucide/svelte';

	import { drawerState } from './drawerState.svelte';
</script>

<a
	title="Settings"
	href="/settings"
	class={['btn btn-square', drawerState.serverID === 'settings' ? 'btn-neutral' : 'btn-ghost']}
>
	<LucideCog class="size-6" />
</a>
<a
	title="Add Server"
	href="/new"
	class={['btn btn-square', drawerState.serverID === 'new' ? 'btn-neutral' : 'btn-ghost']}
>
	<LucidePlus class="size-6" />
</a>
