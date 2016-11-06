const actions = {
    socketConnected: () => {
        return {
            type: 'SOCKET_CONNECTED'
        }
    },
    socketDisconnected: () => {
        return {
            type: 'SOCKET_DISCONNECTED'
        }
    }
};

export default actions;