import { serialize, deserialize } from 'onaji';
import { Vote } from '@prisma/client';
import type { VoterData, MaskedRace, MaskedCandidate, Race } from '../../shared/types/voter';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

export const maskVoterSessions = async (races: Race[]): Promise<VoterData> => {
	races = deserialize(serialize(races));
	const maskedRaces: MaskedRace[] = [];

	function getUserFromVote(vote: Vote) {
		return vote.userId;
	}

	function candidateVotes(candidateId: string, direction: 'up' | 'down') {
		return (vote: Vote) => {
			return vote.direction === direction && vote.candidateId === candidateId;
		};
	}

	for (const race of races) {
		const maskedCandidates: MaskedCandidate[] = [];

		for (const candidate of race.candidates) {
			const votedUp = race.votes.filter(candidateVotes(candidate.id, 'up')).map(getUserFromVote),
				votedDown = race.votes.filter(candidateVotes(candidate.id, 'down')).map(getUserFromVote);

			maskedCandidates.push({
				...candidate,
				notesRendered: md.render(candidate.notes),
				votedUp,
				votedDown,
				votes: undefined,
			});
		}

		maskedRaces.push({
			...race,
			candidates: maskedCandidates,
			votes: undefined,
		});
	}
	return maskedRaces;
};
