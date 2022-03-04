const validNameMinLength = 3,
	validNameMaxLength = 50;

export const name = (name: string) => {
	if (name && typeof name === 'string') {
		//at least a minimum number of non-space characters, alphanumeric with some symbols
		const reg = /^[\w .:|'"\-+&?()<>!*{}$[\]/\\,~]*$/,
			actualCharacters = name.replace(/\s{2,}/g, ''); //get rid of superfluous spacing
		return (
			actualCharacters.length >= validNameMinLength && actualCharacters.length <= validNameMaxLength && reg.test(name)
		);
	}
	return false;
};

export const href = (href: string) => {
	return /^https?:\/\/.+/.test(href);
};
