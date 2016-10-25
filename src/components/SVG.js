import React from 'react';

export default React.createClass({
    render: function() {
        var useTag = `<use xlink:href="#${this.props.id}" />`;
        return (
            <svg className={this.props.className} viewBox="0 0 100 100" dangerouslySetInnerHTML={{__html: useTag}}></svg>
        );
    }
});