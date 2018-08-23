const React = require('react');

const audioClips = {};

class Banshee extends React.Component {
    constructor(props) {
        super(props);
        this.state = {soundPaths: []};
    }
    componentWillMount() {
        window.Banshee = {
            load: path => {
                const paths = this.state.soundPaths.slice();
                if (!paths.includes(path)) {
                    paths.push(path);
                    this.setState({soundPaths: paths});
                }
            },
            play: (path, volume=1) => {
                const audio = audioClips[path];
                audio.volume = volume;
                audio.play();
            }
        }
    }
    render() {
        const audios = this.state.soundPaths.map((path, index) => {
            return <audio key={index} src={path} preload="auto" ref={c => audioClips[path] = c} />
        });
        return (
            <div style={{display: 'none'}}>
                {audios}
            </div>
        )
    }
}

module.exports = Banshee;
