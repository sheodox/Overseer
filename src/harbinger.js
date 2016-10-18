'use strict';
var hue = require('node-hue-api'),
    lightState = hue.lightState,
    config = require('./config'),
    states = {
        on: lightState.create().on(500, 100),
        off: lightState.create().off()
    },
    bridge, api, groups;


module.exports = {
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
                    console.log(JSON.stringify(result, null, 4));
                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        })
    },
    getState: () => {
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
                console.log(relevantGroups);
                return relevantGroups;
            })
            .catch(err => {
                console.log(err);
            });
    },
    on: id => {
        console.log(`on ${id}`);
        return api.setGroupLightState(id, states.on);
    },
    off: id => {
        console.log(`off ${id}`);
        return api.setGroupLightState(id, states.off);
    },
    setBrightness: (id, brightness) => {
        return api.setGroupLightState(id, lightState.create().bri(brightness));
    }
};
