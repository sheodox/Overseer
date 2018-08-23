const React = require('react'),
    {Link} = require('react-router-dom'),
    SVG = require('./SVG');

class Switchboard extends React.Component {
    render() {
        return (
            <section className="switchboard">
                {Booker.lights.use && <Panel route="/w/lights" name="Lights" svgID="light-icon" />}
                {Booker.echo.view && <Panel route="/w/game-echo" name="Game Echo" svgID="echo-icon" />}
                {Booker.voter.view && <Panel route="/w/voter" name="Voter" svgID="voter-icon" />}
                <Panel route="/w/settings/" name="Settings" svgID="settings-icon" />
            </section>
        );
    }
}

class Panel extends React.Component {
    componentDidMount() {
        App.title();
    }
    render() {
        return (
            <Link to={this.props.route}>
                <section className="switch-panel panel">
                    <SVG id={this.props.svgID} className="switch-icon"/>
                    <h2>{this.props.name}</h2>
                </section>
            </Link>
        );
    }
}

module.exports = Switchboard;
