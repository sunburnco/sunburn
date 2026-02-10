<script lang="ts">
	import { ScrollArea, type WithoutChild } from 'bits-ui';

	type Props = WithoutChild<ScrollArea.RootProps> & {
		orientation?: 'vertical' | 'horizontal' | 'both';
		viewportClassName?: string;
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
	};

	let {
		ref = $bindable(null),
		orientation = 'vertical',
		viewportClassName,
		color = 'neutral',
		children,
		...restProps
	}: Props = $props();
</script>

{#snippet Scrollbar({ orientation }: { orientation: 'vertical' | 'horizontal' })}
	<ScrollArea.Scrollbar
		{orientation}
		class={[
			color === 'base-100' && 'bg-base-100/50',
			color === 'base-200' && 'bg-base-200/50',
			color === 'base-300' && 'bg-base-300/50',
			color === 'neutral' && 'bg-neutral/50',
			color === 'primary' && 'bg-primary/50',
			color === 'secondary' && 'bg-secondary/50',
			color === 'accent' && 'bg-accent/50',
			color === 'info' && 'bg-info/50',
			color === 'success' && 'bg-success/50',
			color === 'warning' && 'bg-warning/50',
			color === 'error' && 'bg-error/50',
			'flex touch-none select-none',
			orientation === 'vertical' ? 'fl-w-1/2' : 'fl-h-1/2',
		]}
	>
		<ScrollArea.Thumb
			class={[
				color === 'base-100' && 'bg-base-content/50 active:bg-base-content/80',
				color === 'base-200' && 'bg-base-content/50 active:bg-base-content/80',
				color === 'base-300' && 'bg-base-content/50 active:bg-base-content/80',
				color === 'neutral' && 'bg-neutral-content/50 active:bg-neutral-content/80',
				color === 'primary' && 'bg-primary-content/50 active:bg-primary-content/80',
				color === 'secondary' && 'bg-secondary-content/50 active:bg-secondary-content/80',
				color === 'accent' && 'bg-accent-content/50 active:bg-accent-content/80',
				color === 'info' && 'bg-info-content/50 active:bg-info-content/80',
				color === 'success' && 'bg-success-content/50 active:bg-success-content/80',
				color === 'warning' && 'bg-warning-content/50 active:bg-warning-content/80',
				color === 'error' && 'bg-error-content/50 active:bg-error-content/80',
				'rounded-selector',
			]}
		/>
	</ScrollArea.Scrollbar>
{/snippet}

<ScrollArea.Root bind:ref class="overflow-hidden" scrollHideDelay={0} {...restProps}>
	<ScrollArea.Viewport class={viewportClassName}>
		{@render children?.()}
	</ScrollArea.Viewport>
	{#if orientation === 'vertical' || orientation === 'both'}
		{@render Scrollbar({ orientation: 'vertical' })}
	{/if}
	{#if orientation === 'horizontal' || orientation === 'both'}
		{@render Scrollbar({ orientation: 'horizontal' })}
	{/if}
	<ScrollArea.Corner />
</ScrollArea.Root>
