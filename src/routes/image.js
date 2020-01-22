const voterBooker = require('../db/voterbooker'),
	imageStore = require('../util/imagestore'),
	router = require('express').Router();

async function respondWithImage({req, res, source, allowed}) {
	if (allowed) {
		const {size, source_key} = req.params;
		const imageData = await imageStore.getImage(size, source, source_key);

		if (imageData.image_type) {
			res.header('Content-Type', imageData.image_type);
		}
		res.send(imageData[`image_${size}`]);
	}
	else {
		res.send(null);
	}
}

router.get('/image/voter/:size/:source_key', async (req, res) => {
	await respondWithImage({
		req, res,
		source: 'voter',
		allowed: await voterBooker.check(req.user.user_id, 'view')
	});
});

module.exports = router;
