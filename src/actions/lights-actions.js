const actions = {
    refresh: function() {
        socket.emit('lights/refresh');
        return {
            type: 'REQUESTED_REFRESH'
        }
    },
    refreshed: function(states) {
        return {
            type: 'REFRESHED_LIGHTS',
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