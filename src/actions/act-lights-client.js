const actions = {
    refresh: function(states) {
        return {
            type: 'LIGHTS_REFRESH',
            lightStates: states
        };
    },
    brightness: function(id, brightness) {
        socket.emit('lights/brightness', id, brightness);
        return {
            type: 'ADJUST_BRIGHTNESS'
        }
    },
    toggle: function(id) {
        socket.emit('lights/toggle', id);
        return {
            type: 'TOGGLE_LIGHTS',
            id
        }
    }
};

export default actions;