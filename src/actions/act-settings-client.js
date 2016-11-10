const actions = {
    setSessionId: sessionId => {
        localStorage.setItem('sessionId', sessionId);
        return {
            type: 'SETTINGS_SET_SESSION_ID',
            sessionId
        }
    },
    propose: (id, username) => {
        socket.emit('settings/proposeUsername', id, username);
    },
    usernameAccepted: username => {
        localStorage.setItem('username', username);
        return {
            type: 'SETTINGS_USERNAME_ACCEPTED',
            username
        }
    },
    usernameInvalid: username => {
        return {
            type: 'SETTINGS_USERNAME_INVALID',
            username
        }
    }
};

export default actions;