const StockPile = require('../db/stockpile'),
	sharp = require('sharp');

const VALID_MIMES = ['image/jpeg', 'image/png'],
	//get a matching height at a 16:9 aspect ratio for the given width
	scaledResolution = width => ({width, height: Math.ceil(width * (9/16))}),
	MAX_RESOLUTION = {
		large: scaledResolution(1280),
		medium: scaledResolution(550),
		small: scaledResolution(120)
	};

class ImageStore extends StockPile {
	constructor() {
		super({
			db: 'thumbnails',
			tables: [
				{name: 'thumbnails', columns: {
						id: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
						//content type of the image, image/jpeg or image/png
						image_type: 'TEXT NOT NULL',
						//image data blobs, at various sizes
						image_large: 'BLOB',
						image_medium: 'BLOB',
						image_small: 'BLOB',
						//identifying information for the place this came from, like a candidate ID on voter
						source_id: 'TEXT NOT NULL UNIQUE'
					}}
			]
		});
	}

	//something that identifies both where the image came from, and what image this corresponds to there
	_toSourceId(source, sourceKey) {
		return `${source}-${sourceKey}`;
	}

	/**
	 * Get an array of source IDs that are missing thumbnails, given a bunch of sourceIDs
	 * @param {string} source - where this image is for on Overseer
	 * @param {string[]} sourceKeys - array of source IDs
	 * @returns {Promise<string[]>}
	 */
	async findMissingThumbnails(source, sourceKeys) {
		const populatedIds = (await this.all(`SELECT source_id FROM thumbnails`) || []).map(obj => obj.source_id);
		return sourceKeys.filter(key => {
			return !populatedIds.includes(this._toSourceId(source, key));
		});
	}

	/**
	 * Generate an image
	 * @param image
	 * @param image_type
	 * @param source_id
	 * @returns {Promise<{error: string}|{}>}
	 */
	async generate({image, image_type, source, source_key}) {
		const startTime = Date.now(),
			source_id = this._toSourceId(source, source_key);

		if (!VALID_MIMES.includes(image_type)) {
			throw new Error(`Not a supported MIME type: "${image_type}"!`)
		}
		if (!source || !source_key) {
			throw new Error(`Must specify both a 'source' and a 'source_key' to generate a thumbnail!`);
		}

		const map = this.buildInsertMap({
			source_id, image_type, image_large: image
		}, 'thumbnails');
		this.run(`INSERT INTO thumbnails ${map.sql}`, map.values);

		const getResizeOptions = size => ({fit: 'inside', ...MAX_RESOLUTION[size]}),
			sizes = Object.keys(MAX_RESOLUTION);

		for (const size of sizes) {
			const resized = await sharp(image)
				.resize(getResizeOptions(size))
				.toBuffer();

			await this.run(`UPDATE thumbnails SET image_${size}=? WHERE source_id=?`, [resized, source_id]);
		}

		console.log(`Thumnails: generated thumbnails for ${source_id} in ${Date.now() - startTime} milliseconds`);
		return {};
	}

	async getImage(size, source, source_key){
		if (!MAX_RESOLUTION.hasOwnProperty(size)) {
			throw new Error(`Thumbnails: invalid size specified "${size}`);
		}

		return this.get(`SELECT image_${size}, image_type FROM thumbnails WHERE source_id=?`, [this._toSourceId(source, source_key)])
	}

	async removeThumbnails(source, source_key) {
		console.log(`removing thumbnail for ${source}-${source_key}`);
		await this.run(`DELETE FROM thumbnails WHERE source_id=?`, [this._toSourceId(source, source_key)]);
	}
}

module.exports = new ImageStore();

