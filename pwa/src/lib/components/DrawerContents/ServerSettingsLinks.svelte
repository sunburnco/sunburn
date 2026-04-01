<script lang="ts">
	import { LucideArrowLeft } from '@lucide/svelte';

	import { page } from '$app/state';
	import { Permissions } from '$lib/constants';
	import {
		cumulativeServerPermissions,
		hasPerm,
		isOwner,
	} from '$lib/sunburn/cumulativePermissions';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	const serverPermissions = $derived<Set<string>>(
		!instanceID || !serverID
			? new Set()
			: cumulativeServerPermissions(instanceID, serverID, sunburn[instanceID].myID),
	);
</script>

<header class="p-4 pb-0">
	<h1 class="font-display text-xl font-bold">Sections</h1>
</header>
<ul class="menu w-full pt-0">
	{#if isOwner(instanceID, serverID) || hasPerm(serverPermissions, Permissions.ADMINISTRATOR, Permissions.MANAGE_SERVER)}
		<li><a href="#meta">Meta</a></li>
	{/if}

	<li>
		<a href="#danger">Danger Zone</a>
	</li>

	<div class="divider m-2"></div>

	<li>
		<a href="."><LucideArrowLeft class="size-4 -translate-y-px" /> Close Settings</a>
	</li>
</ul>
