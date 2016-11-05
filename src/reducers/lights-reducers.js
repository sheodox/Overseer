function lights(state = [], action) {
    state = JSON.parse(JSON.stringify(state));

    const lightGroup = state.find(l => {
        return l.id === action.id;
    });
    switch(action.type) {
        case 'LIGHTS_REFRESH':
            return action.lightStates;
        case 'LIGHTS_TOGGLE':
            lightGroup.on = !lightGroup.on;
            return state;
        case 'LIGHTS_BRIGHTNESS':
            lightGroup.brightness = action.brightness;
            return state;
        default:
            return state;
    }
}

export default {
    lights
}