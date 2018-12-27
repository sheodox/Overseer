const Stockpile = require('../db/stockpile'),
    valid = require('./validator');

class VoterTracker extends Stockpile {
    constructor() {
        super({
            db: 'voter',
            tables: [
                {name: 'races', columns: {
                        race_id: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                        race_name: 'TEXT NOT NULL UNIQUE',
                    }},
                {name: 'candidates', columns: {
                        race_id: 'INTEGER NOT NULL',
                        candidate_id: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                        candidate_name: 'TEXT NOT NULL',
                        creator: 'TEXT NOT NULL'
                    }},
                {name: 'votes', columns: {
                        race_id: 'INTEGER NOT NULL',
                        candidate_id: 'INTEGER NOT NULL',
                        user_id: 'TEXT NOT NULL',
                        direction: 'TEXT NOT NULL'
                    }}
            ]
        });
        //cache everything so votes are fast even with slow disk i/o
        this._raceCache = [];
        this._candidateCache = [];
        this._voteCache = [];
    }
    //trim and remove all unnecessary spaces
    static cleanString(str) {
        return String(str).trim().replace(/\s{2,}/g, ' ');
    }

    /**
     * Cache everything so we can do votes/list in memory instead of waiting for the possibly slow db writes
     * @returns {Promise<void>}
     * @private
     */
    async _refreshCache() {
        this._raceCache = await this.all(`SELECT * FROM races`);
        this._candidateCache = await this.all(`SELECT * FROM candidates`);
        this._voteCache = await this.all(`SELECT * FROM votes`);
    }

    /**
     * Get all votes for a specified candidate/direction in a race
     * @param race_id
     * @param candidate_id
     * @param direction
     * @returns {*[]}
     * @private
     */
    _getCachedVotes(race_id, candidate_id, direction) {
        return this._voteCache.filter(vote => {
            return vote.race_id === race_id && vote.candidate_id ===  candidate_id && vote.direction === direction;
        })
    }

    /**
     * Cast a vote in the cache, to be done at the same time as the same db operations.
     * @param race_id
     * @param candidate_id
     * @param user_id
     * @param direction
     * @private
     */
    _castCachedVote(race_id, candidate_id, user_id, direction) {
        const existingIndex = this._voteCache.findIndex(vote => {
                return vote.race_id === race_id && vote.candidate_id ===  candidate_id && vote.user_id === user_id;
            }),
            existing = this._voteCache[existingIndex];
        //just switch the direction of an existing vote
        if (existing && existing.direction !== direction) {
            existing.direction = direction;
        }
        //delete it if the direction is the same (clearing their vote)
        else if (existing && existing.direction === direction) {
            this._voteCache.splice(existingIndex, 1);
        }
        else {
            this._voteCache.push({
                race_id, candidate_id, user_id, direction
            })
        }
    }
    async list() {
        try {
            //if we have nothing in the cache, refresh just in case
            if (!this._voteCache || this._voteCache.length === 0) {
                await this._refreshCache();
            }
            const races = this._raceCache;

            for (let race of races) {
                const candidates = this._candidateCache.filter(candidate => candidate.race_id === race.race_id);
                race.candidates = candidates;

                for (let candidate of candidates) {
                    candidate.votedUp = this._getCachedVotes(race.race_id, candidate.candidate_id, 'up');
                    candidate.votedDown = this._getCachedVotes(race.race_id, candidate.candidate_id, 'down') 
                }
            }

            return races;
        }
        catch(e) {
            console.error(e);
        }
    }

    async addRace(race_name) {
        race_name = VoterTracker.cleanString(race_name);
        if (valid.name(race_name)) {
            const insertMap = this.buildInsertMap({race_name}, 'races');
            await this.run(`INSERT INTO races ${insertMap.sql}`, insertMap.values);
            await this._refreshCache();
            return await this.getRaceByName(race_name);
        }
    }
    async getCandidateCreator(race_id, candidate_id) {
        const data = await this.get(`SELECT creator FROM candidates WHERE race_id=? AND candidate_id=?`, race_id, candidate_id);
        return data ? data.creator : null;
    }
    async getRaceByName(name) {
        return await this.get(`SELECT * FROM races WHERE race_name=?`, name);
    }
    async getRaceById(id) {
        return await this.get(`SELECT * FROM races WHERE race_id=?`, id);
    }
    async removeRace(race_id) {
        await this.run('BEGIN TRANSACTION');
        await this.run(`DELETE FROM races WHERE race_id=?`, race_id);
        await this.run(`DELETE FROM candidates WHERE race_id=?`, race_id);
        await this.run(`DELETE FROM votes WHERE race_id=?`, race_id);
        await this.run('COMMIT');
        await this._refreshCache();
    }
    async addCandidate(race_id, candidate_name, user_id) {
        candidate_name = VoterTracker.cleanString(candidate_name);

        //ensure we're not adding duplicates for this race
        const existing = await this.get(`SELECT * FROM candidates WHERE race_id=? AND lower(candidate_name)=lower(?)`, race_id, candidate_name);
        if (valid.name(candidate_name) && !existing) {
            const insertMap = this.buildInsertMap({ race_id, candidate_name, creator: user_id}, 'candidates');
            await this.run(`INSERT INTO candidates ${insertMap.sql}`, insertMap.values);
            await this._refreshCache();
            //return the cleaned name
            return candidate_name;
        }
    }
    async removeCandidate(race_id, candidate_id) {
        await this.run('BEGIN TRANSACTION');
        await this.run(`DELETE FROM candidates WHERE race_id=? AND candidate_id=?`, race_id, candidate_id);
        await this.run(`DELETE FROM votes WHERE race_id=? AND candidate_id=?`, race_id, candidate_id);
        await this.run('COMMIT');
        await this._refreshCache();
    }
    async vote(race_id, candidate_id, user_id, direction) {
        if (direction !== 'up' && direction !== 'down') {
            return;
        }
        const existingVote = await this.get(`SELECT direction FROM votes WHERE race_id=? AND candidate_id=? AND user_id=?`, race_id, candidate_id, user_id);
        await this.run('BEGIN TRANSACTION');
        await this.run(`DELETE FROM votes WHERE race_id=? AND candidate_id=? AND user_id=?`, race_id, candidate_id, user_id);
        //if they voted, we just cleared it so we're done here
        if (!existingVote || existingVote.direction !== direction) {
            const insertMap = this.buildInsertMap({ race_id, candidate_id, user_id, direction }, 'votes');
            await this.run(`INSERT INTO votes ${insertMap.sql}`, insertMap.values);
        }
        
        this._castCachedVote(race_id, candidate_id, user_id, direction);
        //don't await, assume everything went as planned and just run with the cached values
        this.run('COMMIT');
    }
    async resetVotes(race_id) {
        await this.run(`DELETE FROM votes WHERE race_id=?`, race_id);
    }
}

module.exports = new VoterTracker();
