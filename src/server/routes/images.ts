import { Router } from 'express';
import { imageStore } from '../db/image-store';
import { echoBooker, voterBooker } from '../db/booker';
import { safeAsyncRoute } from '../util/error-handler';
import { appLogger } from '../util/logger';

const router = Router(),
	//a mapping of a 'source' as stored in the image table to the booker for which it matches,
	//this is used when serving images to check if the user actually has the permissions to
	//view images for the page this image came from
	bookersWithImages = {
		echo: echoBooker,
		voter: voterBooker,
	};

router.get(
	'/image/:id/:size',
	safeAsyncRoute(async (req, res, next) => {
		const { size, id } = req.params;

		let image, imageSource;
		try {
			const imageData = await imageStore.get(id, size);
			image = imageData.image;
			imageSource = imageData.source;
		} catch (e) {
			res.status(404);
			res.send('Image not found!');
		}

		//check to make sure the user has permission to view an image from where this came from
		const booker = bookersWithImages[imageSource as keyof typeof bookersWithImages];
		if (!booker) {
			appLogger.error(`No booker found for source "${imageSource}"`, {
				imageId: id,
			});
			return;
		}
		const allowed = await booker.check(req.user.id, 'view');

		if (allowed) {
			res.header('Content-Type', 'image/webp');
			res.send(image);
		} else {
			next({
				status: 403,
			});
		}
	})
);

module.exports = router;
