function lights(state = [], action) {
    state = JSON.parse(JSON.stringify(state));

    switch(action.type) {
        case 'REFRESHED_LIGHTS':
            return action.lightStates;
        default:
            return state;
    }
}

export default {
    lights
}