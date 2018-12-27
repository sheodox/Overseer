/**
 * Quick expiring cache, for when a cache is needed but TOCTOU is a concern.
 */
class TTLCache {
    constructor(ttl) {
        this._data = {};
        this._ttl = ttl;
    }
    get (key) {
        const cached = this._data[key];
        if (cached && Date.now() < cached.expires) {
            
            return cached.data;
        }
    }
    set (key, data) {
        this._data[key] = {
            data, expires: Date.now() + this._ttl
        };
    }
}

module.exports = TTLCache;
