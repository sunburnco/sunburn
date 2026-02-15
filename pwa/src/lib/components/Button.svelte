<script lang="ts">
	import { Button } from 'bits-ui';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props_t = {
		className?: string;
		size?: 'sm' | 'md' | 'lg' | 'sm-sq' | 'md-sq' | 'lg-sq';
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
		variant?: 'default' | 'outline' | 'ghost';
		orientation?: 'vertical' | 'horizontal';
	} & Omit<HTMLButtonAttributes, 'class'>;

	const {
		className,
		size = 'md',
		color = 'neutral',
		variant = 'default',
		orientation = 'horizontal',
		children,
		...rest
	}: Props_t = $props();
</script>

<Button.Root
	class={[
		color === 'base-100' &&
			(variant === 'outline'
				? 'border-base-100 text-base-100 hover:bg-base-100 hover:text-base-content active:bg-base-100 active:text-base-content'
				: variant === 'ghost'
					? 'text-base-100 hover:bg-base-100 hover:text-base-content active:bg-base-100 active:text-base-content'
					: 'bg-base-100 text-base-content hover:bg-base-100 active:bg-base-100'),
		color === 'base-200' &&
			(variant === 'outline'
				? 'border-base-200 text-base-200 hover:bg-base-200 hover:text-base-content active:bg-base-200 active:text-base-content'
				: variant === 'ghost'
					? 'text-base-200 hover:bg-base-200 hover:text-base-content active:bg-base-200 active:text-base-content'
					: 'bg-base-200 text-base-content hover:bg-base-200 active:bg-base-200'),
		color === 'base-300' &&
			(variant === 'outline'
				? 'border-base-300 text-base-300 hover:bg-base-300 hover:text-base-content active:bg-base-300 active:text-base-content'
				: variant === 'ghost'
					? 'text-base-300 hover:bg-base-300 hover:text-base-content active:bg-base-300 active:text-base-content'
					: 'bg-base-300 text-base-content hover:bg-base-300 active:bg-base-300'),
		color === 'neutral' &&
			(variant === 'outline'
				? 'border-neutral text-neutral hover:bg-neutral hover:text-neutral-content active:bg-neutral active:text-neutral-content'
				: variant === 'ghost'
					? 'text-neutral hover:bg-neutral hover:text-neutral-content active:bg-neutral active:text-neutral-content'
					: 'bg-neutral text-neutral-content hover:bg-neutral active:bg-neutral'),
		color === 'primary' &&
			(variant === 'outline'
				? 'border-primary text-primary hover:bg-primary hover:text-primary-content active:bg-primary active:text-primary-content'
				: variant === 'ghost'
					? 'text-primary hover:bg-primary hover:text-primary-content active:bg-primary active:text-primary-content'
					: 'bg-primary text-primary-content hover:bg-primary active:bg-primary'),
		color === 'secondary' &&
			(variant === 'outline'
				? 'border-secondary text-secondary hover:bg-secondary hover:text-secondary-content active:bg-secondary active:text-secondary-content'
				: variant === 'ghost'
					? 'text-secondary hover:bg-secondary hover:text-secondary-content active:bg-secondary active:text-secondary-content'
					: 'bg-secondary text-secondary-content hover:bg-secondary active:bg-secondary'),
		color === 'accent' &&
			(variant === 'outline'
				? 'border-accent text-accent hover:bg-accent hover:text-accent-content active:bg-accent active:text-accent-content'
				: variant === 'ghost'
					? 'text-accent hover:bg-accent hover:text-accent-content active:bg-accent active:text-accent-content'
					: 'bg-accent text-accent-content hover:bg-accent active:bg-accent'),
		color === 'info' &&
			(variant === 'outline'
				? 'border-info text-info hover:bg-info hover:text-info-content active:bg-info active:text-info-content'
				: variant === 'ghost'
					? 'text-info hover:bg-info hover:text-info-content active:bg-info active:text-info-content'
					: 'bg-info text-info-content hover:bg-info active:bg-info'),
		color === 'success' &&
			(variant === 'outline'
				? 'border-success text-success hover:bg-success hover:text-success-content active:bg-success active:text-success-content'
				: variant === 'ghost'
					? 'text-success hover:bg-success hover:text-success-content active:bg-success active:text-success-content'
					: 'bg-success text-success-content hover:bg-success active:bg-success'),
		color === 'warning' &&
			(variant === 'outline'
				? 'border-warning text-warning hover:bg-warning hover:text-warning-content active:bg-warning active:text-warning-content'
				: variant === 'ghost'
					? 'text-warning hover:bg-warning hover:text-warning-content active:bg-warning active:text-warning-content'
					: 'bg-warning text-warning-content hover:bg-warning active:bg-warning'),
		color === 'error' &&
			(variant === 'outline'
				? 'border-error text-error hover:bg-error hover:text-error-content active:bg-error active:text-error-content'
				: variant === 'ghost'
					? 'text-error hover:bg-error hover:text-error-content active:bg-error active:text-error-content'
					: 'bg-error text-error-content hover:bg-error active:bg-error'),

		size === 'sm' &&
			(orientation === 'horizontal'
				? 'fl-py-[0.25/0.5] fl-px-[0.5/0.75]'
				: 'fl-py-[0.5/0.75] fl-px-[0.25/0.5]'),
		size === 'md' &&
			(orientation === 'horizontal'
				? 'fl-py-[0.5/0.75] fl-px-[0.75/1]'
				: 'fl-py-[0.75/1] fl-px-[0.5/0.75]'),
		size === 'lg' &&
			(orientation === 'horizontal'
				? 'fl-py-[0.75/1.25] fl-px-[1.25/2.5]'
				: 'fl-py-[1.25/2.5] fl-px-[0.75/1.25]'),

		orientation === 'vertical' && 'writing-slr',

		size === 'sm-sq' && 'fl-p-[0.25/0.5] flex aspect-square items-center justify-center',
		size === 'md-sq' && 'fl-p-[0.5/0.75] flex aspect-square items-center justify-center',
		size === 'lg-sq' && 'fl-p-[0.75/1.25] flex aspect-square items-center justify-center',

		(size === 'sm' || size === 'sm-sq') && 'fl-text-xs/sm',
		(size === 'md' || size === 'md-sq') && 'fl-text-sm/base',
		(size === 'lg' || size === 'lg-sq') && 'fl-text-base/lg',

		(size === 'sm' || size === 'sm-sq') &&
			(orientation === 'horizontal' ? 'fl-min-h-[6/7.5]' : 'fl-min-w-[6/7.5]'),
		(size === 'md' || size === 'md-sq') &&
			(orientation === 'horizontal' ? 'fl-min-h-[7.5/9]' : 'fl-min-w-[7.5/9]'),
		(size === 'lg' || size === 'lg-sq') &&
			(orientation === 'horizontal' ? 'fl-min-h-[8.5/11]' : 'fl-min-w-[8.5/11]'),

		variant === 'outline' && 'bg-transparent hover:border-transparent active:border-transparent',
		variant === 'ghost' &&
			'border-transparent bg-transparent hover:border-transparent active:border-transparent',
		variant === 'default' && 'border-transparent',

		'box-border border-2',
		'cursor-pointer overflow-hidden rounded-field select-none',
		'hover:brightness-80  active:brightness-80',
		orientation === 'horizontal' ? 'active:translate-y-px' : 'active:translate-x-px',

		'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

		className,
	]}
	{...rest}
>
	{@render children?.()}
</Button.Root>
