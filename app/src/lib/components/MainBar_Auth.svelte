<script lang="ts">
	import {
		LucideCirclePlus,
		LucideHotel,
		LucideLaptop,
		LucideLogOut,
		LucideServer,
		LucideStar,
		LucideTriangleAlert,
		LucideUsers
	} from '@lucide/svelte';

	import Avatar from '$lib/components/Avatar.svelte';
	import { spawnCreateServerWindow } from '$lib/rnd/spawn/spawnCreateServerWindow';
	import { spawnDMWindow } from '$lib/rnd/spawn/spawnDMWindow';
	import { spawnLogoutWindow } from '$lib/rnd/spawn/spawnLogoutWindow';
	import { spawnMultiDMWindow } from '$lib/rnd/spawn/spawnMultiDMWindow';
	import { spawnServerPickerWindow } from '$lib/rnd/spawn/spawnServerPickerWindow';
	import { spawnServerWindow } from '$lib/rnd/spawn/spawnServerWindow';
	import { sunburn } from '$lib/sunburn.svelte';
	import { authStoreKey } from '$lib/utils/authStoreKey';
	import { username } from '$lib/utils/username';

	// authKey is the same as client ID and user ID
	const { authKey }: { authKey: string } = $props();

	let popover = $state<HTMLElement | null>(null);
	const iconSize = '1.125rem';
	const serverVersion = sunburn.instances[sunburn.clients[authKey].baseURL].version;
	const versionMismatch = serverVersion !== process.env.nvm_package_version;

	const logOut = async () => {
		await spawnLogoutWindow(authKey);
		popover?.hidePopover();
	};

	const openDMs = async () => {
		await spawnMultiDMWindow(authKey);
		popover?.hidePopover();
	};

	const openDM = async (recipient: string) => {
		await spawnDMWindow(authKey, recipient);
		popover?.hidePopover();
	};

	const openServer = async (server: string) => {
		await spawnServerWindow(authKey, server);
		popover?.hidePopover();
	};

	const openServerPicker = async () => {
		await spawnServerPickerWindow(authKey);
		popover?.hidePopover();
	};

	const createServer = async () => {
		await spawnCreateServerWindow(authKey);
		popover?.hidePopover();
	};
</script>

{#if sunburn.auths[authKey] && sunburn.clients[authKey] && sunburn.users[authKey]}
	<button
		style={`anchor-name:--mainbar_auth_${authKey}_anchor`}
		popovertarget={`mainbar_auth_${authKey}_popovertarget`}
		class={[
			'box-border flex shrink-0 items-center gap-2 overflow-hidden rounded-box border border-base-content/50 pe-2 transition-[border-color]',
			'select-none hover:border-base-content'
		]}
	>
		<div class="size-6">
			<Avatar client={authKey} user={authKey} />
		</div>
		<div class="">
			{sunburn.users[authKey].record.handle}@{authStoreKey(sunburn.clients[authKey].baseURL)}
		</div>
		{#if versionMismatch}
			<LucideTriangleAlert class="size-4 text-warning" />
		{/if}
	</button>

	<ul
		bind:this={popover}
		popover
		id={`mainbar_auth_${authKey}_popovertarget`}
		style={`position-anchor:--mainbar_auth_${authKey}_anchor`}
		class={[
			'dropdown dropdown-center dropdown-top mb-1.25',
			'menu w-56 rounded-box bg-base-200',
			'box-border border border-base-content/50 drop-shadow-md'
		]}
	>
		{#if versionMismatch}
			<li class="menu-title">Warning</li>
			<li>
				<span><LucideTriangleAlert size={iconSize} class="text-warning" /> Version Mismatch</span>
			</li>
			<li><span><LucideLaptop size={iconSize} /> Client v{version}</span></li>
			<li><span><LucideServer size={iconSize} /> Server v{serverVersion}</span></li>
		{/if}
		<li class="menu-title">DMs</li>
		{#each sunburn.pinnedDMs[authKey] as recipient (recipient)}
			<li>
				<button onclick={() => openDM(recipient)}>
					<LucideStar size={iconSize} />
					{username(authKey, recipient)}
				</button>
			</li>
		{/each}
		<li><button onclick={openDMs}><LucideUsers size={iconSize} /> Open DM List</button></li>

		<li class="menu-title">Servers</li>
		{#each sunburn.pinnedServers[authKey] as server (server)}
			<li>
				<button onclick={() => openServer(server)}>
					<LucideStar size={iconSize} />
					{sunburn.servers[server].name}
				</button>
			</li>
		{/each}
		<li>
			<button onclick={openServerPicker}>
				<LucideHotel size={iconSize} /> Server Picker
			</button>
		</li>
		<li>
			<button onclick={createServer}>
				<LucideCirclePlus size={iconSize} /> Create Server
			</button>
		</li>

		<li class="menu-title">Actions</li>
		<li>
			<button onclick={logOut}><LucideLogOut size={iconSize} /> Log Out</button>
		</li>
	</ul>
{/if}
