const React = require('react'),
    formatTags = require('../util/formatters').tags;

class TagCloud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            used: []
        }
    }
    captureUsedTags (fallbackValue) {
        //safety for when we render before other components might be initialized
        const inputValue = (this.props.tagInput || {value: (fallbackValue || '')}).value.trim();
        this.setState({
            used: inputValue ? inputValue.split(',').map(tag => tag.trim()) : []
        });
    }
    tagClicked = (tag) => {
        if (this.props.readOnly) {
            return;
        }

        let existingTags = this.state.used;

        if (!existingTags.includes(tag)) {
            existingTags.push(tag);
        }
        else {
            existingTags.splice(existingTags.indexOf(tag), 1);
        }
        existingTags = formatTags(existingTags);
        this.props.tagInput.value = existingTags.join(', ');
        if (typeof this.props.tagClicked === 'function') {
            this.props.tagClicked();
        }
        this.captureUsedTags();
    };
    render() {
        const existing = this.state.used,
            tags = (this.props.tags || []).map((tag, index) => {
                const selected = existing.includes(tag);
                if (!this.props.readOnly || selected) {
                    return <a data-tag={tag} key={index} className={'tag-suggestion' + (selected ? ' selected' : '')}
                              onClick={() => this.tagClicked(tag)}>
                        <span className={"plus-character" + (this.props.readOnly ? ' hidden' : '')} >{selected ? '-' : '+'}</span>{tag}
                    </a>;
                }
                return null;
            });
        return (
            <div className={"tag-cloud" + (this.props.readOnly ? ' readonly' : '')}>
                {tags}
            </div>
        )
    }
}

module.exports = TagCloud;
