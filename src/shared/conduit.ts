import {Server, Socket} from "socket.io";

interface ConduitBindings {
    [eventName: string]: (...args: any) => any
}

export class Conduit {
    name: string
    socket: Socket | Server
    subs: Conduit[]
    bindings: [eventName: string, callback: any][];

    constructor(socket: Socket | Server, name: string) {
        this.name = name;
        this.socket = socket;
        this.subs = [];
        //store event handler settings for removing listeners later
        this.bindings = []
    }
    sub(subname: string) {
        const sub =  new Conduit(this.socket, this.name + '/' + subname);
        this.subs.push(sub);
        return sub;
    }
    on(bindings: ConduitBindings) {
        for (let rawName in bindings) {
            if (bindings.hasOwnProperty(rawName)) {
                const eventName = this.name + ':' + rawName,
                    fn = bindings[rawName];
                // @ts-ignore -- it doesn't like this line, todo fix this
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
    _send(socket: Socket | Server, eventName: string, ...args: any) {
        const event = this.name + ':' + eventName;
        socket.emit(event, ...args);
    }
    emit(eventName: string, ...args: any) {
        this._send(this.socket, eventName, ...args);
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