const React = require('react');

class UserBubble extends React.Component {
    render() {
        if (!this.props.user) {
            return null;
        }
        return <img className="user-bubble" src={this.props.user.profile_image} title={this.props.user.display_name} />
    }
}

module.exports = UserBubble;
