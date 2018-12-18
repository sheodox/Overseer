/**
 * Helper class to scale numbers to 60fps so even at faster framerates animations don't speed up
 */
class FrameScaler {
    constructor() {
        this.tick();
        this._frameTimeBase = 1000 / 60;
    }
    tick() {
        const now = Date.now();
        this._lastFrameTime = now - this._lastTick;
        this._lastTick = now;
    }

    /**
     * For making things smaller based on frame time, like deltas, so things don't change too much
     * @returns {number}
     */
    frameTimeScaler() {
        return this._lastFrameTime / this._frameTimeBase;
    }

    /**
     * For making things bigger based on frame time, like random chance, so rare things don't happen too often
     */
    frameTimeScalerInverse() {
        return 1 / this.frameTimeScaler();
    }
}
module.exports = FrameScaler;
