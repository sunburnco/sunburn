# KBar - Central Nav Bar

## Purpose

This package is responsible for the central navigation bar that pops up when the user presses CTRL-K.

## Flow

- KBar modal
  - Command selection
    - Arg input
      - Fetch autocomplete suggestions
    - Arg input
      - Fetch autocomplete suggestions
    - ...
    - Callback with args

Generally, the kbar should call a window `spawn` function

## Adding a Command

Follow these steps to create a new command called `pingpong`:

1. Create a new object in `commands.ts` of type `KBarCommand_t` following the `camelCase` naming convention
   1. In this example, the object is called `pingPongCommand`
1. Set the title and description
1. Set arguments
   1. `prefix` and `suffix` are used when formatting the pending command at the top of the kbar
   1. To use optional arguments or variadic arguments, use the `variadic` option
1. Set the callback
   1. I'm pretty sure there's no need to check the arg count, but I always check just in case
1. Add the command object to `export const commands` at the bottom of `commands.ts`
