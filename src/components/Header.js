import React from 'react';
import {Link} from 'react-router';
import SVG from './SVG';

export default React.createClass({
    render: function() {
        return (
            <header>
                <SVG id="logo" />
                <h1>
                    <Link to="/">Overseer</Link>
                </h1>
            </header>
        );
    }

})