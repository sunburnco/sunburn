import type { Attachment } from 'svelte/attachments';

export const createStaydown = (opts?: {
	pauseOnUserScroll?: boolean;
	unlocked?: boolean;
}): Attachment => {
	return (el: Element) => {
		const scroll = () => {
			el.scrollTo({
				top: el.scrollHeight,
				left: el.scrollWidth,
				behavior: 'instant'
			});
		};
		const resizeObserver = new ResizeObserver(scroll);
		const mutationObserver = new MutationObserver(scroll);

		const observeAll = () => {
			for (const child of el.children) {
				resizeObserver.observe(child);
			}
			mutationObserver.observe(el, { childList: true, subtree: true });
		};

		observeAll();

		const handleScroll = () => {
			if (el.scrollTop + el.clientHeight < el.scrollHeight) {
				mutationObserver.disconnect();
				resizeObserver.disconnect();
			} else {
				observeAll();
			}
		};

		if (opts?.pauseOnUserScroll) {
			el.addEventListener('scroll', handleScroll);
		}

		const unlock = () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
		};

		const lock = () => {
			observeAll();
		};

		if (opts?.unlocked) {
			unlock();
		} else if (opts?.unlocked === false) {
			lock();
		}

		return () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
			el.removeEventListener('scroll', handleScroll);
		};
	};
};
