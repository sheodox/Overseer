import {BrowserRouter, Route, Redirect} from 'react-router-dom';
const React = require('react'),
    Header = require('./Header'),
    Banshee = require('./Banshee'),
    Toaster = require('./Toaster'),
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
        let content = <main className="content"><LoginRequired /></main>;

        if (user) {
            content = <main className="content">
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
                <Route path="/w/game-echo" render={({match}) => {
                    if (!Booker.echo.view) {
                        return <Redirect to="/" />
                    }
                    return <div>
                        <Route exact path={`${match.url}`} component={Games} />
                        <Route path={`${match.url}/upload`} component={EchoUploader} />
                        <Route path={`${match.url}/details/:fileName`} component={GameDetails} />
                    </div>;
                }} />
                <Route path="/w/voter" compontent={Voter} />
                <Route path="/w/settings" component={Settings} />
            </main>
        }

        return (
            <BrowserRouter>
                <div>
                    <Banshee />
                    <Toaster />
                    <Header />
                    {content}
                    <Footer />
                </div>
            </BrowserRouter>
        )
    }
});


module.exports = App;
