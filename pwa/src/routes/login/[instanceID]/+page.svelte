<script lang="ts">
	import { LucideCheck, LucideCloudAlert } from '@lucide/svelte';
	import { LucideLock } from '@lucide/svelte';
	import { LucideLockOpen } from '@lucide/svelte';
	import { type AuthMethodsList, BaseAuthStore, ClientResponseError } from 'pocketbase';
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import { logInWithPassword } from '$lib/sunburn/logIn';
	import { debugPrefix, errorPrefix, warnPrefix } from '$lib/utils/logPrefixes';
	import { logFriendly } from '$lib/utils/username';

	let valid = $state<boolean | null>(null);
	let tls = $state<boolean | null>(null);
	let version = $state<string | null>(null);
	const baseURL = $derived(`http${tls ? 's' : ''}://${page.params.instanceID}`);

	let username = $state('');
	let password = $state('');
	let disabled = $state(false);
	let isError = $state(false);

	let authMethods = $state<AuthMethodsList | null>(null);

	const fetchURLAndAuthMethods = async () => {
		authMethods = null;
		try {
			const res = await fetch(`https://${page.params.instanceID}/api/health`);
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, `connected to https://${page.params.instanceID}`);
			version = res.headers.get('x-sb-version');
			if (version) {
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `found Sunburn version ${version}`);
				valid = true;
				tls = true;
			} else {
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					`no Sunburn version header found on https://${page.params.instanceID}`,
				);
				valid = false;
				tls = true;
			}
		} catch {
			// eslint-disable-next-line no-console
			console.warn(
				...warnPrefix,
				`secure connection to https://${page.params.instanceID} failed; falling back to insecure`,
			);
			try {
				const res2 = await fetch(`http://${page.params.instanceID}/api/health`);
				// eslint-disable-next-line no-console
				console.debug(...debugPrefix, `connected to http://${page.params.instanceID}`);
				version = res2.headers.get('x-sb-version');
				if (version) {
					// eslint-disable-next-line no-console
					console.debug(...debugPrefix, `found Sunburn version ${version}`);
					valid = true;
					tls = false;
				} else {
					// eslint-disable-next-line no-console
					console.error(
						...errorPrefix,
						`no Sunburn version header found on http://${page.params.instanceID}`,
					);
					valid = false;
					tls = false;
				}
			} catch {
				// eslint-disable-next-line no-console
				console.error(...errorPrefix, `could not connect to ${page.params.instanceID}`);
				valid = false;
				tls = false;
			}
		}

		if (!valid) {
			return;
		}

		try {
			const tmpPB = new PocketBase(baseURL, new BaseAuthStore());
			authMethods = await tmpPB.collection('users').listAuthMethods();
		} catch (err) {
			if (err instanceof ClientResponseError && err.status === 0) {
				// eslint-disable-next-line no-console
				console.debug(
					...debugPrefix,
					logFriendly(page.params.instanceID || ''),
					'duplicate fetch request aborted for auth methods',
				);
				return;
			}

			// eslint-disable-next-line no-console
			console.error(
				...errorPrefix,
				logFriendly(page.params.instanceID || ''),
				'unable to add account\n',
				err,
			);
		}
	};
	const attemptLogin = async (e: SubmitEvent) => {
		e.preventDefault();
		disabled = true;
		isError = false;
		try {
			const handle = await logInWithPassword(baseURL, username, password);
			goto(`${page.url.pathname}/success?handle=${handle}`);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(...errorPrefix, 'could not sign in\n', err);
			disabled = false;
			isError = true;
		}
	};

	onMount(fetchURLAndAuthMethods);
</script>

<div class="flex w-full flex-col fl-gap-1/2">
	<h1 class="font-display fl-text-lg/xl font-bold select-none">Log In</h1>
	{#if valid === null}
		<p>Loading...</p>
	{:else if !valid}
		<p>Could not find a Sunburn instance at this URL. Check the console for more information.</p>
		<a href="/login">
			<Button color="primary" variant="outline" className="w-full">Go Back</Button>
		</a>
	{:else if isError}
		<div class="rounded-box bg-error flp-md text-error-content">
			Unable to log in. Are your username and password correct?
		</div>
	{:else}
		<div
			class={[
				'fl-gap-1/2 rounded-box flp-md',
				tls && __SB_VERSION__ === version
					? 'bg-base-200 text-base-content'
					: 'bg-warning text-warning-content',
			]}
		>
			<p><LucideCheck class="flicon-md" /> Connected to {page.params.instanceID}</p>

			{#if tls}
				<p><LucideLock class="flicon-md" /> Using SSL</p>
			{:else}
				<p><LucideLockOpen class="flicon-md" /> Not using SSL</p>
			{/if}

			{#if version !== __SB_VERSION__}
				<p>
					<LucideCloudAlert class="flicon-md" /> Client: v{__SB_VERSION__}, Server: v{version}
				</p>
			{/if}
		</div>
	{/if}

	{#if authMethods?.password.enabled}
		<form onsubmit={attemptLogin} class="fl-mt-1/2 flex flex-col">
			<Label>
				{#snippet ts()}
					Username or Email
				{/snippet}
				<Input
					{disabled}
					id="username"
					bind:value={username}
					autocomplete="username"
					oninput={() => (isError = false)}
				/>
			</Label>

			<Label>
				{#snippet ts()}
					Password
				{/snippet}
				<Input
					{disabled}
					id="password"
					bind:value={password}
					type="password"
					autocomplete="current-password"
					oninput={() => (isError = false)}
				/>
			</Label>

			<Button {disabled} color="primary" type="submit" className="fl-mt-1/2 w-full">Submit</Button>
		</form>
	{/if}
</div>
