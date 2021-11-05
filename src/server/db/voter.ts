import { prisma } from './prisma.js';
import { imageStore } from './image-store.js';
import { name as validName, href as validHref } from '../util/validator.js';

class Voter {
	constructor() {}

	//trim and remove all unnecessary spaces
	static cleanString(str: string) {
		return String(str)
			.trim()
			.replace(/\s{2,}/g, ' ');
	}

	async list() {
		const races = await prisma.race.findMany({
			include: {
				candidates: true,
				candidateImages: true,
				votes: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
		});

		return races;
	}

	async addRace(raceName: string, creatorId: string) {
		raceName = Voter.cleanString(raceName);

		if (validName(raceName)) {
			return await prisma.race.create({
				data: {
					name: raceName,
					creatorId,
				},
			});
		}
		return { error: 'Invalid name!' };
	}
	async getCandidateCreator(candidateId: string) {
		const candidate = await prisma.candidate.findUnique({
			where: { id: candidateId },
		});
		return candidate.creatorId;
	}
	async getRaceById(raceId: string) {
		return prisma.race.findUnique({ where: { id: raceId } });
	}
	async removeRace(raceId: string) {
		const raceWhere = { where: { raceId } },
			deleteVotes = prisma.vote.deleteMany(raceWhere),
			deleteCandidateImages = prisma.candidateImage.deleteMany(raceWhere),
			deleteCandidates = prisma.candidate.deleteMany(raceWhere),
			deleteRace = prisma.race.delete({ where: { id: raceId } });

		await prisma.$transaction([deleteVotes, deleteCandidateImages, deleteCandidates, deleteRace]);
	}
	async renameRace(raceId: string, name: string) {
		if (validName(name)) {
			return await prisma.race.update({
				where: { id: raceId },
				data: { name },
			});
		}
		return { error: 'Invalid name!' };
	}
	async addCandidate(raceId: string, name: string, creatorId: string) {
		name = Voter.cleanString(name);

		//ensure we're not adding duplicates for this race
		const existing = await prisma.candidate.findUnique({
			where: {
				raceId_name: {
					raceId,
					name,
				},
			},
		});

		if (validName(name) && !existing) {
			return await prisma.candidate.create({
				data: {
					raceId,
					name,
					creatorId,
					notes: '',
				},
			});
		} else if (existing) {
			return { error: 'Something with that name already exists!' };
		} else {
			return { error: 'Invalid name!' };
		}
	}
	async removeCandidate(candidateId: string) {
		const candidateWhere = { where: { candidateId } },
			deleteVotes = prisma.vote.deleteMany(candidateWhere),
			deleteCandidateImages = prisma.candidateImage.deleteMany(candidateWhere),
			deleteCandidates = prisma.candidate.deleteMany({ where: { id: candidateId } });

		await prisma.$transaction([deleteVotes, deleteCandidateImages, deleteCandidates]);
	}
	async vote(candidateId: string, userId: string, direction: string) {
		if (direction !== 'up' && direction !== 'down') {
			return;
		}

		// retrieve the raceId directly to make sure we actually get the race that matches this candidate
		const race = await prisma.candidate.findUnique({
			where: { id: candidateId },
		});

		await prisma.vote.upsert({
			where: {
				candidateId_userId: {
					candidateId,
					userId,
				},
			},
			create: {
				raceId: race.raceId,
				candidateId,
				userId,
				direction,
			},
			update: {
				direction,
			},
		});
	}
	async clearVote(candidateId: string, userId: string) {
		await prisma.vote.delete({
			where: {
				candidateId_userId: {
					candidateId,
					userId,
				},
			},
		});
	}
	async resetVotes(raceId: string) {
		await prisma.vote.deleteMany({
			where: {
				raceId,
			},
		});
	}
	async uploadImage(candidateId: string, creatorId: string, image: Buffer, mimeType: string) {
		const candidate = await prisma.candidate.findUnique({
				where: { id: candidateId },
				//make sure this candidate still exists before generating any images
				rejectOnNotFound: true,
			}),
			imageId = await imageStore.generate({
				image,
				mimeType,
				source: 'voter',
			});
		await prisma.candidateImage.create({
			data: {
				raceId: candidate.raceId,
				candidateId,
				creatorId,
				imageId,
			},
		});
	}
	async removeImage(candidateImageId: string) {
		const candidateImage = await prisma.candidateImage.delete({
			where: {
				id: candidateImageId,
			},
		});
		await imageStore.delete(candidateImage.imageId);
	}
	async updateCandidate(candidateId: string, name: string, notes: string) {
		name = Voter.cleanString(name);

		if (validName(name)) {
			return await prisma.candidate.update({
				where: { id: candidateId },
				data: {
					name,
					notes,
				},
			});
		}
		return {
			error: 'Invalid name!',
		};
	}
}

export const voter = new Voter();
