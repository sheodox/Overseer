import { tags as formatTags } from '../../shared/formatters.js';
import { prisma } from './prisma.js';
import Ajv from 'ajv';
import { imageStore } from './image-store.js';
import type { EchoItemEditable, EchoServerData } from '../../shared/types/echo';
const ajv = new Ajv();

const validateUserEditableEchoData = ajv.compile({
	type: 'object',
	properties: {
		tags: { type: 'string' },
		name: { type: 'string', minLength: 1, maxLength: 100 },
		notes: { type: 'string' },
	},
	required: ['name'],
	additionalProperties: false,
});

const validateEchoServerData = ajv.compile({
	type: 'object',
	properties: {
		size: { type: 'number' },
	},
	required: ['size'],
	additionalProperties: false,
});

class Echo {
	/**
	 * Get a list of all games available.
	 */
	async list() {
		return (await prisma.echo.findMany({ include: { images: true } })).sort((a, b) => {
			//prisma doesn't yet support case insensitive sorting, so we need to make up for it
			const aName = a.name.toLowerCase(),
				bName = b.name.toLowerCase();
			if (aName > bName) {
				return 1;
			} else if (aName < bName) {
				return -1;
			}
			return 0;
		});
	}
	async new(newData: EchoItemEditable, userId: string) {
		if (!validateUserEditableEchoData(newData)) {
			throw new Error('Data validation error!');
		}

		function cleanTags(tags: string) {
			return formatTags(tags).join(', ');
		}

		//make sure tags are an array of trimmed strings, will convert it if it's comma separated just like it'd come directly from the upload form
		if (newData.tags) {
			newData.tags = cleanTags(newData.tags);
		}

		const data = {
			notes: newData.notes,
			tags: newData.tags,
			name: newData.name,
			uploading: true,
			initialUploaderId: userId,
			lastUploaderId: userId,
		};

		return await prisma.echo.create({ data });
	}
	async delete(id: string) {
		const images = await prisma.echoImage.findMany({
			where: { echoId: id },
			select: { imageId: true },
		});
		const itemDelete = prisma.echo.delete({
				where: { id },
			}),
			imagesDelete = prisma.echoImage.deleteMany({
				where: { echoId: id },
			});

		await prisma.$transaction([imagesDelete, itemDelete]);
		await Promise.all(images.map((image) => imageStore.delete(image.imageId)));
	}

	async getItem(id: string) {
		return await prisma.echo.findUnique({
			where: { id },
		});
	}

	/**
	 * Overwrite editable information about a game
	 * @returns {Promise<*>}
	 */
	async update(id: string, data: Partial<EchoItemEditable>) {
		if (!validateUserEditableEchoData(data)) {
			throw new Error('Validation error!');
		}

		return await prisma.echo.update({
			where: { id },
			data,
		});
	}

	async updateFile(id: string, data: Partial<EchoItemEditable>) {
		if (!validateUserEditableEchoData(data)) {
			throw new Error('Validation error!');
		}

		return await prisma.echo.update({
			where: { id },
			data: {
				...data,
				updatedAt: new Date(),
				uploading: true,
			},
		});
	}

	async uploadFinished(id: string, data: EchoServerData) {
		if (!validateEchoServerData(data)) {
			throw new Error('Validation error!');
		}
		return prisma.echo.update({
			where: { id },
			data: {
				...data,
				uploading: false,
			},
		});
	}
	/**
	 * Increment download count
	 */
	async downloaded(id: string) {
		await prisma.echo.update({
			where: {
				id,
			},
			data: {
				downloads: { increment: 1 },
			},
		});
	}

	async uploadImage(echoId: string, creatorId: string, image: Buffer, mimeType: string) {
		//before trying to generate an image make sure this echo item exists.
		//we won't be able to make the echoImage because of the foreign key constraint
		//but we'd still be generating images that are immediately orphaned
		await prisma.echo.findUnique({
			where: { id: echoId },
			rejectOnNotFound: true,
		});

		const imageId = await imageStore.generate({
			image,
			mimeType,
			source: 'echo',
		});

		await prisma.echoImage.create({
			data: {
				echoId,
				creatorId,
				imageId,
			},
		});
	}
	async deleteImage(echoImageId: string) {
		const echoImage = await prisma.echoImage.delete({
			where: {
				id: echoImageId,
			},
		});
		await imageStore.delete(echoImage.imageId);
	}
}

export const echo = new Echo();
