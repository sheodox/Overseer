function Conduit(socket, name) {
    this.name = name;
    this.socket = socket;
    this.subs = [];
    //store event handler settings for removing listeners later
    this.bindings = [];
}
Conduit.prototype = {
    sub: function(subname) {
        const sub =  new Conduit(socket, name + '/' + subname);
        this.subs.push(sub);
        return sub;
    },
    on: function(bindings) {
        for (let rawName in bindings) {
            if (bindings.hasOwnProperty(rawName)) {
                const eventName = this.name + ':' + rawName,
                    fn = bindings[rawName];
                this.socket.on(eventName, fn);
                this.bindings.push([eventName, fn]);
            }
        }
    },
    emit: function() {
        const event = this.name + ':' + arguments[0],
            rest = [].slice.call(arguments, 1);
        this.socket.emit.apply(this.socket, [event, ...rest]);
    },
    destroy: function() {
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
};

module.exports = Conduit;