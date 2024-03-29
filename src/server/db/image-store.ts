import sharp, { ResizeOptions } from 'sharp';
import { prisma } from './prisma.js';

const VALID_MIMES = ['image/jpeg', 'image/png'],
	//get a matching height at a 16:9 aspect ratio for the given width
	scaledResolution = (width: number) => ({ width, height: Math.ceil(width * (9 / 16)) }),
	MAX_RESOLUTION = {
		large: scaledResolution(1280),
		medium: scaledResolution(550),
		small: scaledResolution(120),
	};

class ImageStore {
	version = 1;
	async generate({ image, mimeType, source }: { image: Buffer; mimeType: string; source: string }) {
		const startTime = Date.now();

		if (!VALID_MIMES.includes(mimeType)) {
			throw new Error(`Not a supported MIME type: "${mimeType}"!`);
		}

		const data = {
			original: image,
			source,
			...(await this.resize(image)),
		};

		const { id } = await prisma.image.create({
			data,
			select: {
				id: true,
			},
		});

		console.log(`ImageStore: generated image in ${Date.now() - startTime} milliseconds`);
		return id;
	}

	async resize(image: Buffer) {
		type Size = keyof typeof MAX_RESOLUTION;

		async function resizedImage(size: Size) {
			const getResizeOptions = (size: Size): ResizeOptions => ({ fit: 'inside', ...MAX_RESOLUTION[size] });

			return await sharp(image).resize(getResizeOptions(size)).toFormat('webp').toBuffer();
		}
		return {
			large: await resizedImage('large'),
			medium: await resizedImage('medium'),
			small: await resizedImage('small'),
			generationVersion: this.version,
		};
	}

	async get(id: string, size: string) {
		if (!Object.hasOwnProperty.call(MAX_RESOLUTION, size)) {
			throw new Error(`ImageStore: invalid size specified "${size}`);
		}

		//todo regenerate if the version is old

		const image = await prisma.image.findFirst({
			where: { id },
			select: {
				[size]: true,
				source: true,
			},
		});

		return {
			image: image[size as keyof typeof image],
			source: image.source as string,
		};
	}

	async delete(id: string) {
		console.log(`removing image ${id}`);
		await prisma.image.delete({ where: { id } });
	}
}

export const imageStore = new ImageStore();
