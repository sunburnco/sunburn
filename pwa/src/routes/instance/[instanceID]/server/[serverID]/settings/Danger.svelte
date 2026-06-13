<script lang="ts">
	import { LucideLogOut } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { sunburn } from '$lib/sunburn/sunburn.svelte';
	import { debugPrefix, errorPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	const instanceID = $derived(page.params.instanceID || '');
	const serverID = $derived(page.params.serverID || '');

	let confirmLeaveDialog: HTMLDialogElement;
	let leaveError = $state(false);

	const leaveServer = async () => {
		// eslint-disable-next-line no-console
		console.debug(...debugPrefix, logFriendly(instanceID), 'leaving server', serverID);
		try {
			await sunburn[instanceID].pb.send(`/api/sb/servers/${serverID}/leave`, {
				method: 'POST',
			});
			goto('/');
		} catch (err) {
			leaveError = true;
			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(instanceID),
				'something went wrong while trying to leave the server\n',
				err,
			);
		}
	};
</script>

<dialog class="modal text-base" bind:this={confirmLeaveDialog}>
	<div class="modal-box flex flex-col gap-2">
		{#if leaveError}
			<h1 class="font-display text-xl font-bold">Error</h1>
			<div class="rounded-box bg-error p-2 text-error-content">
				Something went wrong while trying to leave the server. Check the console for more
				information.
			</div>
		{:else}
			<h1 class="font-display text-xl font-bold">Confirm</h1>
			<p>
				Are you sure you want to leave this server? You will not be able to rejoin without an
				invite.
			</p>
			<div class="mt-2 flex flex-col items-stretch justify-end gap-2 sm:flex-row">
				<form method="dialog">
					<button class="btn">No, Stay in Server</button>
				</form>
				<button class="btn btn-error" onclick={leaveServer}>Yes, Leave Server</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<li class="mt-4 menu-title first:mt-0" id="danger">Danger Zone</li>
<li class="w-full">
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<label class="flex grow cursor-pointer items-center justify-between gap-4">
			<div class="min-w-1/2">
				<p class="font-bold text-wrap select-none">Leave Server</p>

				<p class="text-wrap opacity-60 select-none">You cannot rejoin without an invite</p>
			</div>
			<button
				class="btn btn-square btn-error"
				onclick={() => {
					leaveError = false;
					confirmLeaveDialog.showModal();
				}}
			>
				<LucideLogOut class="size-4" />
			</button>
		</label>
	</label>
</li>
