<script lang="ts">
	import {
		LucideExternalLink,
		LucideFlower2,
		LucideLaptop,
		LucideMoonStar,
		LucidePalette,
		LucideSprout,
		LucideSun,
		LucideSunMoon,
		LucideTerminal,
		LucideTreePalm,
		LucideUserPlus,
		LucideZapOff
	} from '@lucide/svelte';

	import LucideSunburn from '$lib/LucideSunburn.svelte';
	import { spawnClearCachesWindow } from '$lib/rnd/spawn/spawnClearCachesWindow';
	import { spawnLoginWindow } from '$lib/rnd/spawn/spawnLoginWindow';

	const { kbarModal }: { kbarModal: HTMLDialogElement | null } = $props();

	let popover: HTMLElement;
	const iconSize = '1.125rem';

	const addAccount = async () => {
		await spawnLoginWindow();
		popover.hidePopover();
	};

	const clearCaches = async () => {
		await spawnClearCachesWindow();
		popover.hidePopover();
	};
</script>

<div class="bg-base-100 sticky left-0 flex h-full w-10 shrink-0 items-center px-2">
	<button
		style="anchor-name:--mainbar_logobutton_anchor"
		popovertarget="mainbar_logobutton_popovertarget"
		class="shrink-0"
	>
		<img
			src="/sunburn.svg"
			class={[
				'rounded-box border-base-content/50 box-border size-6 select-none border transition-[border-color]',
				'hover:border-base-content'
			]}
			alt="Sunburn Logo"
		/>
	</button>

	<ul
		bind:this={popover}
		popover
		id="mainbar_logobutton_popovertarget"
		style="position-anchor:--mainbar_logobutton_anchor"
		class={[
			'dropdown dropdown-top dropdown-start mb-1.25',
			'menu rounded-box bg-base-200 w-56',
			'border-base-content/50 box-border border drop-shadow-md'
		]}
	>
		<li class="menu-title">KBar</li>
		<li>
			<button onclick={() => kbarModal?.showModal()}>
				<LucideTerminal size={iconSize} /> Show KBar
				<kbd class="kbd kbd-xs -mr-1.5">Ctrl</kbd>
				<kbd class="kbd kbd-xs">K</kbd>
			</button>
		</li>
		<li class="menu-title">About</li>
		<li>
			<a href="https://sunburn.co" target="_blank">
				<LucideSunburn size={iconSize} /> sunburn.co <LucideExternalLink size="0.75rem" />
			</a>
		</li>
		<li>
			<span><LucideLaptop size={iconSize} /> Client v{process.env.npm_package_version}</span>
		</li>
		<li>
			<button onclick={clearCaches}>
				<LucideZapOff size={iconSize} /> Clear Caches
			</button>
		</li>

		<li class="menu-title mt-4">Theme</li>
		<li>
			<button data-set-theme="sunburn-day" data-act-class="font-bold">
				<LucideSun size={iconSize} /> Day
			</button>
		</li>
		<li>
			<button data-set-theme="sunburn-night" data-act-class="font-bold">
				<LucideMoonStar size={iconSize} /> Night
			</button>
		</li>
		<li>
			<details>
				<summary><LucidePalette size={iconSize} /> Colored</summary>
				<ul>
					<li>
						<button data-set-theme="sunburn-oasis" data-act-class="font-bold">
							<LucideTreePalm size={iconSize} /> Oasis
						</button>
					</li>
					<li>
						<button data-set-theme="sunburn-sunset" data-act-class="font-bold">
							<LucideSunMoon size={iconSize} /> Sunset
						</button>
					</li>
					<li>
						<button data-set-theme="sunburn-verdant" data-act-class="font-bold">
							<LucideSprout size={iconSize} /> Verdant
						</button>
					</li>
					<li>
						<button data-set-theme="sunburn-lilac" data-act-class="font-bold">
							<LucideFlower2 size={iconSize} /> Lilac
						</button>
					</li>
				</ul>
			</details>
		</li>

		<li class="menu-title mt-4">Accounts</li>
		<li>
			<button onclick={addAccount}>
				<LucideUserPlus size={iconSize} /> Add Account
			</button>
		</li>
	</ul>
</div>
