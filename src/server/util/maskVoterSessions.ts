import {Prisma, Candidate, Vote} from '@prisma/client';
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

type Race = Prisma.RaceGetPayload<{
    include: {
        candidates: true,
        candidateImages: true,
        votes: true,
    }
}>;

interface MaskedCandidate extends Candidate {
    //markdown rendered notes, keep the original around for editing
    notesRendered: string,
    votedUp: string[],
    votedDown: string[]
}
interface MaskedRace extends Race {
    candidates: MaskedCandidate[]
}

export const maskVoterSessions = async (races: Race[], userId: string): Promise<MaskedRace[]> => {
    races = JSON.parse(JSON.stringify(races));
    const maskedRaces: MaskedRace[] = [];

    function getUserFromVote(vote: Vote) {
        return vote.userId;
    }

    function candidateVotes(candidateId: string, direction: 'up' | 'down') {
        return (vote: Vote) => {
            return vote.direction === direction && vote.candidateId === candidateId;
        }
    }

    for (let race of races) {
        const maskedCandidates: MaskedCandidate[] = [];

        for (let candidate of race.candidates) {
            const votedUp = race.votes.filter(candidateVotes(candidate.id, 'up')).map(getUserFromVote),
                votedDown = race.votes.filter(candidateVotes(candidate.id, 'down')).map(getUserFromVote);

            maskedCandidates.push({
                ...candidate,
                notesRendered: md.render(candidate.notes),
                votedUp,
                votedDown,
            })
        }

        maskedRaces.push({
            ...race,
            candidates: maskedCandidates,
            //might mask this in the future, but for now don't expose other people's user IDs
            creatorId: undefined,
        })
    }
    return maskedRaces;
}
