<script lang="ts">
	import { LucideSend } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Editor } from 'tiny-markdown-editor';

	import Button from './Button.svelte';
	import ScrollArea from './ScrollArea.svelte';

	type Props_t = { onSend: (contents: string) => void | Promise<void>; content?: string };

	let { onSend, content = $bindable() }: Props_t = $props();

	let textarea: HTMLTextAreaElement;
	let tinyMDE: Editor | null = null;

	const onkeydown = (e: KeyboardEvent) => {
		if (!tinyMDE) {
			return;
		}

		if (e.key === 'Enter' && !e.shiftKey) {
			const linetypes = tinyMDE.lineTypes;
			if (
				linetypes[linetypes.length - 1] === 'TMCodeFenceBacktickOpen' ||
				linetypes[linetypes.length - 1] === 'TMFencedCodeBacktick'
			) {
				return;
			}

			e.preventDefault();
			onSend(tinyMDE.getContent());
			tinyMDE.setContent('');
		}
	};

	onMount(() => {
		tinyMDE = new Editor({
			textarea,
			customInlineGrammar: {
				autolink: {
					regexp: /^(?<!\[\S+\]\()(https?:\/\/\S+)( )/,
					replacement: '<span class="TMAutolink">$1</span>$2',
				},
				emoji: {
					regexp: /^(:)([a-z_]+)(:)/,
					replacement:
						'<span class="TMMark">$1</span><span class="TMEmoji">$2</span><span class="TMMark">$3</span>',
				},
			},
		});
		tinyMDE.e?.addEventListener('keydown', onkeydown);
	});
</script>

<div class="fl-mx-1/2 fl-mb-1/2 flex items-end fl-gap-1/2">
	<label
		class="box-border flex grow rounded-box border border-base-content/50 bg-base-100 py-0 fl-px-[0.25/0.5]"
	>
		<ScrollArea
			color="base-100"
			class="grow overflow-hidden"
			viewportClassName="max-h-48 min-h-0 cursor-text overflow-y-auto"
		>
			<textarea name="editor" bind:this={textarea} rows={1}></textarea>
		</ScrollArea>
	</label>
	<Button
		size="md-sq"
		color="primary"
		title="Send"
		className="p-1 box-border min-h-9.5"
		onclick={() => {
			const content = tinyMDE?.getContent();
			if (!content || !tinyMDE) {
				return;
			}

			onSend(content);
			tinyMDE.setContent('');
		}}
	>
		<LucideSend class="flicon-md translate-y-px" />
	</Button>
</div>
