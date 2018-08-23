const React = require('react'),
    {Link} = require('react-router-dom'),
    SVG = require('./SVG');

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //don't want to flash red immediately, pretend it's connected
            socketConnected: true
        }
    }
    componentDidMount() {
        socket.on('disconnect', () => {
            this.setState({
                socketConnected: false
            });
        });
        socket.on('connect', () => {
            this.setState({
                socketConnected: true
            });
        });
    }
    render() {
        return (
            <header className={this.state.socketConnected ? '' : 'disconnected'}>
                <Link to="/">
                    <div className="content-container">
                        <div className="logo-container">
                            <SVG id="logo" />
                            <SVG id="logo" />
                        </div>
                        <h1>
                            Overseer
                        </h1>
                    </div>
                </Link>
            </header>
        );
    }

}

module.exports = Header;
