import fs from 'fs/promises';
import path from 'path';

let cachedManifest: any;

async function loadManifest() {
	const manifestPath = path.join(process.cwd(), 'public/manifest.json');

	if (process.env.NODE_ENV === 'production') {
		if (!cachedManifest) {
			cachedManifest = JSON.parse((await fs.readFile(manifestPath)).toString());
		}
		return cachedManifest;
	}
	//reload every time for development
	return JSON.parse((await fs.readFile(manifestPath)).toString());
}

export async function getManifest(entryPath: string) {
	const manifest = await loadManifest();

	const entry = manifest[entryPath],
		css = [...entry.css],
		{ imports } = entry;

	// script imports are loaded automatically via es imports, but we
	// need to figure out all of the dependent styles for all imports
	for (const imp of imports) {
		manifest[imp].css.forEach((importCss: string) => {
			css.push(importCss);
		});
	}
	return {
		scriptEntryFile: entry.file,
		cssImports: css,
	};
}
