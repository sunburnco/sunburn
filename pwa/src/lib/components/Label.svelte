<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props_t = {
		size?: 'sm' | 'md' | 'lg';
		ts?: Snippet;
		te?: Snippet;
		bs?: Snippet;
		be?: Snippet;
		className?: string;
	} & Omit<HTMLLabelAttributes, 'class'>;

	const { size = 'md', ts, te, bs, be, className, children, ...rest }: Props_t = $props();
</script>

<label class={['flex flex-col', className]} {...rest}>
	<div
		class={[
			size === 'sm' && 'fl-text-2xs/xs flp-sm',
			size === 'md' && 'flp-md fl-text-xs/sm',
			size === 'lg' && 'flp-lg fl-text-sm/base',
			'italic opacity-50 select-none',
			'flex justify-between',
		]}
	>
		<p>{@render ts?.()}</p>
		<p>{@render te?.()}</p>
	</div>
	{@render children?.()}
	<div
		class={[
			size === 'sm' && 'fl-text-2xs/sm flp-sm',
			size === 'md' && 'flp-md fl-text-xs/sm',
			size === 'lg' && 'flp-lg fl-text-sm/base',
			'italic opacity-50 select-none',
			'flex justify-between',
		]}
	>
		<p>{@render bs?.()}</p>
		<p>{@render be?.()}</p>
	</div>
</label>
