import {tags as formatTags} from '../../shared/formatters';
import {prisma} from "./prisma";
import {Prisma} from '@prisma/client';
import Ajv from 'ajv';
const ajv = new Ajv();

type EchoItem = Prisma.EchoGetPayload<{}>

type EditableEchoData = Pick<EchoItem, 'tags' | 'name' | 'notes'>;
type EchoServerData = Pick<EchoItem, 'size'>

const validateUserEditableEchoData = ajv.compile({
    type: 'object',
    properties: {
        tags: {type: 'string'},
        name: {type: 'string', minLength: 1, maxLength: 100},
        notes: {type: 'string'},
    },
    required: ['name'],
    additionalProperties: false
});

const validateEchoServerData = ajv.compile({
    type: 'object',
    properties: {
        size: {type: 'number'}
    },
    required: ['size'],
    additionalProperties: false
})

class Echo {
    constructor() {}

    /**
     * Get a list of all games available.
     * @returns {Promise<void>}
     */
    async list() {
        return (await prisma.echo.findMany()).sort((a, b) => {
            //prisma doesn't yet support case insensitive sorting, so we need to make up for it
            const aName = a.name.toLowerCase(),
                bName = b.name.toLowerCase();
            if (aName > bName) {
                return 1;
            }
            else if (aName < bName) {
                return -1;
            }
            return 0;
        });
    }
    async new(newData: EditableEchoData, userId: string) {
        console.log('New echo item adding');
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
        }

        return await prisma.echo.create({data});
    }
    async delete(id: string) {
        await prisma.echo.delete({
            where: {id}
        });
    }

    async getItem(id: string) {
        return await prisma.echo.findUnique({
            where: {id}
        });
    }

    /**
     * Overwrite editable information about a game
     * @returns {Promise<*>}
     */
    async update(id: string, data: Partial<EchoItem>) {
        console.log(data);
        if (!validateUserEditableEchoData(data)) {
            throw new Error('Validation error!');
        }

        return await prisma.echo.update({
            where: {id},
            data
        });
    }

    async updateFile(id: string, data: Partial<EchoItem>) {
        if (!validateUserEditableEchoData(data)) {
            throw new Error('Validation error!');
        }

        return await prisma.echo.update({
            where: {id},
            data: {
                ...data,
                updatedAt: new Date(),
                uploading: true
            }
        });
    }

    async uploadFinished(id: string, data: EchoServerData) {
        if (!validateEchoServerData(data)) {
            throw new Error('Validation error!');
        }
        return prisma.echo.update({
            where: {id},
            data: {
                ...data,
                uploading: false
            }
        })
    }
    /**
     * Increment download count
     */
    async downloaded(id: string) {
        await prisma.echo.update({
            where: {
                id
            },
            data: {
                downloads: {increment: 1}
            }
        })
    }
}

export const echo = new Echo();