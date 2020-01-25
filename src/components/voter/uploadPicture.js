const axios = require('axios'),
	formatters = require('../../util/formatters');

function uploadPicture(race_id, candidate_id, file) {
	const progressToast = Toaster.add({
		title: 'Voter - Uploading Image',
		type: 'progress'
	});

	axios
		.request({
			method: 'POST',
			url: `/voter/${race_id}/${candidate_id}/upload`,
			data: file,
			headers: {
				'Content-type': file.type
			},
			onUploadProgress(e) {
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
		});
}


module.exports = uploadPicture;
