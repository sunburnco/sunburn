// c/o Vandesh on SO https://stackoverflow.com/a/66239174

export const parseInitials = (fullName: string) => {
	const allNames = fullName.trim().split(' ');
	const initials = allNames.reduce((acc, curr, index) => {
		if (index === 0 || index === allNames.length - 1) {
			acc = `${acc}${curr.charAt(0).toUpperCase()}`;
		}
		return acc;
	}, '');
	return initials;
};
