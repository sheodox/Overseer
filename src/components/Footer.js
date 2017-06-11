const React = require('react');

const Footer = React.createClass({
    render: function() {
        return (
            <footer>
                <UserData />
            </footer>
        );
    }
});

const UserData = React.createClass({
    render: function() {
        if (!user) {
            return (<section />);
        }
        return (
            <section className="user">
                {user.photoUrl ? <img src={user.photoUrl} /> : ''}
                <div>
                    <span className="user-display-name">{user.displayName}</span>
                    <br />
                    <a href="/auth/logout">Logout</a>
                </div>
            </section>
        );
    }
});

module.exports = Footer;
