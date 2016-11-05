import harbinger from '../harbinger';

const actions = {
    refresh: lightStates => {
        return {
            type: 'LIGHTS_REFRESH',
            lightStates
        };
    },
    toggle: id => {
        harbinger.toggle(id);
        return {
            type: 'LIGHTS_TOGGLE',
            id
        };
    },
    brightness: (id, brightness) => {
        harbinger.setBrightness(id, brightness);
        return {
            type: 'LIGHTS_BRIGHTNESS',
            id, brightness
        };
    }
};

export default actions;