const Booker = require('./booker');

const voterBooker = new Booker('voter', [
    'vote',
    //the ability to remove other user's candidates. you can always remove your own.
    'remove_candidate',
    'remove_race',
    'reset_votes',
    'add_race',
    'add_candidate',
    'view',
    'add_image',
    'remove_image'
]);

module.exports = voterBooker;
