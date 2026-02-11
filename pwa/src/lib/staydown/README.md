# Staydown - Keep the Chat Window Down

## Credit

https://github.com/kizivat/svelte-autoscroll

## Purpose

This package is responsible for keeping chat windows scrolled to the bottom, unless the user scrolls up.

## Usage

```svelte
<div class="overflow-y-scroll" {@attach createStaydown({ pauseOnUserScroll: true })}>
	<div>item 1</div>
	<div>item 2</div>
	<div>item 3</div>
	<div>item 4</div>
	<div>item 5</div>
	...
</div>
```

`createStayDown()` also accepts an `unlocked` option that can be used to programatically lock or unlock scrolling, such as when jumping to an older message or clicking a "jump to bottom" button.
