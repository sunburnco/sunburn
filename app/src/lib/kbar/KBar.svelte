<script lang="ts">
	import { LucideArrowRight } from '@lucide/svelte';
	import createFuzzySearch from '@nozbe/microfuzz';
	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';

	import { debugPrefix } from '$lib/logPrefixes';

	import { type Arg_t, commands, countRequiredArguments, type KBarCommand_t } from './commands';

	let { modal = $bindable() }: { modal: HTMLDialogElement | null } = $props();

	const handleCtrlK = async (detail: ShortcutEventDetail) => {
		detail.originalEvent.preventDefault();
		modal?.showModal();
	};

	let input: HTMLInputElement;
	let inputValue = $state('');
	let chosenCommand = $state<KBarCommand_t | null>(null);
	const requiredArgCount = $derived(countRequiredArguments(chosenCommand));
	let args = $state<Arg_t[]>([]);

	const resetState = () => {
		inputValue = '';
		chosenCommand = null;
		args = [];
	};

	const commandFuzz = createFuzzySearch(commands, {
		getText: (item: KBarCommand_t) => [item.title, item.description]
	});
	const argsList = $derived.by(async () => {
		if (!chosenCommand) {
			return null;
		} else if (
			args.length < requiredArgCount ||
			chosenCommand.args[chosenCommand.args.length - 1]?.variadic !== undefined
		) {
			return await chosenCommand.args[args.length].loadAutofills(...args.map((arg) => arg.value));
		} else {
			return null;
		}
	});
	const argsFuzz = $derived.by(async () => {
		const awaitArgsList = await argsList;
		return awaitArgsList !== null
			? createFuzzySearch(awaitArgsList, {
					getText: (item: { value: string; display?: string }) => [item.value, item.display ?? null]
				})
			: null;
	});

	const handleEnter = async () => {
		const awaitArgsList = await argsList;

		if (!chosenCommand) {
			if (!inputValue) {
				chosenCommand = commands[0];
				return;
			}

			const results = commandFuzz(inputValue);
			if (results.length === 0) {
				return;
			}
			chosenCommand = results[0].item;
			inputValue = '';
		} else {
			if (
				args.length >= requiredArgCount &&
				chosenCommand.args[chosenCommand.args.length - 1]?.variadic === undefined
			) {
				return;
			}

			if (!inputValue && awaitArgsList) {
				args.push(awaitArgsList[0]);
				return;
			}

			const awaitArgsFuzz = await argsFuzz;

			if (!awaitArgsFuzz) {
				args.push({ value: inputValue });
				inputValue = '';
				return;
			}

			const results = awaitArgsFuzz(inputValue);
			if (results.length === 0) {
				args.push({ value: inputValue });
			} else {
				args.push(results[0].item);
			}

			inputValue = '';
		}
	};

	const handleShiftEnter = () => {
		if (!chosenCommand || args.length < requiredArgCount) {
			return;
		}

		// eslint-disable-next-line no-console
		console.debug(
			...debugPrefix,
			'execute KBar command\n',
			$state.snapshot(chosenCommand.title),
			$state.snapshot(args.map((arg) => arg.value))
		);
		chosenCommand.callback(...args.map((arg) => arg.value));
		modal?.close();
		resetState();
	};
</script>

<svelte:window
	use:shortcut={{
		trigger: [
			{
				key: 'k',
				modifier: ['ctrl', 'meta'],
				callback: handleCtrlK
			},
			{
				key: 'k',
				modifier: [
					['ctrl', 'alt'],
					['meta', 'alt']
				],
				callback: handleCtrlK
			},
			{
				key: 'Enter',
				modifier: ['shift'],
				callback: handleShiftEnter
			}
		]
	}}
/>

