import { debugPrefix, warnPrefix } from '$lib/logPrefixes';
import {
	activeWindowID,
	bringIDToTop,
	moveIDToBottom,
	rndWindows,
	saveRNDWindows,
	windowExtrema
} from '$lib/rnd/rndState.svelte';
import { spawnCreateServerWindow } from '$lib/rnd/spawn/spawnCreateServerWindow';
import { spawnLoginWindow } from '$lib/rnd/spawn/spawnLoginWindow';
import { spawnLogoutWindow } from '$lib/rnd/spawn/spawnLogoutWindow';
import { spawnMultiDMWindow } from '$lib/rnd/spawn/spawnMultiDMWindow';
import { spawnServerPickerWindow } from '$lib/rnd/spawn/spawnServerPickerWindow';
import { sunburn } from '$lib/sunburn.svelte';
import { clamp } from '$lib/utils/clamp';
import { handleAtHost } from '$lib/utils/username';

import { openLocalSettingsWindowCommand } from './commandOpenLocalSettingsWindow';

const noAutoFills = async () => [];

// TODO refactor this into individual files

export type Arg_t = {
	// value will be displayed unless `display` is provided, in which case `display` will be provided
	// value will be passed into `args`
	value: string;
	display?: string;
};

export type KBarCommand_t = {
	// TODO add colors?
	// fuzzy search will search this
	// example: "DM", "Add Account"
	// once the base command is chosen, argument population will start
	title: string;
	description: string;

	// each command has zero or more args
	args: {
		// name and description show up at the top of the options
		name: string;
		description?: string;
		prefix?: string;
		suffix?: string;

		// whether to accept an undefined number of arguments, and, if so, how many
		// e.g. "Assign Role" "role1" "user1" "user2" "user3"
		//                     idx0    idx1    idx2    idx3
		// undefined = not variadic
		// 0 = 0 or more arguments
		// 1 = 1 or more arguments
		// 2 = 2 or more...
		// only the last argument of the command can be variadic
		variadic?: number;

		// this is called when it is this argument's turn to be filled
		// it can be used to load available autofill options (e.g. load servers the user is part of, or load channels the user is able to see in a server)
		// `args` is the current list of args the user has supplied
		loadAutofills: (...args: string[]) => Promise<Arg_t[]>;
	}[];

	// called when the user submits the command
	callback: (...args: string[]) => void;
};

export const countRequiredArguments = (command: KBarCommand_t | null) => {
	if (!command) {
		return Infinity;
	}

	const ret = command.args.length;
	if (ret === 0) {
		return 0;
	}

	const variadicCount = command.args[command.args.length - 1].variadic;
	if (variadicCount === undefined) {
		return ret;
	} else {
		// subtract 1 to account for last command being optional
		return ret + (variadicCount - 1);
	}
};

const addAccountCommand: KBarCommand_t = {
	title: 'Add Account',
	description: 'Log in to an account on this client',
	args: [],
	callback: spawnLoginWindow
};

const logOutCommand: KBarCommand_t = {
	title: 'Log Out',
	description: 'Log out and remove an account on this client',
	args: [
		{
			name: 'Account',
			description: 'Choose an account',
			prefix: 'of',
			loadAutofills: async () =>
				Object.keys(sunburn.auths).map((authID) => ({
					display: handleAtHost(authID, authID),
					value: authID
				}))
		}
	],
	callback: (...args) => {
		if (args.length >= 1) {
			spawnLogoutWindow(args[0]);
		}
	}
};

const changeThemeCommand: KBarCommand_t = {
	title: 'Set Theme',
	description: 'Set the global application theme',
	args: [
		{
			name: 'Theme',
			prefix: 'to',
			loadAutofills: async () => [
				{
					display: 'Night (Dark)',
					value: 'sunburn-night'
				},
				{
					display: 'Day (Light)',
					value: 'sunburn-day'
				},
				{
					display: 'Sunset (Colored/Dark)',
					value: 'sunburn-sunset'
				},
				{
					display: 'Oasis (Colored/Light)',
					value: 'sunburn-oasis'
				},
				{
					display: 'Verdant (Colored/Dark)',
					value: 'sunburn-verdant'
				},
				{
					display: 'Lilac (Colored/Light)',
					value: 'sunburn-lilac'
				}
			]
		}
	],
	callback: (...args) => {
		if (args.length > 0) {
			document.documentElement.setAttribute('data-theme', args[0]);
			localStorage.setItem('theme', args[0]);
		}
	}
};

