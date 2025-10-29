<script lang="ts">
	import type { ShortcutEventDetail, ShortcutModifier } from '@svelte-put/shortcut';
	import { shortcut } from '@svelte-put/shortcut';

	import { dev } from '$app/environment';

	import {
		activeWindowID,
		bringIDToTop,
		closeWindowAndChildren,
		moveIDToBottom,
		rndWindows,
		saveRNDWindows
	} from './rnd/rndState.svelte';
	import { spawnPlaygroundWindow } from './rnd/spawn/spawnPlaygroundWindow';

	const globalModifiers = [
		['ctrl', 'alt'],
		['meta', 'alt']
	] as ShortcutModifier[][];

	const closeActiveWindow = (e: ShortcutEventDetail) => {
		e.originalEvent.preventDefault();

		if (!activeWindowID.id) {
			return;
		}

		closeWindowAndChildren(activeWindowID.id);
		saveRNDWindows();
	};

	const toggleActiveWindowLock = (e: ShortcutEventDetail) => {
		e.originalEvent.preventDefault();

		if (!activeWindowID.id) {
			return;
		}

		rndWindows[activeWindowID.id].locked = !rndWindows[activeWindowID.id].locked;
		saveRNDWindows();
	};

	const openPlaygroundWindow = (e: ShortcutEventDetail) => {
		e.originalEvent.preventDefault();

		spawnPlaygroundWindow();
	};

	const moveActiveWindowToTop = (e: ShortcutEventDetail) => {
		e.originalEvent.preventDefault();

		if (!activeWindowID.id) {
			return;
		}

		bringIDToTop(activeWindowID.id);
		saveRNDWindows();
	};

	const moveActiveWindowToBottom = (e: ShortcutEventDetail) => {
		e.originalEvent.preventDefault();

		if (!activeWindowID.id) {
			return;
		}

		moveIDToBottom(activeWindowID.id);
		saveRNDWindows();
	};
</script>

<svelte:window
	use:shortcut={{
		trigger: dev
			? {
					key: 'p',
					modifier: globalModifiers,
					callback: openPlaygroundWindow
				}
			: []
	}}
	use:shortcut={{
		trigger: [
			{
				key: 'w',
				modifier: globalModifiers,
				callback: closeActiveWindow
			},
			{
				key: 'l',
				modifier: globalModifiers,
				callback: toggleActiveWindowLock
			},
			{
				key: 'ArrowUp',
				modifier: globalModifiers,
				callback: moveActiveWindowToTop
			},
			{
				key: 'ArrowDown',
				modifier: globalModifiers,
				callback: moveActiveWindowToBottom
			}
		]
	}}
/>
