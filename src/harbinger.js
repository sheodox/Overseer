import hue from 'node-hue-api';

const config = require('./config'),
    pollInterval = config['lights-poll-interval'],
    lightState = hue.lightState,
    states = {
        on: lightState.create().on(500, 100),
        off: lightState.create().off()
    };
let bridge, api, groups;

function Harbinger() {
    this.stateCache = [];
}
Harbinger.prototype = {
    init: function() {
        return new Promise((resolve, reject) => {
            hue.nupnpSearch()
                .then(b => {
                    //only one bridge on the network
                    bridge = b[0];
                })
                .then(() => {
                    if (!config.username) {
                        api = new hue.HueApi();
                        return api.registerUser(bridge.ipaddress);
                    }
                    return config.username;
                })
                .then(username => {
                    api = new hue.HueApi(bridge.ipaddress, username);
                    return api;
                })
                .then(() => {
                    // return api.fullState();
                    return api.groups();
                })
                .then(result => {
                    groups = result;
                    //optionally log initial light data
                    // console.log(JSON.stringify(result, null, 4));

                    const poll = () => {
                        return api
                            .groups()
                            .then(groups => {
                                var relevantGroups = [];
                                for (let i in groups) {
                                    let group = groups[i];
                                    if (group.lights) {
                                        relevantGroups.push({
                                            id: group.id,
                                            name: group.name,
                                            on: group.state.all_on,
                                            brightness: group.action.bri
                                        })
                                    }
                                }
                                this.stateCache = relevantGroups;
                                return relevantGroups;
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    };
                    //call immediately to get initial state when booting
                    poll();
                    //occasionally poll to verify state (to correct state if lights were adjusted without overseer)
                    setInterval(poll, pollInterval);

                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        })
    },
    getState: function() {
        return this.stateCache;
    },
    findGroup: function(states, id) {
        return states.find(l => {
                return l.id ===  id;
            });
    },
    toggle: function(id) {
        const group = this.findGroup(this.stateCache, id),
            nextState = group.on ? 'off' : 'on';
        console.log(`${nextState} ${group.name}`);
        group.on = !group.on;
        return api.setGroupLightState(id, states[nextState]);
    },
    setBrightness: function(id, brightness) {
        console.log(`brightness ${id} ${brightness}`);
        const group = this.findGroup(this.stateCache, id);
        group.brightness = brightness;
        return api.setGroupLightState(id, lightState.create().bri(brightness));
    }
};

module.exports = new Harbinger();
