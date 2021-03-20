import {AppRequest} from "../types";
import {Router, Response} from 'express';
import {imageStore} from "../db/image-store";
import {voterBooker} from "../db/booker";

const router = Router();

async function respondWithImage({req, res, allowed}: {req: AppRequest, res: Response, allowed: boolean}) {
	if (allowed) {
		const {size, id} = req.params;
		const image = await imageStore.get(id, size);

		res.header('Content-Type', 'image/webp');
		res.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 7}`); //one week
		res.send(image);
	}
	else {
		res.send(null);
	}
}

router.get('/image/voter/:id/:size', async (req: AppRequest, res: Response) => {
	await respondWithImage({
		req, res,
		allowed: await voterBooker.check(req.user.id, 'view')
	});
});

module.exports = router;
