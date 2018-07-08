const Booker = require('./booker');

const echoBooker = new Booker('echo', [
    'view',
    'upload',
    'download',
    'delete',
    'update'
]);

module.exports = echoBooker;