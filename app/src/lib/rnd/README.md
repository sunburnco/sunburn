# RND - Resize and Drag

## Purpose

This package is responsible for drawing and keeping state for all Sunburn windows.

## Flow

`+page.svelte`

- `WindowArea.svelte`
  - #each `rndWindows.svelte.ts`
    - wrap with `RND.svelte`
      - use if/else to draw window type in `$lib/rnd/windows`
    - wrap with `RND.svelte`
      - use if/else to draw window type in `$lib/rnd/windows`
    - ...

## Adding a Window Type

Follow these steps to create a new window type called `playground`:

1. In `rndState.svelte.ts`, add `TypePlayground_t`
   1. `t` should be the `camelCase` version of your window's type -- in this case, `playground`
   1. Add any other data. For example, if your window should belong to a specific client, you might add `owner: string` and pass the client ID
   1. Optionally add volatile data at the bottom of the file. For example, the video windows (camera and screenshare) have the tracks as volatile data
1. Modify `Window_t["data"]` to include your new type
1. Add the window size constraints to `windowExtrema`
   1. The absolute minimum size should be 32x32
   1. 96x64 is generally a good minimum size
   1. Generally avoid a max size unless the window is temporary in nature (e.g. add account, confirmation dialog)
1. Create the window definition in `windows/`
   1. In this example, create `PlaygroundWindow.svelte`
   1. Consider wrapping the window content in `<WindowBase />`, which contains the styles to auto grow content to fill available window space
1. Create a spawn function in `spawn/`
   1. This step is optional, but it's helpful for getting consistent spawn behavior from multiple places in the UI (buttons, kbar, etc.)
1. Add your window to `WindowArea.svelte` if/else block
   1. Don't forget to pass any custom data as props
