const Booker = require('./booker');

const voterBooker = new Booker('voter', [
    'vote',
    'remove_candidate',
    'remove_race',
    'reset_votes',
    'add_race',
    'add_candidate'
]);

module.exports = voterBooker;
