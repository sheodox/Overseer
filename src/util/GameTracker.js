const FlatFile = require("./flatfile").default;

class GameTracker extends FlatFile{
    constructor() {
        super('gamedata.json', {});
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
        this.data[newData.name] = Object.assign(newData, {
            downloads: oldData.downloads || 0
        });
        this.save();
    }
    deleteGame(name) {
        delete this.data[name];
        this.save();
    }
    find(name) {
        return this.data[name];
    }
}

module.exports = new GameTracker();