import type { CallUserID_t } from '#lib/sunburn/call.svelte.ts';

export const callVolumes = $state<Record<CallUserID_t, number>>({});
