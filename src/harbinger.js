const hue = require('node-hue-api'),
    config = require('../config'),
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
                    console.log('Available Lights');
                    console.table(
                        result
                            .filter(r => !!r.lights)
                            .map(group => {
                                return {
                                    id: group.id,
                                    name: group.name
                                }
                            }));

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
    toggleSeveral: async function (ids) {
        //make sure they're strings, the IDs are numbers as string, so just in case make sure we're dealing with actual strings
        ids = ids.map(id => String(id));
        
        const groupsByState = ids.reduce((done, id) => {
            const state = this.findGroup(this.stateCache, id).on;
            done[state ? 'on': 'off'].push(id);
            return done;
        }, {on: [], off: []});
        const allOff = groupsByState.on.length === 0;
        
        //we only want to turn lights on if all the lights are off because it's possible that some groups can be on and some off,
        //when that happens we will prefer to turn everything off first, so abruptly turning lights on in some room won't wake someone.
        groupsByState[allOff ? 'off' : 'on'].forEach(id => {
            this.toggle(id);
        })
    },
    setBrightness: function(id, brightness) {
        console.log(`brightness ${id} ${brightness}`);
        const group = this.findGroup(this.stateCache, id);
        group.brightness = brightness;
        return api.setGroupLightState(id, lightState.create().bri(brightness));
    }
};

module.exports = new Harbinger();
