import React from 'react';
import {Link} from 'react-router-dom';
import SVG from './SVG';

module.exports = React.createClass({
    render: function() {
        return (
            <section className="switchboard">
                {Booker.lights.use && <Panel route="/w/lights" name="Lights" svgID="light-icon" />}
                {Booker.echo.view && <Panel route="/w/game-echo" name="Game Echo" svgID="echo-icon" />}
                <Panel route="/w/voter" name="Voter" svgID="voter-icon" />
                <Panel route="/w/settings/" name="Settings" svgID="settings-icon" />
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