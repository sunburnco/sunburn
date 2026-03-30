// as of 3/27/26, the Svelte docs say
// > In many cases, [global state as an alternative to context] is perfectly fine,
// > but there is a risk: if you mutate the state during server-side rendering
// > (which is discouraged, but entirely possible!)...
// > ...then the data may be accessible by the *next user*
//
// since Sunburn uses no SSR, shared global state is easier

export const drawerState = $state({
	instanceID: '',
	serverID: '',
	channelID: '',
	dmID: '',
} as {
	instanceID: string;
	serverID: 'dms' | 'new' | 'settings' | string;
	channelID: string;
	dmID: string;
});
