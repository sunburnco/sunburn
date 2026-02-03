export const pbID = (length = 15) => {
	const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
	let result = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}

	return result;
};
