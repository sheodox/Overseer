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


module.exports = uploadPicture;
