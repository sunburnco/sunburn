<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';

	let valid = $state<boolean | null>(null);
	let tls = $state<boolean | null>(null);

	onMount(async () => {
		try {
			const res = await fetch(`https://${page.params.instanceURL}/api/health`);
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `connected to https://${page.params.instanceURL}`);
			if (res.headers.get('x-sb-version')) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `found Sunburn version ${res.headers.get('x-sb-version')}`);
				valid = true;
				tls = true;
			} else {
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					`no Sunburn version header found on https://${page.params.instanceURL}`,
				);
				valid = false;
				tls = true;
			}
		} catch {
			// eslint-disable-next-line no-console
			console.warn(
				...warnPrefix,
				`secure connection to https://${page.params.instanceURL} failed; falling back to insecure`,
			);
			try {
				const res2 = await fetch(`http://${page.params.instanceURL}/api/health`);
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `connected to http://${page.params.instanceURL}`);
				if (res2.headers.get('x-sb-version')) {
					// eslint-disable-next-line no-console
					console.debug(
						...debugPrefix,
						`found Sunburn version ${res2.headers.get('x-sb-version')}`,
					);
					valid = true;
					tls = false;
				} else {
					// eslint-disable-next-line no-console
					console.error(
						...errorPrefix,
						`no Sunburn version header found on http://${page.params.instanceURL}`,
					);
					valid = false;
					tls = false;
				}
			} catch {
				// eslint-disable-next-line no-console
				console.error(...errorPrefix, `could not connect to ${page.params.instanceURL}`);
				valid = false;
				tls = false;
			}
		}
	});

	import LucideCheck from '@lucide/svelte/icons/circle-check';
	import LucideLock from '@lucide/svelte/icons/lock';
	import LucideLockOpen from '@lucide/svelte/icons/lock-open';
</script>

<div class="flex size-full items-center justify-center bg-base-300 text-base-content">
	<div class="flex fl-w-64/96 flex-col gap-2">
		<h1 class="font-display fl-text-lg/xl font-bold select-none">Log In</h1>
		{#if valid === null}
			<p>Loading...</p>
		{:else if !valid}
			<p>
				Could not find a Sunburn instance at this URL. Check the console for more information.
			</p>
			<a href="/login">
				<Button color="primary" variant="outline" className="w-full">Go Back</Button>
			</a>
		{:else}
			<div
				class={[
					'fl-gap-1/2 rounded-box fl-p-1/2',
					tls ? 'bg-base-200 text-base-content' : 'bg-warning text-warning-content',
				]}
			>
				<p><LucideCheck class="flicon-md" /> Connected to {page.params.instanceURL}</p>
				{#if tls}
					<p><LucideLock class="flicon-md" /> Using SSL</p>
				{:else}
					<p><LucideLockOpen class="flicon-md" /> Not using SSL</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
