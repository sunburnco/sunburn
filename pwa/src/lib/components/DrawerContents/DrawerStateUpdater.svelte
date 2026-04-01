<script lang="ts">
	import { page } from '$app/state';

	import { drawerState } from './drawerState.svelte';

	$effect(() => {
		switch (page.route.id) {
			case '/instance/[instanceID]':
			case '/instance/[instanceID]/dm':
			case '/instance/[instanceID]/server':
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = 'dms';
				break;
			case '/instance/[instanceID]/dm/[dmID]':
				drawerState.channelID = '';
				drawerState.dmID = page.params.dmID || '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = 'dms';
				break;
			case '/instance/[instanceID]/server/[serverID]':
			case '/instance/[instanceID]/server/[serverID]/channel':
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = page.params.serverID || '';
				break;
			case '/instance/[instanceID]/server/[serverID]/channel/[channelID]':
				drawerState.channelID = page.params.channelID || '';
				drawerState.dmID = '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = page.params.serverID || '';
				break;
			case '/instance/[instanceID]/server/[serverID]/settings':
				drawerState.channelID = 'settings';
				drawerState.dmID = '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = page.params.serverID || '';
				break;

			case '/settings':
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = '';
				drawerState.serverID = 'settings';
				break;
			case '/login':
			case '/new':
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = '';
				drawerState.serverID = 'new';
				break;
			case '/login/[instanceID]':
			case '/login/[instanceID]/success':
			case '/instance/[instanceID]/invite':
			case '/instance/[instanceID]/invite/[slug]':
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = page.params.instanceID || '';
				drawerState.serverID = 'new';
				break;

			case '/instance':
			default:
				drawerState.channelID = '';
				drawerState.dmID = '';
				drawerState.instanceID = '';
				drawerState.serverID = 'dms';
				break;
		}
	});
</script>
