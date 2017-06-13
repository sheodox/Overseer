import React from 'react';
import SVG from './SVG';

const LoginRequired = React.createClass({
    storeReturnUrl: function() {
        sessionStorage.setItem('auth-return-url', location.pathname);
    },
    render: function() {
        if (user) {
            return this.props.children;
        }
        return (
            <section className="panel login-required">
                <div className="panel-title">
                    <h2>Login Required</h2>
                    <SVG id="login-icon" />
                </div>
                <div className="sub-panel">
                    <span>
                        You need to login to access this page. <a onClick={this.storeReturnUrl} href="/auth/google">Login</a>
                    </span>
                </div>
            </section>
        )
    }
});

module.exports = LoginRequired;