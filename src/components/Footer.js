const React = require('react');

class Footer extends React.Component {
    render() {
        return (
            <footer>
                <UserData />
            </footer>
        );
    }
}

class UserData extends React.Component {
    render() {
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
}

module.exports = Footer;
