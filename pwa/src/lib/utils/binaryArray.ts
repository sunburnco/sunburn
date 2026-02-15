export const binaryInsert = <T extends { created?: string }>(item: T, arr: T[]) => {
	if (!item.created) {
		return;
	}

	const itemTS = new Date(item.created);

	let low = 0;
	let high = arr.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		const midCreated = arr[mid].created;
		if (!midCreated) {
			return;
		}
		const midTS = new Date(midCreated);

		if (midTS < itemTS) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	arr.splice(low, 0, item);
};

export const binaryUpdateOrInsert = <T extends { id: string; created?: string }>(
	item: T,
	arr: T[] | undefined,
) => {
	if (!item.created || !arr) {
		return;
	}

	const itemTS = new Date(item.created);

	let low = 0;
	let high = arr.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		const midCreated = arr[mid].created;
		if (!midCreated) {
			return;
		}
		const midTS = new Date(midCreated);

		if (arr[mid].id === item.id) {
			arr[mid] = item;
			return;
		}

		if (midTS < itemTS) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	arr.splice(low, 0, item);
};

export const binaryDelete = <T extends { id: string; created?: string }>(item: T, arr: T[]) => {
	if (!item.created) {
		return;
	}

	const itemTS = new Date(item.created);

	let low = 0;
	let high = arr.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		const midCreated = arr[mid].created;
		if (!midCreated) {
			return;
		}
		const midTS = new Date(midCreated);

		if (arr[mid].id === item.id) {
			arr.splice(mid, 1);
			return;
		}

		if (midTS < itemTS) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
};
