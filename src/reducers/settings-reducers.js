const defaultSettings = {
    username: '',
    sessionId: '',
    usernameValid: null
};

function settings(state = defaultSettings, action) {
    state = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case 'SETTINGS_SET_SESSION_ID':
            state.sessionId = action.sessionId;
            return state;
        case 'SETTINGS_USERNAME_ACCEPTED':
            Object.assign(state, {
                username: action.username,
                usernameValid: true
            });
            return state;
        case 'SETTINGS_USERNAME_INVALID':
            Object.assign(state, {
                username: action.username,
                usernameValid: false
            });
            return state;
        default:
            return state;
    }
}

export default {
    settings
};
