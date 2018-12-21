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
    }
    //trim and remove all unnecessary spaces
    static cleanString(str) {
        return String(str).trim().replace(/\s{2,}/g, ' ');
    }
    async list() {
        try {
            const races = await this.all(`SELECT * FROM races`);

            for (let race of races) {
                const candidates = await this.all(`SELECT * FROM candidates WHERE race_id=?`, race.race_id);
                race.candidates = candidates;

                for (let candidate of candidates) {
                    candidate.votedUp = await this.all(`SELECT * FROM votes WHERE direction=? AND race_id=? AND candidate_id=?`, 'up', race.race_id, candidate.candidate_id);
                    candidate.votedDown = await this.all(`SELECT * FROM votes WHERE direction=? AND race_id=? AND candidate_id=?`, 'down', race.race_id, candidate.candidate_id);
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
        await this.run(`DELETE FROM races WHERE race_id=?`, race_id);
        await this.run(`DELETE FROM candidates WHERE race_id=?`, race_id);
        await this.run(`DELETE FROM votes WHERE race_id=?`, race_id);
    }
    async addCandidate(race_id, candidate_name, user_id) {
        candidate_name = VoterTracker.cleanString(candidate_name);

        //ensure we're not adding duplicates for this race
        const existing = await this.get(`SELECT * FROM candidates WHERE race_id=? AND lower(candidate_name)=lower(?)`, race_id, candidate_name);
        if (valid.name(candidate_name) && !existing) {
            const insertMap = this.buildInsertMap({ race_id, candidate_name, creator: user_id}, 'candidates');
            await this.run(`INSERT INTO candidates ${insertMap.sql}`, insertMap.values);
            //return the cleaned name
            return candidate_name;
        }
    }
    async removeCandidate(race_id, candidate_id) {
        await this.run(`DELETE FROM candidates WHERE race_id=? AND candidate_id=?`, race_id, candidate_id);
        await this.run(`DELETE FROM votes WHERE race_id=? AND candidate_id=?`, race_id, candidate_id);
    }
    async vote(race_id, candidate_id, user_id, direction) {
        if (direction !== 'up' && direction !== 'down') {
            return;
        }
        const existingVote = await this.get(`SELECT direction FROM votes WHERE race_id=? AND candidate_id=? AND user_id=?`, race_id, candidate_id, user_id);
        await this.run(`DELETE FROM votes WHERE race_id=? AND candidate_id=? AND user_id=?`, race_id, candidate_id, user_id);
        //if they voted, we just cleared it so we're done here
        if (existingVote && existingVote.direction === direction) {
            return;
        }
        const insertMap = this.buildInsertMap({ race_id, candidate_id, user_id, direction }, 'votes');
        await this.run(`INSERT INTO votes ${insertMap.sql}`, insertMap.values);
    }
    async resetVotes(race_id) {
        await this.run(`DELETE FROM votes WHERE race_id=?`, race_id);
    }
}

module.exports = new VoterTracker();
