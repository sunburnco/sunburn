<script lang="ts">
	import { LucideSend } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Editor } from 'tiny-markdown-editor';

	let {
		onSend,
		content = $bindable('')
	}: {
		onSend: (content: string) => void | Promise<void>;
		content?: string;
	} = $props();

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
					replacement: '<span class="TMAutolink">$1</span>$2'
				},
				emoji: {
					regexp: /^(:)([a-z_]+)(:)/,
					replacement:
						'<span class="TMMark">$1</span><span class="TMEmoji">$2</span><span class="TMMark">$3</span>'
				}
			}
		});
		tinyMDE.e?.addEventListener('keydown', onkeydown);
	});
</script>

<div class="mt-2 flex w-full items-end gap-2 px-2 pb-2">
	<label class="textarea max-h-48 min-h-0 grow cursor-text overflow-y-auto px-1 py-0">
		<textarea name="editor" class="" bind:this={textarea} autocomplete={null} rows={1}></textarea>
	</label>
	<button
		type="button"
		title="Send"
		onclick={() => {
			const content = tinyMDE?.getContent();
			if (!content || !tinyMDE) {
				return;
			}

			onSend(content);
			tinyMDE.setContent('');
		}}
		class="btn btn-square btn-primary"
	>
		<LucideSend size="1.25rem" />
	</button>
</div>
