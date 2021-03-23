import {MaskedUser, users} from '../db/users';
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

// the database stores just 'up' or 'down', but the non-existence of a vote for this user gives us false here
type VoteDirection = false | 'up' | 'down';

interface MaskedCandidate extends Candidate {
    creator: MaskedUser,
    created: boolean,
    //markdown rendered notes, keep the original around for editing
    notesRendered: string,
    voted: VoteDirection,
    votedUp: MaskedUser[],
    votedDown: MaskedUser[]
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
            const originalVotedUp = race.votes.filter(candidateVotes(candidate.id, 'up')).map(getUserFromVote),
                originalVotedDown = race.votes.filter(candidateVotes(candidate.id, 'down')).map(getUserFromVote),
                creatorId = candidate.creatorId;

            let voted: VoteDirection = false;
            if (originalVotedUp.includes(userId)) {
                voted = 'up'
            }
            else if (originalVotedDown.includes(userId)) {
                voted = 'down'
            }

            maskedCandidates.push({
                ...candidate,
                creator: (await users.getMasked([creatorId]))[0],
                created: creatorId === userId,
                notesRendered: md.render(candidate.notes),
                voted: voted,
                votedUp: await users.getMasked(originalVotedUp),
                votedDown: await users.getMasked(originalVotedDown),
                creatorId: undefined
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
