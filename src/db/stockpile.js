const sqlite3 = require('sqlite3');

class Stockpile {
    constructor(options) {
        this.options = options;
        this._db = new sqlite3.Database(`./data/${options.db}.sqlite3`, err => {
            if (err) {
                throw err;
            }
            this.options.tables.forEach(table => {
                const columns = Object.keys(table.columns).map(column => {
                    return column + ' ' + table.columns[column];
                }).join(',');
                this.run(`CREATE TABLE IF NOT EXISTS ${table.name} (${columns});`);

                //todo add columns
            });
        });
    }
    _callSql(type, sql, params) {
        // console.log(sql, params);
        return new Promise((resolve, reject) => {
            this._db[type](sql, ...params, (err, row) => {
                err ? reject(err) : resolve(row);
            })
        })
    }
    get (sql, ...params) {
        return this._callSql('get', sql, params);
    }
    all (sql, ...params) {
        return this._callSql('all', sql, params);
    }
    run (sql, ...params) {
        return this._callSql('run', sql, params);
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