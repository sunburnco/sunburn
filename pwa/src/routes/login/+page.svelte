<script lang="ts">
	import LucideLogIn from '@lucide/svelte/icons/log-in';
	import { Debounced } from 'runed';
	import { parse } from 'tldts';

	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';

	let defaultURL = $state(page.url.host);
	let baseURLInput = $state(new URLSearchParams(window.location.search).get('instanceURL') ?? '');
	let baseURL = new Debounced(() => {
		let port = '';
		const groups = /:(\d{1,5})$/.exec(baseURLInput);
		if (groups?.length === 2) {
			port = groups[1];
		}

		const tld = parse(baseURLInput, { allowPrivateDomains: true });
		if (tld.domain) {
			return tld.hostname + (port ? `:${port}` : '');
		} else if (!tld.domain && tld.hostname) {
			if (baseURLInput.split(':')[0].endsWith('.')) {
				return tld.hostname + (port ? `:${port}` : '');
			} else if (!tld.isIp) {
				return tld.hostname + '.on.sb' + (port ? `:${port}` : '');
			} else {
				return tld.hostname + (port ? `:${port}` : '');
			}
		} else {
			return defaultURL;
		}
	}, 175);
</script>

<div class="flex size-full items-center justify-center bg-base-300 text-base-content">
	<form action={`${page.url.href}/${baseURL.current}`} class="flex fl-w-64/96 flex-col gap-2">
		<h1 class="font-display fl-text-lg/xl font-bold select-none">Log In</h1>
		<Label>
			{#snippet ts()}
				Instance URL
			{/snippet}
			<Input
				id="instanceURL"
				bind:value={baseURLInput}
				placeholder={`Default: ${defaultURL}`}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
			/>
		</Label>
		<a class="" href={`${page.url.href}/${baseURL.current}`}>
			<Button color="primary" type="submit" className="w-full">
				Log in to {baseURL.current}
				<LucideLogIn class="flicon-md" />
			</Button>
		</a>
	</form>
</div>
