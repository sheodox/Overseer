const fs = require('fs').promises;
import path from "path";

export async function getManifest() {
    const manifestPath = path.join(process.cwd(), 'public/manifest.json');

    if (process.env.NODE_ENV === 'production') {
        return require(manifestPath);
    }
    //reload every time for development
    return JSON.parse((await fs.readFile(manifestPath)).toString());
}
