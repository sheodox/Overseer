const React = require('react'),
    SVG = require('./SVG');

class LoginRequired extends React.Component {
    storeReturnUrl() {
        sessionStorage.setItem('auth-return-url', location.pathname);
    }
    render() {
        if (user) {
            return this.props.children;
        }
        return (
            <section className="panel login-required">
                <div className="panel-title">
                    <SVG id="login-icon" />
                    <h2>Login Required</h2>
                </div>
                <div className="sub-panel">
                    <span>
                        You need to login to access this page. <a onClick={this.storeReturnUrl} href="/auth/google">Login</a>
                    </span>
                </div>
            </section>
        )
    }
}

module.exports = LoginRequired;
