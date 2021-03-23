/**
 * Quick expiring cache, for when a cache is needed but TOCTOU is a concern.
 */
export class ShortCache<CachedData> {
    private data: Map<string, {data: CachedData, expires: number}>;
    private readonly expiresIn: number;

    constructor(expiresIn: number) {
        this.data = new Map<any, any>();
        this.expiresIn = expiresIn;
    }
    get (key: string) {
        const cached = this.data.get(key)
        if (cached && Date.now() < cached.expires) {
            return cached.data;
        }
    }
    set (key: string, data: CachedData) {
        this.data.set(key, {
            data,
            expires: Date.now() + this.expiresIn
        });
    }
}
