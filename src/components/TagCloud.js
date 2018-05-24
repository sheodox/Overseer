import React from 'react';
const formatTags = require('../util/formatters').tags;

const TagCloud = React.createClass({
    tagClicked: function(tag) {
        console.log(tag);
        const inputValue = this.props.tagInput.value.trim();
        let existingTags = inputValue ? inputValue.split(',').map(tag => tag.trim()) : [];

        if (!existingTags.includes(tag)) {
            existingTags.push(tag);
            existingTags = formatTags(existingTags);
            this.props.tagInput.value = existingTags.join(', ');
        }
        this.props.tagClicked();
    },
    render: function() {
        const tags = (this.props.tags || []).map((tag, index) => {
            return <a data-tag={tag} key={index} className="tag-suggestion" onClick={() => this.tagClicked(tag)}><span className="plus-character">+</span>{tag}</a>;
        });
        return (
            <div className="tag-cloud">
                {tags}
            </div>
        )
    }
});

module.exports = TagCloud;
