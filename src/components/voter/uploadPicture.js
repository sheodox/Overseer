const axios = require('axios'),
	formatters = require('../../util/formatters');

function uploadPicture(race_id, candidate_id, file) {
	const progressToast = Toaster.add({
		title: 'Voter - Uploading Image',
		type: 'progress'
	});

	const errorToast = msg => Toaster.add({type: 'text', text: 'Error! ' + msg});

	axios
		.request({
			method: 'POST',
			url: `/voter/${race_id}/${candidate_id}/upload`,
			data: file,
			headers: {
				'Content-type': file.type
			},
			onUploadProgress(e) {
				if (e.loaded === e.total) {
					progressToast({
						type: 'text',
						text: 'Processing uploaded image...'
					});
					return;
				}
				progressToast({
					value: e.loaded,
					max: e.total,
					text: `${formatters.bytes(e.loaded, 'mb')} mb / ${formatters.bytes(e.total, 'mb')} mb`
				})
			}
		})
		.then(() => {
			//if the old progress toast is still around, hide that and replace it with a new one
			progressToast({
				hidden: true
			});

			Toaster.add({
				type: 'text',
				title: 'Voter',
				text: 'Image uploaded!'
			});
		})
		.catch(e => {
			if (e.response.statusCode === 413) {
				errorToast('That image is too big!');
			}
			else {
				errorToast(e.response.statusText);
			}
		});
}


module.exports = uploadPicture;
