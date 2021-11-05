import type { Prisma, Candidate, CandidateImage } from '@prisma/client';

export type Race = Prisma.RaceGetPayload<{
	include: {
		candidates: true;
		candidateImages: true;
		votes: true;
	};
}>;

export type VoteDirection = false | 'up' | 'down';

export interface MaskedCandidate extends Omit<Candidate, 'votes'> {
	//markdown rendered notes, keep the original around for editing
	notesRendered: string;
	votedUp: string[];
	votedDown: string[];
	//the votes are only necessary in votedUp/votedDown, these big 'votes'
	//arrays otherwise complicate and bloat the diffs sent over the socket
	votes: undefined;
	voted?: VoteDirection;
	created?: boolean;
	// used to mark a candidate as having been deleted when sorting is locked,
	// to be actually removed from the candidate list once it's unlocked
	deleted?: boolean;
}

export interface MaskedRace extends Omit<Race, 'votes'> {
	candidates: MaskedCandidate[];
	votes: undefined;
}

export type VoterData = MaskedRace[];

export type CandidateImages = CandidateImage[];
