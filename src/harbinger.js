import store from './reducers/reducers';
import actions from './actions/act-lights-server';
import hue from 'node-hue-api';

const config = require('./config'),
    pollInterval = config['lights-poll-interval'],
    lightState = hue.lightState,
    states = {
        on: lightState.create().on(500, 100),
        off: lightState.create().off()
    };
let bridge, api, groups;

const harbinger = {
    init: function() {
        let self = this;

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

                    function refresh() {
                        self.getState()
                            .then(lightStates => {
                                store.dispatch(actions.refresh(lightStates));
                            });
                    }

                    //occasionally poll to verify state (to correct state if lights were adjusted without overseer)
                    setInterval(refresh, pollInterval);
                    //call immediately to get initial state when booting
                    refresh();

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
    toggle: function(id) {
        const lightStates = store.getState().lights,
            group = lightStates.find(l => {
                return l.id ===  id;
            });

        this[group.on ? 'off' : 'on'](id);
    },
    setBrightness: (id, brightness) => {
        console.log(`brightness ${id} ${brightness}`);
        return api.setGroupLightState(id, lightState.create().bri(brightness));
    }
};

export default harbinger;
