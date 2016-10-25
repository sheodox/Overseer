import React from 'react';
import {Link} from 'react-router';
import SVG from './SVG';

export default React.createClass({
    render: function() {
        return (
            <section className="switchboard">
                <Panel route="/w/lights" name="Lights" svgID="light-icon" />
                <Panel route="/w/game-echo" name="Game Echo" svgID="echo-icon" />
            </section>
        );
    }
});

const Panel = React.createClass({
    render: function() {
        return (
            <Link to={this.props.route}>
                <section className="switch-panel panel">
                    <SVG id={this.props.svgID} className="switch-icon"/>
                    <h2>{this.props.name}</h2>
                </section>
            </Link>
        );
    }
});