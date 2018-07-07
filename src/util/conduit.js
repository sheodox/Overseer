class Conduit {
    constructor(socket, name) {
        this.name = name;
        this.socket = socket;
        this.subs = [];
        //store event handler settings for removing listeners later
        this.bindings = [];
    }
    sub(subname) {
        const sub =  new Conduit(socket, name + '/' + subname);
        this.subs.push(sub);
        return sub;
    }
    on(bindings) {
        for (let rawName in bindings) {
            if (bindings.hasOwnProperty(rawName)) {
                const eventName = this.name + ':' + rawName,
                    fn = bindings[rawName];
                this.socket.on(eventName, fn);
                this.bindings.push([eventName, fn]);
            }
        }
    }

    /**
     * Emit on the specified socket
     * @param socket
     * @param eventName
     * @param args
     * @private
     */
    _send(socket, eventName, ...args) {
        const event = this.name + ':' + eventName;
        socket.emit(event, ...args);
    }
    emit(...args) {
        this._send(this.socket, ...args);
    }
    destroy() {
        this.subs.forEach((sub) => {
            sub.destroy();
        });
        this.bindings.forEach(binding => {
            const [name, fn] = binding;
            this.socket.off(name, fn);
        });
        this.bindings = [];
        this.subs = [];
    }
}

module.exports = Conduit;