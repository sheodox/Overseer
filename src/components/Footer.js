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
        const links = (user.links || []).map((link, i) => (
            <li key={i}><a href={link.href}>{link.text}</a></li>
        ));

        return (
            <section className="user">
                {user.profile_image ? <img src={user.profile_image} /> : ''}
                <div>
                    <span className="user-display-name">{user.display_name}</span>
                    <br />
                    <ul>
                        {links}
                    </ul>
                </div>
            </section>
        );
    }
});

module.exports = Footer;
