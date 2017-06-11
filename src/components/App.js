import {BrowserRouter, Route, Redirect} from 'react-router-dom';
const React = require('react'),
    Header = require('./Header'),
    Footer = require('./Footer'),
    Switchboard = require('./Switchboard'),
    Games = require('./Games'),
    Lights = require('./Lights'),
    Voter = require('./Voter'),
    EchoUploader = require('./EchoUploader'),
    GameDetails = require('./GameDetails'),
    Settings = require('./Settings'),
    LoginRequired = require('./LoginRequired');

const App = React.createClass({
    render: function() {
        return (
            <BrowserRouter>
                <div>
                    <Header />
                    <main className="content">
                        <Route exact path="/" render={() => {
                            const returnUrlKey = 'auth-return-url',
                                returnUrl = sessionStorage.getItem(returnUrlKey);
                            if (returnUrl) {
                                sessionStorage.removeItem(returnUrlKey);
                                return <Redirect to={returnUrl} />
                            }
                            return <Switchboard />
                        }} />
                        <Route path="/w/lights" component={Lights} />
                        <Route path="/w/game-echo" component={Games} />
                        <Route path="/w/game-echo/upload" component={EchoUploader} />
                        <Route path="/w/game-echo/details/:name" component={GameDetails} />
                        <Route path="/w/voter" render={() => (
                            <LoginRequired>
                                <Voter />
                            </LoginRequired>
                        )} />
                        <Route path="/w/settings" component={Settings} />
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        )
    }
});


module.exports = App;
