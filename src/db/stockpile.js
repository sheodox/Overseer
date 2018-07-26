const sqlite3 = require('sqlite3'),
    debug = require('debug');

class Stockpile {
    constructor(options) {
        if (!options.db) {
            throw new Error('Stockpile - missing database name!');
        }

        this.debug = debug(`stockpile:${options.db}`);
        this.options = options;

        this.ready = false;
        this._databaseCreation = new Promise((resolve, reject) => {
            this._db = new sqlite3.Database(`./data/${options.db}.sqlite3`, async err => {
                if (err) {
                    throw err;
                }
                for (let table of this.options.tables) {
                    const columns = Object.keys(table.columns).map(column => {
                        return column + ' ' + table.columns[column];
                    }).join(',');
                    //skip the queue, this needs to run first
                    await this._callSql('run', `CREATE TABLE IF NOT EXISTS ${table.name} (${columns});`);
                    //todo add missing columns
                }

                this.ready = true;
                resolve();
            });
        });
    }
    _queue(...args) {
        //if queries are called before the database has been created, queue them up in promises, otherwise run them normally
        if (!this.ready) {
            return this._databaseCreation = this._databaseCreation.then(() => {
                this._callSql(...args);
            })
        }
        return this._callSql(...args);
    }
    _callSql(type, sql, params=[]) {
        this.debug(sql, params);
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            this._db[type](sql, ...params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                else if (row) {
                    const count = Array.isArray(row) ? row.length : 1;
                    this.debug(`${count} results in ${Date.now() - startTime}ms`);
                }
                resolve(row);
            })
        })
    }
    get (sql, ...params) {
        return this._queue('get', sql, params);
    }
    all (sql, ...params) {
        return this._queue('all', sql, params);
    }
    run (sql, ...params) {
        return this._queue('run', sql, params);
    }
    buildInsertMap(data) {
        const columns = [],
            values = [];
        let valuePlaceholders = [];
        let index = 1;
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                columns.push(i);
                values.push(data[i]);
                valuePlaceholders.push('?');
                index++;
            }
        }
        valuePlaceholders = valuePlaceholders.join(',');
        return {
            sql: `(${columns.join(',')}) VALUES (${valuePlaceholders})`,
            values
        }
    }
}


module.exports = Stockpile;