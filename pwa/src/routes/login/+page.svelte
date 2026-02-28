<script lang="ts">
	import LucideLogIn from '@lucide/svelte/icons/log-in';
	import { Debounced } from 'runed';

	import { page } from '$app/state';
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

<div class="flex flex-col">
	<h1 class="font-display text-xl font-bold select-none">Log In</h1>
	<form action={`${page.url.href}/${instanceSlug.current}`} class="flex flex-col gap-2">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Instance URL</legend>
			<input
				class="input w-full"
				type="text"
				bind:value={baseHost}
				placeholder={`Default: ${defaultURL}`}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
			/>
		</fieldset>

		<a class="" href={`${page.url.href}/${instanceSlug.current}`}>
			<button class="btn w-full btn-primary" type="submit">
				Log in to {instanceSlug.current}
				<LucideLogIn class="size-4" />
			</button>
		</a>
	</form>
</div>
