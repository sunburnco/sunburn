<script lang="ts">
	import LucideLogIn from '@lucide/svelte/icons/log-in';
	import { Debounced } from 'runed';

	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';

	let defaultURL = $state(page.url.host);
	let baseHost = $state('');
	let instanceSlug = new Debounced(() => {
		const slug = parseInstanceSlug(baseHost, defaultURL);
		if (slug === '') {
			return defaultURL;
		}
		return slug;
	}, 175);
</script>

<div class="flex flex-col fl-gap-1/2">
	<h1 class="font-display fl-text-lg/xl font-bold select-none">Log In</h1>
	<form
		action={`${page.url.href}/${instanceSlug.current}`}
		class="fl-mt-1/2 flex flex-col fl-gap-1/2"
	>
		<Label>
			{#snippet ts()}
				Instance URL
			{/snippet}
			<Input
				id="instanceURL"
				bind:value={baseHost}
				placeholder={`Default: ${defaultURL}`}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
			/>
		</Label>
		<a class="" href={`${page.url.href}/${instanceSlug.current}`}>
			<Button color="primary" type="submit" className="w-full">
				Log in to {instanceSlug.current}
				<LucideLogIn class="flicon-md" />
			</Button>
		</a>
	</form>
</div>
