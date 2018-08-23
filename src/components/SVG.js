const React = require('react');

class SVG extends React.Component {
    render() {
        var useTag = `<use xlink:href="#${this.props.id}" />`;
        return (
            <svg className={this.props.className} viewBox="0 0 100 100" dangerouslySetInnerHTML={{__html: useTag}}></svg>
        );
    }
}

module.exports = SVG;
