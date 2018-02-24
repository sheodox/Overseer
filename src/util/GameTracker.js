const FlatFile = require("./flatfile").default,
    formatTags = require('./formatters').tags;

class GameTracker extends FlatFile{
    constructor() {
        super('gamedata.json', {});
        //prune anything that's stuck in progress, assume it's not actually uploading anymore
        const inProgressGames = this.list().filter(game => {
            return game.inProgress;
        });
        inProgressGames.forEach(game => {
            delete this.data[game.fileName];
        })
    }
    list() {
        const games = [];
        for (let fileName in this.data) {
            if (this.data.hasOwnProperty(fileName)) {
                games.push(this.data[fileName]);
            }
        }
        //sort games alphabetically
        games.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        return games;
    }
    addGame(newData) {
        //make sure tags are an array of trimmed strings, will convert it if it's comma separated just like it'd come directly from the upload form
        const oldData = this.find(newData.fileName) || {};
        if (newData.tags) {
            newData.tags = formatTags(newData.tags);
        }

        let isNewUpload = oldData.inProgress && !newData.inProgress;

        this.data[newData.fileName] = Object.assign({
            downloads: oldData.downloads || 0,
            details: oldData.details || '',
            tags: formatTags(oldData.tags),
            name: oldData.name || oldData.fileName || 'nameless game!'
        }, newData);
        this.save();
        return isNewUpload;
    }
    deleteGame(fileName) {
        delete this.data[fileName];
        this.save();
    }
    update(fileName, infoName, infoVal) {
        if (infoName === 'tags') {
            infoVal = formatTags(infoVal);
        }
        this.find(fileName)[infoName] = infoVal;
        this.save();
    }
    downloaded(fileName) {
        const game = this.find(fileName);
        if(game) {
            game.downloads++;
            this.save();
        }
    }
    find(fileName) {
        return this.data[fileName];
    }
}

module.exports = new GameTracker();