<dialog bind:this={modal} class="modal" onclose={resetState}>
	<div class="modal-box">
		<div class="mb-2 select-none">
			{#if chosenCommand}
				<span class={['text-sm', args.length < requiredArgCount && 'hidden']}>
					<kbd class="kbd kbd-sm">Shift</kbd>
					+
					<kbd class="kbd kbd-sm">Enter</kbd>
					to
				</span>
				<span class="badge font-display text-sm badge-primary">
					{chosenCommand.title}
				</span>
				{#each args as arg, i (i)}
					{chosenCommand.args[i].prefix}
					<span class="badge badge-soft font-display text-sm badge-neutral">
						{arg.display ?? arg.value}
					</span>
					{chosenCommand.args[i].suffix}
				{/each}
				<button
					class="btn ms-1 btn-square justify-center btn-xs btn-neutral"
					onclick={handleShiftEnter}
				>
					<LucideArrowRight size="0.75rem" />
				</button>
			{/if}
		</div>

		<label class="input w-full">
			<input
				name="KBar Command"
				type="text"
				class="grow focus:ring-0"
				bind:this={input}
				bind:value={inputValue}
				use:shortcut={{
					trigger: {
						key: 'Enter',
						modifier: null,
						callback: handleEnter
					}
				}}
			/>
			<span class="text-sm select-none">
				<kbd class="kbd kbd-sm">Tab</kbd>
				to cycle
			</span>
		</label>

		{#if !chosenCommand}
			<div class="mt-4 flex max-h-60 flex-col items-stretch gap-1 overflow-y-auto p-1 select-none">
				{#if !inputValue}
					{#each commands as command (command.title)}
						{@render commandSnippet(command)}
					{/each}
				{:else}
					{#each commandFuzz(inputValue) as command (command.item.title)}
						{@render commandSnippet(command.item)}
					{/each}
				{/if}
			</div>
		{:else}
			<div class="mt-4 flex max-h-60 flex-col items-stretch gap-1 overflow-y-auto p-1 select-none">
				<!-- TODO test with variadic commands; may break -->
				{#if args.length < chosenCommand.args.length || (chosenCommand.args.length > 0 && chosenCommand.args[chosenCommand.args.length - 1].variadic)}
					{#await argsList then awaitArgsList}
						{#await argsFuzz then awaitArgsFuzz}
							{#if !inputValue && awaitArgsList}
								<div class="mb-2 flex gap-2">
									<span class="badge badge-soft badge-neutral">
										{chosenCommand.args[args.length].name}
									</span>
									<span class="text-base-content/50">
										{chosenCommand.args[args.length].description}
									</span>
								</div>
								{#each awaitArgsList as arg, i (i)}
									{@render argSnippet(arg)}
								{/each}
							{:else if awaitArgsFuzz}
								<div class="mb-2 flex gap-2">
									<span class="badge badge-soft badge-neutral">
										{chosenCommand.args[args.length].name}
									</span>
									<span class="text-base-content/50">
										{chosenCommand.args[args.length].description}
									</span>
								</div>
								{#each awaitArgsFuzz(inputValue) as arg, i (i)}
									{@render argSnippet(arg.item)}
								{/each}
							{/if}
						{/await}
					{/await}
				{/if}
			</div>
		{/if}
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

{#snippet commandSnippet(c: KBarCommand_t)}
	<button
		class="group btn h-auto flex-col items-start text-start btn-ghost"
		onclick={() => {
			chosenCommand = c;
			inputValue = '';
			input.focus();
		}}
	>
		<div class="flex items-center gap-2 font-display text-xl font-bold">
			{c.title}
			<kbd class="kbd hidden font-mono kbd-sm font-normal group-first:inline">Enter</kbd>
		</div>
		{#if c.description}<div class="text-base-content/50">{c.description}</div>{/if}
	</button>
{/snippet}

{#snippet argSnippet(arg: Arg_t)}
	<button
		class="group btn h-auto flex-col items-start btn-ghost"
		onclick={() => {
			args.push(arg);
			inputValue = '';
			input.focus();
		}}
	>
		<div class="flex items-center gap-2 font-display text-xl font-bold">
			{arg.display ?? arg.value}
			<kbd class="ms-2 kbd hidden font-mono kbd-sm font-normal group-nth-2:inline">Enter</kbd>
		</div>
	</button>
{/snippet}
