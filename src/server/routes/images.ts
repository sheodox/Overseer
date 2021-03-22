import {AppRequest} from "../types";
import {Router, Response} from 'express';
import {imageStore} from "../db/image-store";
import {voterBooker} from "../db/booker";

const router = Router(),
	//a mapping of a 'source' as stored in the image table to the booker for which it matches,
	//this is used when serving images to check if the user actually has the permissions to
	//view images for the page this image came from
	bookersWithImages = {
		voter: voterBooker
	};

router.get('/image/:id/:size', async (req: AppRequest, res: Response) => {
	const {size, id} = req.params;

	let image, imageSource;
	try {
		const imageData = await imageStore.get(id, size);
		image = imageData.image;
		imageSource = imageData.source;
	}
	catch (e) {
		res.status(404);
		res.send('Image not found!');
	}

	//check to make sure the user has permission to view an image from where this came from
	const allowed = await bookersWithImages[imageSource as keyof typeof bookersWithImages].check(req.user.id, 'view');

	if (allowed) {
		res.header('Content-Type', 'image/webp');
		res.send(image);
	}
	else {
		res.status(403)
		res.send(`You don't have permissions to access that image`);
	}
});

module.exports = router;
