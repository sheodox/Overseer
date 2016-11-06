const defaultAppState = {
    //don't want to flash red immediately, pretend it's connected
    socketConnected: true
};

function app(state = defaultAppState, action) {
    state = JSON.parse(JSON.stringify(state));

    switch(action.type) {
        case 'SOCKET_DISCONNECTED':
            return Object.assign(state, {
                socketConnected: false
            });
        case 'SOCKET_CONNECTED':
            return Object.assign(state, {
                socketConnected: true
            });
        default:
            return state;
    }
}

export default {
    app
}