import React from 'react';
import {Link} from 'react-router';

export default React.createClass({
    render: function() {
        return (
            <section>
                <Link to="/lights/">
                    Lights
                </Link>
                <Link to="/game-echo/">
                    Game Echo
                </Link>
            </section>
        )
    }
})