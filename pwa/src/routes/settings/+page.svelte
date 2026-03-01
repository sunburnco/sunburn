<script lang="ts">
	import { LucideLogIn, LucidePlus, LucideX } from '@lucide/svelte';
	import { set } from 'idb-keyval';

	import {
		type LocalSetting_t,
		type LocalSettingGroup_t,
		localSettings,
		saveLocalSettings,
	} from '$lib/sunburn/localSettings.svelte';
	import { localAuthStoreKeys, sunburn } from '$lib/sunburn/sunburn.svelte';
	import { debugPrefix } from '$lib/utils/logPrefixes';
	import { parseInstanceSlug } from '$lib/utils/parseInstanceSlug';
	import { setTheme } from '$lib/utils/setTheme';
	import { logFriendly } from '$lib/utils/username';

	$effect(() => setTheme(localSettings?.appearance?.settings?.theme?.stringValue ?? ''));

	const removeAccount = (localAuthStoreKey: `${string}@${string}`) => {
		const instanceID = parseInstanceSlug(localAuthStoreKey, '');
		if (instanceID && instanceID in sunburn) {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'removing all event listeners');
			sunburn[instanceID].pb.collection('*').unsubscribe();

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, logFriendly(instanceID), 'removing account');
			delete sunburn[instanceID];
		}
		delete localAuthStoreKeys[localAuthStoreKey];
		set('sbLocalAuthStoreKeys', $state.snapshot(localAuthStoreKeys));
	};
</script>

