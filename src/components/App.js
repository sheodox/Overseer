import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Switchboard from './Switchboard';

const App = React.createClass({
    render: function() {
        return (
            <div>
                <Header />
                <main className="content">
                    { this.props.children ? this.props.children : <Switchboard /> }
                </main>
                <Footer />
            </div>
        )
    }
});

module.exports = App;
