import React from 'react';
import {connect} from 'react-redux';
import Header from './Header';
import Switchboard from './Switchboard';

const App = React.createClass({
    render: function() {
        return (
            <div>
                <Header socketConnected={this.props.socketConnected} />
                <main className="content">
                    { this.props.children ? this.props.children : <Switchboard /> }
                </main>
            </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        socketConnected: state.app.socketConnected
    };
}

export default connect(
    mapStateToProps
)(App);