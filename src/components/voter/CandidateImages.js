const React = require('react'),
	If = require('../If'),
	Gaze = require('../Gaze'),
	Conduit = require('../../util/conduit'),
	voterConduit = new Conduit(socket, 'voter');

function uploadPicture(race_id, candidate_id, file) {
	fetch(`/voter/${race_id}/${candidate_id}/upload`, {
		method: 'POST',
		body: file
	})
		.then(response => {
			const errorToast = msg => Toaster.add({type: 'text', text: 'Error! ' + msg});

			if(response.status === 413) {
				errorToast('That image is too big!');
			}
			else if (!response.ok) {
				errorToast(response.statusText)
			}
		});
}

class CandidateImages extends React.Component {
	constructor(props) {
		super(props);
	}
	upload (e) {
		const file = e.target.files.item(0);
		uploadPicture(this.props.race_id, this.props.candidate_id, file);
		e.target.value = '';
	}
	deleteImage = (id) => {
		if (confirm('Are you sure you want to remove this image?')) {
			voterConduit.emit('removeImage', id);
		}
	};
	render() {
		const candidateIdBase = `candidate-${this.props.race_id}-${this.props.candidate_id}-`,
			uploadInputId = candidateIdBase + 'upload';

		return (
			<React.Fragment>
				<Gaze source="voter" images={this.props.images.map(i => i.image_id)} canDelete={Booker.voter.remove_image} onDelete={this.deleteImage}/>

				<If renderWhen={Booker.voter.add_image}>
					<div className="centered-buttons">
						<label className="upload-candidate-image as-button" htmlFor={uploadInputId}>Attach an image</label>
						<input id={uploadInputId} className='hidden' onChange={this.upload.bind(this)} type="file" accept="image/png, image/jpeg" />
					</div>
				</If>
			</React.Fragment>
		);
	}
}

module.exports = CandidateImages;