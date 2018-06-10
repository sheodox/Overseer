import React from 'react';
const formatTags = require('../util/formatters').tags;

const TagCloud = React.createClass({
    getExistingTags () {
        const inputValue = (this.props.tagInput || {value: ''}).value.trim();
        return inputValue ? inputValue.split(',').map(tag => tag.trim()) : [];
    },
    tagClicked: function(tag) {
        let existingTags = this.getExistingTags();

        if (!existingTags.includes(tag)) {
            existingTags.push(tag);
        }
        else {
            existingTags.splice(existingTags.indexOf(tag), 1);
        }
        existingTags = formatTags(existingTags);
        this.props.tagInput.value = existingTags.join(', ');
        this.props.tagClicked();
    },
    render: function() {
        const existing = this.getExistingTags(),
            tags = (this.props.tags || []).map((tag, index) => {
                const selected = existing.includes(tag);
                return <a data-tag={tag} key={index} className={'tag-suggestion' + (selected ? ' selected' : '')} onClick={() => this.tagClicked(tag)}>
                    <span className="plus-character">{selected ? '-' : '+'}</span>{tag}
                    </a>;
            });
        return (
            <div className="tag-cloud">
                {tags}
            </div>
        )
    }
});

module.exports = TagCloud;
