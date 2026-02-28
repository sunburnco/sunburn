<script lang="ts">
	import { LucideSend } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Editor } from 'tiny-markdown-editor';

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

<div class="m-2 flex items-end gap-2">
	<label class="textarea max-h-48 min-h-0 grow cursor-text overflow-y-auto px-1 py-0">
		<textarea name="editor" bind:this={textarea} rows={1}></textarea>
	</label>
	<button
		class="btn btn-square btn-primary"
		onclick={() => {
			const content = tinyMDE?.getContent();
			if (!content || !tinyMDE) {
				return;
			}

			onSend(content);
			tinyMDE.setContent('');
		}}
	>
		<LucideSend class="size-4 translate-y-px" />
	</button>
</div>
