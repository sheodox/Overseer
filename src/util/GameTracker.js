const Stockpile = require('../db/stockpile'),
    formatTags = require('./formatters').tags,
    debug = require('debug')('echo:tracker');

class GameTracker extends Stockpile {
    constructor() {
        super({
            db: 'echo',
            tables: [
                {name: 'echo', columns: {
                        file: 'TEXT NOT NULL PRIMARY KEY',
                        name: 'TEXT NOT NULL',
                        details: 'TEXT',
                        tags: 'TEXT',
                        size: 'NUMBER NOT NULL',
                        downloads: 'NUMBER NOT NULL',
                        created: 'TEXT NOT NULL',
                        initial_uploader: 'TEXT NOT NULL',
                        modified: 'TEXT NOT NULL',
                        last_uploader: 'TEXT NOT NULL',
                        in_progress: 'NUMBER'
                    }
                }
            ]
        });
        //prune anything that's stuck in progress, assume it's not actually uploading anymore, probably errored out during upload
        this.run('DELETE FROM echo WHERE in_progress=1');
    }

    /**
     * Get a list of all games available.
     * @returns {Promise<void>}
     */
    async list() {
        const list = await this.all(`SELECT * FROM echo ORDER BY name COLLATE NOCASE`);
        //need to turn the tags from a string back into an array
        list.map(game => {
            return this._prepareForUI(game);
        });
        return list;
    }
    async addGame(newData, userId) {
        function cleanTags(tags) {
            return formatTags(tags).join(', ');
        }
        //make sure tags are an array of trimmed strings, will convert it if it's comma separated just like it'd come directly from the upload form
        const oldData = (await this.find(newData.file)) || {},
            now = new Date().toISOString();
        if (newData.tags) {
            newData.tags = cleanTags(newData.tags);
        }

        //since partial data first comes from the browser before the upload, then the rest of the data comes from the echo server
        //we need to just keep building on what we've got so far
        const data = Object.assign({
            downloads: oldData.downloads || 0,
            details: oldData.details || '',
            tags: cleanTags(oldData.tags || ''),
            size: 0,
            name: oldData.name || oldData.file || '--unnamed-- ' + newData.file,
            in_progress: false,
            initial_uploader: oldData.initial_uploader || userId || '???',
            last_uploader: userId || oldData.last_uploader || '???' ,
            created: oldData.created || newData.modified || now,
            modified: now
        }, newData);

        data.in_progress  = data.in_progress ? 1 : 0;
        return await this._save(data);
    }
    async deleteGame(file) {
        debug(`deleting ${file}`);
        await this.run('DELETE FROM echo WHERE file=?', file);
    }

    /**
     * Overwrite editable information about a game
     * @param fileName - game's zip file name
     * @param changes - array of objects, like {field: 'name', value: 'cool game'}
     * @returns {Promise<*>}
     */
    async update(fileName, changes=[]) {
        if (!Array.isArray(changes)) {
            return;
        }

        const game = await this.find(fileName),
            editableFields = ['name', 'tags', 'details'];

        for (let {field, value} of changes) {
            if (game && game.hasOwnProperty(field) && editableFields.includes(field)) {
                game[field] = value;
            }
        }

        return this._save(game);
    }

    /**
     * Increment download count
     * @param fileName
     * @returns {Promise<void>}
     */
    async downloaded(fileName) {
        const game = await this.find(fileName);
        if(game) {
            game.downloads++;
            await this._save(game);
        }
    }

    /**
     * Saves (insert or replace) the game's data in the db
     * @param game
     * @returns {Promise<*>}
     * @private
     */
    async _save(game) {
        this._prepareForDB(game);
        const insertData = this.buildInsertMap(game);
        await this.run(`INSERT OR REPLACE INTO echo ${insertData.sql}`, insertData.values);
        return game;
    }
    _prepareForUI(gameData) {
        gameData.tags = formatTags(gameData.tags);
        return gameData;
    }
    _prepareForDB(gameData) {
        gameData.tags = formatTags(gameData.tags).join(', ');
        return gameData;
    }
    async find(fileName) {
        const data = await this.get('SELECT * FROM echo WHERE file=?', fileName);
        if (data) {
            return this._prepareForUI(data);
        }
    }
}

module.exports = new GameTracker();