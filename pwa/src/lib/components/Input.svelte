<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props_t = {
		className?: string;
		size_?: 'sm' | 'md' | 'lg';
		color?:
			| 'base-100'
			| 'base-200'
			| 'base-300'
			| 'neutral'
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'info'
			| 'success'
			| 'warning'
			| 'error';
		variant?: 'default' | 'ghost';
		children?: Snippet;
	} & HTMLInputAttributes;

	let {
		className,
		size_ = 'md',
		color = 'neutral',
		variant = 'default',
		value = $bindable(''),
		...rest
	}: Props_t = $props();
</script>

<input
	class={[
		color === 'base-100' &&
			(variant === 'ghost'
				? 'focus:border-base-100 focus:outline-base-100'
				: 'border-base-100/50 focus:outline-base-100'),
		color === 'base-200' &&
			(variant === 'ghost'
				? 'focus:border-base-200 focus:outline-base-200'
				: 'border-base-200/50 focus:outline-base-200'),
		color === 'base-300' &&
			(variant === 'ghost'
				? 'focus:border-base-300 focus:outline-base-300'
				: 'border-base-300/50 focus:outline-base-300'),
		color === 'neutral' &&
			(variant === 'ghost'
				? 'focus:border-neutral focus:outline-neutral'
				: 'border-neutral/50 focus:outline-neutral'),
		color === 'primary' &&
			(variant === 'ghost'
				? 'focus:border-primary focus:outline-primary'
				: 'border-primary/50 focus:outline-primary'),
		color === 'secondary' &&
			(variant === 'ghost'
				? 'focus:border-secondary focus:outline-secondary'
				: 'border-secondary/50 focus:outline-secondary'),
		color === 'accent' &&
			(variant === 'ghost'
				? 'focus:border-accent focus:outline-accent'
				: 'border-accent/50 focus:outline-accent'),
		color === 'info' &&
			(variant === 'ghost'
				? 'focus:border-info focus:outline-info'
				: 'border-info/50 focus:outline-info'),
		color === 'success' &&
			(variant === 'ghost'
				? 'focus:border-success focus:outline-success'
				: 'border-success/50 focus:outline-success'),
		color === 'warning' &&
			(variant === 'ghost'
				? 'focus:border-warning focus:outline-warning'
				: 'border-warning/50 focus:outline-warning'),
		color === 'error' &&
			(variant === 'ghost'
				? 'focus:border-error focus:outline-error'
				: 'border-error/50 focus:outline-error'),

		variant === 'ghost' && 'border-transparent',

		size_ === 'sm' && 'flp-sm fl-text-xs/sm',
		size_ === 'md' && 'flp-md fl-text-sm/base',
		size_ === 'lg' && 'flp-lg fl-text-base/lg',

		'box-border rounded-field border',
		'text-base-content placeholder:text-base-content/50',

		'disabled:cursor-not-allowed disabled:opacity-90',
		'focus:outline',
		'invalid:border-error invalid:outline-2 invalid:outline-error',

		className,
	]}
	bind:value
	{...rest}
/>
