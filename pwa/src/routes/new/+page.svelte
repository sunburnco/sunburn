<script lang="ts">
	import { type Instance_t, sunburn } from '$lib/sunburn/sunburn.svelte';

	import QuotaOption from './QuotaOption.svelte';

	const quota = $state<Record<Instance_t['id'], boolean>>({});
	let chosenInstance = $state('');
</script>

<div class="my-4">
	<h1 class="font-display text-xl font-bold">New Server</h1>
	<form class="flex w-full flex-col gap-2">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Instance</legend>
			<select id="instanceID" required class="select w-full" bind:value={chosenInstance}>
				<option label="Choose an instance..." value=""></option>
				{#each Object.keys(sunburn) as instanceID (instanceID)}
					<QuotaOption {instanceID} bind:disabled={quota[instanceID]} />
				{/each}
			</select>
		</fieldset>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Server Name</legend>
			<input required id="serverName" type="text" class="input w-full" placeholder="My Server" />
		</fieldset>

		<button
			type="submit"
			disabled={chosenInstance === '' || (chosenInstance in quota && quota[chosenInstance])}
			class="btn w-full btn-primary"
		>
			Create Server
		</button>
	</form>
</div>
