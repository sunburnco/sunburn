<script lang="ts">
	import { LucideArrowLeft, LucideArrowRight, LucideLoaderCircle } from '@lucide/svelte';
	import PocketBase, { type AuthMethodsList } from 'pocketbase';
	import type { EventHandler } from 'svelte/elements';

	import { errorPrefix } from '$lib/logPrefixes';
	import type { TypedPocketBase } from '$lib/pb-types';
	import { loginWithPassword } from '$lib/sunburn/login';
	import { authStoreKey } from '$lib/utils/authStoreKey';

	import { rndWindows } from '../rndState.svelte';
	import WindowBase from './WindowBase.svelte';

	const { windowID }: { windowID: string } = $props();

	let loading = $state(false);
	let instanceURL = $state(window.location.origin);
	let errorText = $state('');
	let authMethods = $state<AuthMethodsList | null>(null);
	let chosenAuthMethod = $state<'' | 'password'>('');
	let authField1 = $state('');
	let authField2 = $state('');
	let authErrorText = $state('');
	let loggedInAs = $state('');

	const defaultInstanceURL = 'https://sunburn.gg';

	const queryInstanceForAuthMethods = async () => {
		loading = true;
		errorText = '';
		try {
			instanceURL = instanceURL || defaultInstanceURL;
			authMethods = await (new PocketBase(instanceURL) as TypedPocketBase)
				.collection('users')
				.listAuthMethods();
			rndWindows[windowID].title = `Add Account (Auth Method)`;
		} catch (err: unknown) {
			if (err instanceof Error) {
				errorText = err.message;
				// eslint-disable-next-line no-console
				console.error(
					...errorPrefix,
					'unable to query server for auth methods -- have you verified the instance is running and the correct scheme (http/https) was specified?\n',
					err
				);
			}
		} finally {
			loading = false;
		}
	};

	const passwordAuthSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();
		loading = true;
		const ret = await loginWithPassword(instanceURL, authField1.toLowerCase(), authField2);
		if (ret === null) {
			authErrorText = 'Unable to log in. Are the username and password correct?';
			authField2 = '';
		} else {
			loggedInAs = ret;
			rndWindows[windowID].title = `Add Account (Success)`;
		}
		loading = false;
	};
</script>

<WindowBase>
	{#if !authMethods && !chosenAuthMethod && !loggedInAs}
		<form onsubmit={queryInstanceForAuthMethods} class="flex grow items-end gap-2">
			<fieldset class="fieldset grow" disabled={loading}>
				<legend class="fieldset-legend">IP or Hostname</legend>
				<input
					type="text"
					class="input w-full"
					placeholder={defaultInstanceURL}
					bind:value={instanceURL}
				/>
				<p class="label text-error">{errorText}</p>
			</fieldset>
			<button type="submit" class={['btn btn-primary', errorText ? 'mb-7' : 'mb-2.5']}>
				{#if loading}
					<LucideLoaderCircle class="animate-spin" />
				{:else}
					<LucideArrowRight />
				{/if}
			</button>
		</form>
	{:else if authMethods && !chosenAuthMethod && !loggedInAs}
		<!-- <h2 class="font-display mt-4 text-xl">Auth Method</h2> -->
		<div class="flex grow flex-col gap-2">
			{#if authMethods.password.enabled}
				<button
					onclick={() => {
						chosenAuthMethod = 'password';
						rndWindows[windowID].title = `Add Account (Password Auth)`;
					}}
					class="btn w-full btn-primary"
				>
					Password
				</button>
			{/if}
			<button class="btn w-full btn-primary" disabled>OAuth2 (coming soon)</button>
			<button
				onclick={() => {
					authMethods = null;
					chosenAuthMethod = '';
					rndWindows[windowID].title = `Add Account (Instance Discovery)`;
				}}
				class="btn mt-2 btn-outline btn-neutral"
			>
				<LucideArrowLeft size={16} /> Go Back
			</button>
		</div>
	{:else if chosenAuthMethod === 'password' && !loggedInAs}
		<!-- <h2 class="font-display mt-4 text-xl">Password Auth</h2> -->
		<form class="flex grow flex-col" onsubmit={passwordAuthSubmit}>
			<fieldset class="fieldset w-full" disabled={loading}>
				<legend class="fieldset-legend">Username or Email</legend>
				<input
					required
					type="text"
					class="input w-full"
					placeholder="me@example.com"
					autocomplete="username"
					bind:value={authField1}
				/>
			</fieldset>
			<fieldset class="fieldset w-full" disabled={loading}>
				<legend class="fieldset-legend">Password</legend>
				<input
					required
					type="password"
					class="input w-full"
					autocomplete="current-password"
					bind:value={authField2}
				/>
				<p class={['label text-error', !authErrorText && 'hidden']}>{authErrorText}</p>
			</fieldset>
			<button type="submit" class="btn mt-4 btn-primary">
				{#if loading}
					<LucideLoaderCircle class="animate-spin" />
				{:else}
					Login
				{/if}
			</button>
			<button
				onclick={() => {
					chosenAuthMethod = '';
					rndWindows[windowID].title = `Add Account (Auth Method)`;
				}}
				class="btn mt-2 btn-outline btn-neutral"
			>
				<LucideArrowLeft size={16} /> Go Back
			</button>
		</form>
	{:else if loggedInAs}
		<!-- <h2 class="font-display mt-4 text-xl">Success</h2> -->
		<div class="flex grow flex-col items-stretch justify-center gap-4">
			<div>Logged in as</div>
			<div class="font-display text-lg font-bold">{loggedInAs}@{authStoreKey(instanceURL)}</div>
		</div>
	{/if}
</WindowBase>
