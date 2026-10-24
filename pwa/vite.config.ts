import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter({ fallback: 'index.html' }),
			prerender: {},
			compilerOptions: { warningFilter: (warning) => !warning.code.startsWith('a11y') },
		}),
		devtoolsJson(),
	],
	define: { __SB_VERSION__: JSON.stringify(packageJson.version) },
});
