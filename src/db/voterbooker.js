import voter from "../routes/voter";

const Booker = require('../db/booker');

const voterBooker = new Booker('voter', ['vote',
    'remove_candidate',
    'remove_race',
    'reset_votes',
    'add_race',
    'add_candidate'
]);

module.exports = voterBooker;
