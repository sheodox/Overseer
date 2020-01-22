const React = require('react'),
	If = require('./If'),
	SVG = require('./SVG');

class Gaze extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentImage: null
		}
	}
	static getDerivedStateFromProps(props, state) {
		const images = props.images;

		if (images.length && !images.includes(state.currentImage)) {
			return {
				currentImage: images[0],
				maximized: false
			};
		}
		else if (images.length === 0) {
			return {
				currentImage: null,
				maximized: false
			};
		}

		return state;
	}
	pickImage(key) {
		this.setState({
			currentImage: key
		});
	};
	minimize = () => {
		// we don't want the background behind the image to toggle maximized, but we do want it to minimize when maximized
		this.setState({
			maximized: false
		})
	};
	toggleMaximized = (e) => {
		e.stopPropagation();
		this.setState({
			maximized: !this.state.maximized
		});
	};
	onDelete = (e) => {
		e.stopPropagation();
		this.props.onDelete(this.state.currentImage);
	};
	next = (e) => {
		e.stopPropagation();
		this.pickImageByOffset(1);
	};
	prev = (e) => {
		e.stopPropagation();
		this.pickImageByOffset(-1);
	};
	pickImageByOffset(offset) {
		const currentIndex = this.props.images.findIndex(id => id === this.state.currentImage),
			nextIndex = Math.max(0, Math.min(offset + currentIndex, this.props.images.length - 1));

		this.setState({
			currentImage: this.props.images[nextIndex]
		})
	}
	render() {
		if (!this.state.currentImage) {
			return null;
		}

		const src = (id, size) => `/image/${this.props.source}/${size}/${id}`,
			multipleImages = this.props.images.length > 1,
			current = this.state.currentImage,
			viewingFirst = this.props.images[0] === current,
			viewingLast = this.props.images[this.props.images.length - 1] === current,
			trayImages = this.props.images.map(id => {
				return <img key={`gaze-tray-${id}`} alt="" src={src(id, 'small')} onClick={this.pickImage.bind(this, id)} />
			});


		return (<div className="gaze sub-panel">
			<div className={'gaze-main' + (this.state.maximized ? ' maximized' : '')} onClick={this.minimize}>
				<img  src={src(this.state.currentImage, this.state.maximized ? 'large' : 'medium')} onClick={this.toggleMaximized} className="gaze-main-image" alt=""/>
				<If renderWhen={multipleImages}>
					<div className="gaze-actions centered-buttons">
						<button onClick={this.prev} disabled={viewingFirst} className="gaze-prev">
							<SVG id="chevron-icon" />
							Previous
						</button>

						<If renderWhen={this.props.canDelete}>
							<button className="gaze-delete" onClick={this.onDelete} title="Delete this image">
								<SVG id="x-icon"/>
								Delete
							</button>
						</If>

						<button onClick={this.next} disabled={viewingLast} className="gaze-next">
							Next
							<SVG id="chevron-icon" />
						</button>
					</div>
				</If>
			</div>

			<If renderWhen={multipleImages}>
				<div className="gaze-tray inset-panel">
					{trayImages}
				</div>
			</If>
		</div>)
	}
}

module.exports = Gaze;