const setWindowDimensionsCommand: KBarCommand_t = {
	title: 'Set Window Dimensions',
	description: "Set the active window's width and height",
	args: [
		{
			name: 'Width',
			prefix: 'to',
			suffix: 'px ',
			loadAutofills: noAutoFills
		},
		{
			name: 'Height',
			prefix: 'by',
			suffix: 'px',
			loadAutofills: noAutoFills
		}
	],
	callback: (...args) => {
		if (!activeWindowID.id) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				'skipping window dimensions command because there is no active window'
			);
			return;
		}
		if (args.length >= 2) {
			let width = Number(args[0]);
			if (Number.isNaN(width)) {
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					'skipping window width because',
					args[0],
					'could not be parsed as a number'
				);
			}
			let height = Number(args[1]);
			if (Number.isNaN(height)) {
				// eslint-disable-next-line no-console
				console.warn(
					...warnPrefix,
					'skipping window height because',
					args[1],
					'could not be parsed as a number'
				);
			}

			width = clamp(
				windowExtrema[rndWindows[activeWindowID.id].data.t].minW,
				width,
				windowExtrema[rndWindows[activeWindowID.id].data.t].maxW
			);
			height = clamp(
				windowExtrema[rndWindows[activeWindowID.id].data.t].minH,
				height,
				windowExtrema[rndWindows[activeWindowID.id].data.t].maxH
			);

			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, 'setting active window dimensions to', width, 'x', height);

			rndWindows[activeWindowID.id].w = width;
			rndWindows[activeWindowID.id].h = height;
		}
	}
};

const setWindowThemeCommand: KBarCommand_t = {
	title: 'Set Window Theme',
	description: "Set the active window's theme",
	args: [
		{
			name: 'Theme',
			prefix: 'to',
			loadAutofills: async () => [
				{
					display: 'Sync (Reset)',
					value: ''
				},
				{
					display: 'Night (Dark)',
					value: 'sunburn-night'
				},
				{
					display: 'Day (Light)',
					value: 'sunburn-day'
				},
				{
					display: 'Sunset (Colored/Dark)',
					value: 'sunburn-sunset'
				},
				{
					display: 'Oasis (Colored/Light)',
					value: 'sunburn-oasis'
				},
				{
					display: 'Verdant (Colored/Dark)',
					value: 'sunburn-verdant'
				},
				{
					display: 'Lilac (Colored/Light)',
					value: 'sunburn-lilac'
				}
			]
		}
	],
	callback: (...args) => {
		if (!activeWindowID.id) {
			// eslint-disable-next-line no-console
			console.debug(
				...debugPrefix,
				'skipping window dimensions command because there is no active window'
			);
			return;
		}
		if (args.length > 0) {
			// eslint-disable-next-line no-console
			console.debug(...debugPrefix, 'setting active window theme to', args[0]);

			rndWindows[activeWindowID.id].theme = !args[0] ? undefined : args[0];
			saveRNDWindows();
		}
	}
};

const openMultiDMWindowCommand: KBarCommand_t = {
	title: 'Open DM List',
	description: 'Open a window with all recent DMs, including the option to DM someone new',
	args: [
		{
			name: 'Account',
			prefix: 'for',
			loadAutofills: async () =>
				Object.keys(sunburn.clients).map((clientID) => ({
					display: handleAtHost(clientID, clientID),
					value: clientID
				}))
		}
	],
	callback: (...args) => {
		if (args.length > 0) {
			spawnMultiDMWindow(args[0]);
		}
	}
};

const reorderWindowCommand: KBarCommand_t = {
	title: 'Restack Active Window',
	description: 'Change the z-index (order) of the active window to move it up or down',
	args: [
		{
			name: 'Direction',
			prefix: 'to the',
			loadAutofills: async () => [
				{
					display: 'Top',
					value: 'top'
				},
				{
					display: 'Bottom',
					value: 'bottom'
				}
			]
		}
	],
	callback: (...args) => {
		if (args.length > 0) {
			if (args[0] === 'top') {
				bringIDToTop(activeWindowID.id);
			} else if (args[0] === 'bottom') {
				moveIDToBottom(activeWindowID.id);
			}
		}
	}
};

const openCreateServerWindowCommand: KBarCommand_t = {
	title: 'Create Server',
	description: 'Open the form to create a new server',
	args: [
		{
			name: 'Account',
			prefix: 'for',
			loadAutofills: async () =>
				Object.keys(sunburn.clients).map((clientID) => ({
					display: handleAtHost(clientID, clientID),
					value: clientID
				}))
		}
	],
	callback: (...args) => {
		if (args.length > 0) {
			spawnCreateServerWindow(args[0]);
		}
	}
};

const openServerPickerWindowCommand: KBarCommand_t = {
	title: 'Open Server Picker',
	description: 'Open the most classic IM view -- a window with all servers an account is part of',
	args: [
		{
			name: 'Account',
			prefix: 'for',
			loadAutofills: async () =>
				Object.keys(sunburn.clients).map((clientID) => ({
					display: handleAtHost(clientID, clientID),
					value: clientID
				}))
		}
	],
	callback: (...args) => {
		if (args.length > 0) {
			spawnServerPickerWindow(args[0]);
		}
	}
};

export const commands = [
	addAccountCommand,
	changeThemeCommand,
	logOutCommand,
	openCreateServerWindowCommand,
	openMultiDMWindowCommand,
	openServerPickerWindowCommand,
	reorderWindowCommand,
	setWindowDimensionsCommand,
	setWindowThemeCommand,
	openLocalSettingsWindowCommand
];