<div class="my-4 flex flex-col gap-2">
	<h1 class="font-display text-xl font-bold">Local Settings</h1>
	<p class="opacity-60">
		These settings only apply to this device, and are not synced to the cloud.
	</p>
	<div class="divider"></div>
	<ul class="menu m-0 w-full p-0">
		<li class="menu-title" id="accounts">Accounts</li>
		{#each Object.keys(localAuthStoreKeys) as localAuthStoreKey (localAuthStoreKey)}
			{@const instanceID = parseInstanceSlug(localAuthStoreKey, '')}
			{@const ready = sunburn[instanceID]?.ready ?? false}
			<li class="w-full">
				<span
					class="flex w-full cursor-default hover:bg-transparent active:bg-transparent active:text-inherit"
				>
					<span class="flex grow items-center justify-between gap-4">
						<div class="min-w-1/2">
							<p class="font-bold text-wrap select-none">
								{localAuthStoreKey}
							</p>
							<p class="text-wrap select-none">
								{#if ready}
									<span class="badge badge-success">Ready</span>
								{:else}
									<span class="badge badge-error">Not Ready</span>
								{/if}
							</p>
						</div>
						<div class="flex gap-2">
							<a href={`/login/${instanceID}`}>
								<button class="btn btn-square" title="Log In">
									<LucideLogIn class="size-5" />
								</button>
							</a>
							<button
								class="btn btn-square btn-error"
								title="Remove Account"
								onclick={() => removeAccount(localAuthStoreKey as keyof typeof localAuthStoreKeys)}
							>
								<LucideX class="size-5" />
							</button>
						</div>
					</span>
				</span>
			</li>
		{/each}
		<li class="w-full">
			<span class="flex w-full hover:bg-transparent active:bg-transparent active:text-inherit">
				<a href="/login" class="grow">
					<button class="btn w-full btn-ghost">
						<LucidePlus class="size-4" /> Add Account
					</button>
				</a>
			</span>
		</li>

		{#each Object.keys(localSettings) as localSettingsGroupKey (localSettingsGroupKey)}
			{@const lsgk = localSettingsGroupKey as keyof typeof localSettings}
			{#if !localSettingsGroupKey.startsWith('_')}
				{@render SettingsGroup(localSettings[lsgk] as LocalSettingGroup_t)}
			{/if}
		{/each}
	</ul>
</div>

{#snippet TextSetting(setting: LocalSetting_t)}
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<fieldset class="fieldset w-full md:hidden">
			<legend class="fieldset-legend">{setting.name}</legend>
			{#if 'stringValue' in setting}
				{#if setting.acceptableValues?.length}
					<select
						name={setting.name}
						class="select w-full"
						bind:value={setting.stringValue}
						onchange={saveLocalSettings}
					>
						{#each setting.acceptableValues as av (av.value)}
							<option label={av.label ?? av.value} value={av.value}></option>
						{/each}
					</select>
				{:else}
					<input
						name={setting.name}
						class="input w-full"
						bind:value={setting.stringValue}
						placeholder={setting.placeholder}
						onchange={saveLocalSettings}
					/>
				{/if}
				{#if setting.description}
					<p class="label text-wrap">
						{setting.description}
					</p>
				{/if}
			{/if}
		</fieldset>

		<label
			class={[
				'hidden grow items-center justify-between gap-4 md:flex',
				!setting.acceptableValues?.length && 'cursor-pointer',
			]}
		>
			<div class="min-w-1/2">
				<p class="font-bold select-none">{setting.name}</p>
				{#if setting.description}
					<p class="select-none">{setting.description}</p>
				{/if}
			</div>
			{#if 'stringValue' in setting}
				{#if setting.acceptableValues?.length}
					<select
						name={setting.name}
						class="select"
						bind:value={setting.stringValue}
						onchange={saveLocalSettings}
					>
						{#each setting.acceptableValues as av (av.value)}
							<option label={av.label ?? av.value} value={av.value}></option>
						{/each}
					</select>
				{:else}
					<input
						name={setting.name}
						class="input"
						bind:value={setting.stringValue}
						placeholder={setting.placeholder}
						onchange={saveLocalSettings}
					/>
				{/if}
			{/if}
		</label>
	</label>
{/snippet}

{#snippet NumberSetting(setting: LocalSetting_t)}
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<fieldset class="fieldset w-full md:hidden">
			<legend class="fieldset-legend">{setting.name}</legend>
			{#if 'numberValue' in setting}
				<input
					name={setting.name}
					class={['w-full', setting.preferRange ? 'range' : 'input']}
					type={setting.preferRange ? 'range' : 'number'}
					bind:value={setting.numberValue}
					min={setting.min}
					max={setting.max}
					step={setting.step}
					onchange={saveLocalSettings}
				/>
				{#if setting.description}
					<p class="label text-wrap">
						{setting.description}
						{#if setting.preferRange === 'includeCurrent'}
							(Current: {setting.numberValue})
						{/if}
					</p>
				{/if}
			{/if}
		</fieldset>

		<label
			class={[
				'hidden grow items-center justify-between gap-4 md:flex',
				!setting.preferRange && 'cursor-pointer',
			]}
		>
			<div class="min-w-1/2">
				<p class="font-bold text-wrap select-none">{setting.name}</p>
				{#if setting.description}
					<p class="text-wrap opacity-60 select-none">
						{setting.description}
						{#if setting.preferRange === 'includeCurrent'}
							(Current: {setting.numberValue})
						{/if}
					</p>
				{/if}
			</div>
			{#if 'numberValue' in setting}
				<input
					name={setting.name}
					class={setting.preferRange ? 'range' : 'input'}
					type={setting.preferRange ? 'range' : 'number'}
					bind:value={setting.numberValue}
					min={setting.min}
					max={setting.max}
					step={setting.step}
					onchange={saveLocalSettings}
				/>
			{/if}
		</label>
	</label>
{/snippet}

{#snippet BoolSetting(setting: LocalSetting_t)}
	<label class="flex w-full hover:bg-transparent active:bg-transparent active:text-current">
		<fieldset class="fieldset w-full md:hidden">
			<legend class="fieldset-legend">{setting.name}</legend>
			{#if 'boolValue' in setting}
				<input
					type="checkbox"
					name={setting.name}
					class="checkbox"
					bind:checked={setting.boolValue}
					onchange={saveLocalSettings}
				/>
				{#if setting.description}
					<p class="label text-wrap">
						{setting.description}
					</p>
				{/if}
			{/if}
		</fieldset>

		<label class="hidden grow cursor-pointer items-center justify-between gap-4 md:flex">
			<div class="min-w-1/2">
				<p class="font-bold text-wrap select-none">{setting.name}</p>
				{#if setting.description}
					<p class="text-wrap opacity-60 select-none">
						{setting.description}
					</p>
				{/if}
			</div>
			{#if 'boolValue' in setting}
				<input
					name={setting.name}
					class="checkbox"
					type="checkbox"
					bind:checked={setting.boolValue}
					onchange={saveLocalSettings}
				/>
			{/if}
		</label>
	</label>
{/snippet}

{#snippet SettingsGroup(group: LocalSettingGroup_t)}
	<li class="mt-4 menu-title" id={group.name.toLocaleLowerCase()}>
		{group.name}
	</li>
	{#each Object.keys(group.settings) as settingKey (settingKey)}
		<li class="w-full">
			{#if 'stringValue' in group.settings[settingKey]}
				{@render TextSetting(group.settings[settingKey])}
			{:else if 'numberValue' in group.settings[settingKey]}
				{@render NumberSetting(group.settings[settingKey])}
			{:else if 'boolValue' in group.settings[settingKey]}
				{@render BoolSetting(group.settings[settingKey])}
			{/if}
		</li>
	{/each}
{/snippet}
