const React = require('react'),
    {BrowserRouter, Route, Redirect} = require('react-router-dom'),
    Header = require('./Header'),
    Banshee = require('./Banshee'),
    Toaster = require('./Toaster'),
    Footer = require('./Footer'),
    Switchboard = require('./Switchboard'),
    Games = require('./Games'),
    Lights = require('./Lights'),
    Voter = require('./voter/Voter'),
    EchoUploader = require('./EchoUploader'),
    GameDetails = require('./GameDetails'),
    Settings = require('./Settings'),
    LoginRequired = require('./LoginRequired');

class AppControl {
    constructor() {}

    /**
     * Sets the document title, if nothing is passed it resets it.
     * @param newTitle
     */
    title(newTitle) {
        document.title = (newTitle ? newTitle + ' - ' : '') + 'Overseer';
    }
}
window.AppControl = new AppControl();

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let content = <main className="content" key="main"><LoginRequired /></main>;

        if (user) {
            content = <main className="content" key="main">
                <Route exact path="/" render={() => {
                    const returnUrlKey = 'auth-return-url',
                        returnUrl = sessionStorage.getItem(returnUrlKey);
                    if (returnUrl) {
                        sessionStorage.removeItem(returnUrlKey);
                        return <Redirect to={returnUrl} />
                    }
                    return <Switchboard />
                }} />
                <Route exact path="/w/" render={() => {
                    // '/w/' without any module isn't valid, but could happen from clicking the background, just redirect to the landing page
                    return <Redirect to='/'/>
                }}/>
                <Route path="/w/lights" component={Lights} />
                <Route path="/w/game-echo" render={({match}) => {
                    if (!Booker.echo.view) {
                        return <Redirect to="/" />
                    }
                    return <div>
                        <Route exact path={`${match.url}`} component={Games} />
                        <Route path={`${match.url}/upload`} component={EchoUploader} />
                        <Route path={`${match.url}/details/:file`} component={GameDetails} />
                    </div>;
                }} />
                <Route path="/w/voter/:race" exact render={props => {
                    return <Redirect to={`/w/voter/${props.match.params.race}/ranking`} />
                }} />
                <Route path="/w/voter/:race?/:viewMode?" component={Voter} />
                <Route path="/w/settings" component={Settings} />
            </main>
        }

        return [
            <Banshee key="banshee"/>,
            <Toaster key="toaster"/>,
            <Header key="header"/>,
            content,
            <Footer key="footer" />
        ]
    }
}


module.exports = function() {
    return <BrowserRouter>
        <Route path="*" component={App} />
    </BrowserRouter>;
};
