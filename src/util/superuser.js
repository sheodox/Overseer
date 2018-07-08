const config = require('../config');

function isReqSuperUser(req) {
    return req.user && (config['super-users'] || []).includes(req.user.profile.id);
}
function isUserSuperUser(userId) {
    return (config['super-users'] || []).includes(userId);
}

module.exports = {
    isReqSuperUser,
    isUserSuperUser
};
