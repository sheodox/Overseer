const Stockpile = require('../db/stockpile'),
    valid = require('./validator'),
    imageStore = require('./imagestore');

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
                        creator: 'TEXT NOT NULL',
                        notes: 'TEXT'
                    }},
                {name: 'votes', columns: {
                        race_id: 'INTEGER NOT NULL',
                        candidate_id: 'INTEGER NOT NULL',
                        user_id: 'TEXT NOT NULL',
                        direction: 'TEXT NOT NULL'
                    }},
                {name: 'candidate_images', columns: {
                        race_id: 'INTEGER NOT NULL',
                        candidate_id: 'INTEGER NOT NULL',
                        image_id: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                        image: 'BLOB',
                        image_type: 'TEXT'
                    }},
                {name: 'candidate_links', columns: {
                        race_id: 'INTEGER NOT NULL',
                        candidate_id: 'INTEGER NOT NULL',
                        link_text: 'TEXT NOT NULL',
                        link_href: 'TEXT NOT NULL'
                    }}
            ],
            migrations: [
                {version: 1, addColumns: [{
                        to: 'candidates', column: 'notes'
                    }]
                },
                {version: 2, addColumns: [{
                        to: 'candidate_images', column: 'image_type'
                    }]}
            ]
        });
        //cache everything so votes are fast even with slow disk i/o
        this._raceCache = [];
        this._candidateCache = [];
        this._voteCache = [];
        this.onReady(() => {
            this._generateMissingImages();
        })
    }
    async _generateMissingImages() {
        const startTime = Date.now(),
            imageIds = (await this.all(`SELECT image_id FROM candidate_images`)).map(obj => obj.image_id),
            missing = await imageStore.findMissingImages('voter', imageIds);

        if (!missing.length) {
            return;
        }

        console.log(`Voter: Need to generate images for ${missing.length} images.`);
        for (const imageID of missing) {
            const {image, image_type} = await this.get(`SELECT image, image_type, image_id FROM candidate_images WHERE image_id=?`, [imageID]);
            await imageStore.generate({
                image, image_type,
                source: 'voter',
                source_key: imageID
            })
        }
        console.log(`Voter: generated missing images in ${((Date.now() - startTime) / 1000).toFixed(1)} seconds`);
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

        const images = await this.all(`SELECT race_id, candidate_id, image_id FROM candidate_Images`),
            links = await this.all(`SELECT * FROM candidate_links`);
        //find all links and images that belong to each candidate
        this._candidateCache.forEach(candidate => {
            const matching = thing => thing.race_id === candidate.race_id && thing.candidate_id === candidate.candidate_id;

            candidate.images = images.filter(matching);
            candidate.links = links.filter(matching);
        });

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
     * Get a single user's vote for a specific candidate
     * @param race_id
     * @param candidate_id
     * @param user_id
     * @private
     */
    _getCachedVote(race_id, candidate_id, user_id) {
        return this._voteCache.find(vote => vote.race_id === race_id && vote.candidate_id === candidate_id && vote.user_id === user_id);
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
            return {candidate_name};
        }
        else if (existing) {
            return {error: 'Something with that name already exists!'}
        }
        else {
            return {error: 'Invalid name!'}
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
        const existingVote = this._getCachedVote(race_id, candidate_id, user_id);
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
        this._voteCache = this._voteCache.filter(v => v.race_id !== race_id);
    }
    async uploadImage(race_id, candidate_id, image, image_type) {
        const insertMap = this.buildInsertMap({
            race_id, candidate_id, image, image_type
        }, 'candidate_images');
        await this.run(`INSERT INTO candidate_images ${insertMap.sql}`, insertMap.values);
        await this._generateMissingImages();
        await this._refreshCache();
    }
    async getImage(image) {
    	return await this.get(`SELECT image, image_type FROM candidate_images WHERE image_id=?`, [image])
	}
	async removeImage(image_id) {
        const {candidate_id} = await this.get(`SELECT candidate_id FROM candidate_images WHERE image_id=?`, [image_id]);
        await this.run(`DELETE FROM candidate_images WHERE image_id=?`, [image_id]);
        await imageStore.removeImages('voter', candidate_id);
        await this._refreshCache();
    }
    async updateCandidateName(race_id, candidate_id, candidate_name) {
        if (valid.name(candidate_name)) {
            await this.run(`UPDATE candidates SET candidate_name=? WHERE race_id=? AND candidate_id=?`, [candidate_name, race_id, candidate_id]);
            await this._refreshCache();
        }
    }
    async updateNotes(race_id, candidate_id, notes) {
        await this.run(`UPDATE candidates SET notes=? WHERE race_id=? AND candidate_id=?`, [notes, race_id, candidate_id]);
        await this._refreshCache();
    }
    async addLink(race_id, candidate_id, link_text, link_href) {
        if (!/^https?:\/\//.test(link_href)) {
            return {
                error: 'Invalid link!'
            };
        }
        const insertMap = this.buildInsertMap({
            race_id, candidate_id, link_text, link_href
        }, 'candidate_links');

        await this.run(`INSERT INTO candidate_links ${insertMap.sql}`, insertMap.values);
        await this._refreshCache();
        return {};
    }
    async removeLink(race_id, candidate_id, link_href) {
    	await this.run(`DELETE FROM candidate_links WHERE race_id=? AND candidate_id=? AND link_href=?`, [race_id, candidate_id, link_href]);
        await this._refreshCache();
    }
}

module.exports = new VoterTracker();
