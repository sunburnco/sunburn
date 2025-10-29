<script lang="ts">
	import { LucideLock, LucideLockOpen, LucideX } from '@lucide/svelte';
	import interact from 'interactjs';
	import { onMount, type Snippet } from 'svelte';

	import { clamp } from '../utils/clamp';
	import { saveRNDWindows } from './rndState.svelte';

	let {
		activeID = $bindable(),
		children,
		id,
		locked = $bindable(false),
		onactive,
		onclose,
		onsave,
		parentHeight,
		parentWidth,
		sizeMinW,
		w = $bindable(256),
		sizeMaxW,
		sizeMinH,
		h = $bindable(256),
		sizeMaxH,
		theme,
		title,
		x = $bindable(0),
		y = $bindable(0),
		z = 0
	}: {
		activeID?: string;
		children?: Snippet;
		id: string;
		locked?: boolean;
		onactive?: () => void;
		onclose?: () => void;
		onsave?: (x: number, y: number, w: number, h: number, z: number, locked: boolean) => void;
		parentWidth: number;
		parentHeight: number;
		sizeMinW?: number;
		w?: number;
		sizeMaxW?: number;
		sizeMinH?: number;
		h?: number;
		sizeMaxH?: number;
		theme?: string;
		title?: string;
		x?: number;
		y?: number;
		z?: number;
	} = $props();

	let dragging = $state(false);
	let snapping = $state(false);
	$effect(() => {
		document.body.style.userSelect = dragging ? 'none' : 'text';
	});

	function dragMoveListener(event: { dx: number; dy: number }) {
		if (locked) return;
		x = clamp(0, x + event.dx, Infinity);
		y = clamp(0, y + event.dy, Infinity);
	}
	function resizeMoveListener(event: {
		deltaRect: { left: number; top: number };
		rect: { width: number; height: number };
	}) {
		if (locked) return;
		x += event.deltaRect.left;
		y += event.deltaRect.top;
		w = Math.max(event.rect.width, 30);
		h = Math.max(event.rect.height, 30);
	}

	let el = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!el) return;
		if (locked) {
			interact(el).unset();
			return;
		}

		const snapAmount = snapping ? 16 : 0;

		interact(el)
			.draggable({
				onstart: () => {
					dragging = true;
				},
				onend: () => {
					dragging = false;
					if (onsave) onsave(x, y, w, h, z, locked);
				},
				modifiers: [
					interact.modifiers.snap({
						targets: [interact.snappers.grid({ x: snapAmount, y: snapAmount })],
						range: Infinity,
						relativePoints: [{ x: 0, y: 0 }]
					}),
					interact.modifiers.restrictRect({
						restriction: 'parent'
					})
				],
				listeners: {
					move: dragMoveListener
				}
			})
			.resizable({
				onstart: () => {
					dragging = true;
				},
				onend: () => {
					dragging = false;
					if (onsave) onsave(x, y, w, h, z, locked);
				},
				modifiers: [
					interact.modifiers.snapSize({
						targets: [interact.snappers.grid({ x: snapAmount, y: snapAmount })],
						range: Infinity
					}),
					// interact.modifiers.restrictRect({
					// 	restriction: 'parent'
					// }),
					interact.modifiers.restrictSize({
						min: { width: sizeMinW ?? 16, height: sizeMinH ?? 16 },
						max: {
							width: Math.min(parentWidth, sizeMaxW ?? Infinity),
							height: Math.min(parentHeight, sizeMaxH ?? Infinity)
						}
					})
				],
				edges: { left: true, right: true, bottom: true, top: false },
				listeners: {
					move: resizeMoveListener
				}
			});
	});

	onMount(() => {
		if (onsave) onsave(x, y, w, h, z, locked);
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Shift') {
			snapping = true;
		}
	}}
	onkeyup={(e) => {
		if (e.key === 'Shift') {
			snapping = false;
		}
	}}
/>

<!-- // TODO should onmousedown be a callback instead of bind? -->
<div
	bind:this={el}
	onmousedown={() => {
		activeID = id;
		if (onactive) {
			onactive();
		}
	}}
	style={`left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${z}`}
	class={[
		'@container',
		'rounded-box absolute',
		'bg-base-300 border-base-content/50 overflow-hidden border',
		'flex flex-col items-stretch',
		'shadow-sm',
		'select-none'
		// activeID === id && 'border-primary'
	]}
	data-theme={theme}
>
	<div
		class={[
			'bg-base-100 px-0.25 flex h-7 w-full min-w-0 shrink-0 grow-0 items-center justify-between',
			'font-display relative text-sm',
			'border-b-base-content/50 border-b'
			// activeID === id && 'border-b-primary'
		]}
	>
		<div class="flex min-w-0 shrink flex-nowrap items-center">
			{#if activeID === id}<div class="status status-primary ms-1.5"></div>{/if}
			<span class="ms-1.5 text-nowrap">
				{#if dragging}
					{w}x{h} ({x},{y})
				{:else}
					{title}
				{/if}
			</span>
		</div>

		<div class="bg-base-100 flex items-center">
			<button
				type="button"
				tabindex={-1}
				class="btn btn-xs btn-square btn-ghost"
				onclick={() => {
					locked = !locked;
					saveRNDWindows();
				}}
			>
				{#if locked}
					<LucideLock size="0.75rem" />
				{:else}
					<LucideLockOpen size="0.75rem" />
				{/if}
			</button>
			<button
				type="button"
				tabindex={-1}
				disabled={locked}
				onclick={() => {
					if (locked) return;
					if (onclose) onclose();
				}}
				class="btn btn-xs btn-ghost btn-square"
			>
				<LucideX size="0.75rem" />
			</button>
		</div>
	</div>
	<div class="flex min-w-0 grow flex-col items-stretch overflow-auto">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
