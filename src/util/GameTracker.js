const FlatFile = require("./flatfile").default;

class GameTracker extends FlatFile{
    constructor() {
        super('gamedata.json', {});
        //prune anything that's stuck in progress, assume it's not actually uploading anymore
        const inProgressGames = this.list().filter(game => {
            return game.inProgress;
        });
        inProgressGames.forEach(game => {
            delete this.data[game.name];
        })
    }
    list() {
        const games = [];
        for (let name in this.data) {
            if (this.data.hasOwnProperty(name)) {
                games.push(this.data[name]);
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
        const oldData = this.find(newData.name) || {};
        this.data[newData.name] = Object.assign({
            downloads: oldData.downloads || 0,
            details: oldData.details || ''
        }, newData);
        this.save();
    }
    deleteGame(name) {
        delete this.data[name];
        this.save();
    }
    updateDetails(name, details) {
        this.find(name).details = details;
        this.save();
    }
    downloaded(name) {
        const game = this.find(name);
        if(game) {
            game.downloads++;
            this.save();
        }
    }
    find(name) {
        return this.data[name];
    }
}

module.exports = new GameTracker();