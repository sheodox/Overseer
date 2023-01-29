import { writable, derived, get } from 'svelte/store';
import { serialize, deserialize } from 'onaji';
import { Envoy } from '../../../shared/envoy';
import axios from 'axios';
import { bytes, tags as formatTags } from '../../../shared/formatters';
import { createAutoExpireToast, createProgressToast, updateToast } from 'sheodox-ui';
import { socket } from '../../socket';
import page from 'page';
import { activeQueryParams, activeRoute } from './routing';
import { uploadImage, booker } from './app';
import { applyChange } from 'deep-diff';
import { appBootstrap } from './app';
import type { EchoData, EchoItemEditable } from '../../../shared/types/echo';

const echoEnvoy = new Envoy(socket, 'echo', true);

const initialEchoData = appBootstrap.initialData.echo;
let untouchedEchoData = initialEchoData;
export const echoInitialized = writable(!!initialEchoData);
export const echoItems = writable([], () => {
	//if they don't have echo permissions, or they've already initialized, don't try and initialize anymore
	if (!booker.echo.view || get(echoInitialized)) {
		return;
	}

	echoEnvoy.emit('init');
});
export const echoDiskUsage = writable(null);
export const echoDownloadToken = writable(appBootstrap.initialData.echoDownloadToken || '');
export const echoOnline = writable(false);
export const echoTagCloud = writable([]);
export const echoSearch = writable(get(activeQueryParams).search);
echoSearch.subscribe((search) => {
	if (get(activeRoute) === 'echo') {
		page(`/echo` + (search ? `?search=${encodeURIComponent(search)}` : ''));
	}
});

if (initialEchoData) {
	setEchoData(initialEchoData);
}

export const echoSearchResults = derived([echoItems, echoSearch], ([list, search]) => {
	//be extra sure we make sure we don't mess with the original data
	list = deserialize(serialize(list));

	if (search) {
		const terms = formatTags(search),
			relevancy = list.map((item) => {
				//add the item name to the searchable data and format that array as tags so everything is normalized
				const searchable = formatTags([...formatTags(item.tags || ''), item.name]);

				const matches = terms.filter((term) => {
					return !!searchable.find((item) => {
						return item.indexOf(term) >= 0;
					});
				}).length;
				item.relevancy = matches / terms.length;
				return { item, matches };
			});

		return relevancy
			.filter((hit) => {
				return hit.matches > 0;
			})
			.sort((a, b) => b.matches - a.matches)
			.map((hit) => {
				return hit.item;
			});
	} else {
		return list;
	}
});

function setEchoData(data: EchoData) {
	untouchedEchoData = data;

	echoItems.set(data.items);
	echoDiskUsage.set(data.diskUsage);
	echoOnline.set(data.echoOnline);
	echoTagCloud.set(data.tagCloud);
	echoInitialized.set(true);
}

echoEnvoy.on({
	init: (data) => {
		setEchoData(data);
	},
	diff: (changes) => {
		if (get(echoInitialized)) {
			for (const change of changes) {
				applyChange(untouchedEchoData, null, change);
			}
			setEchoData(untouchedEchoData);
		}
	},
	downloadToken: (token) => {
		echoDownloadToken.set(token);
	},
});

export const echoOps = {
	delete: (id: string) => {
		echoEnvoy.emit('delete', id);
	},
	update(id: string, updatedEchoProperties: EchoItemEditable) {
		echoEnvoy.emit('update', id, updatedEchoProperties);
	},
	uploadImage: (id: string, file: File) => {
		return uploadImage('Echo Image Upload', file, `/echo/${id}/image-upload`);
	},
	deleteImage: (id: string) => {
		echoEnvoy.emit('deleteImage', id);
	},
	/**
	 * Saves metadata changes and file changes, then resolves with an ID for this echo item.
	 * @param {null|string} updatingId - optional ID, if an ID is passed this will overwrite the data/file for that ID, otherwise it will create a new Echo item
	 * @param metadata - user editable metadata to save
	 * @param file - a zip file to upload
	 * @returns {Promise<string>}
	 */
	upload(updatingId: string, metadata: EchoItemEditable, file: File): Promise<string> {
		return new Promise((resolve) => {
			const uploadFile = async (id: string, uploadUrl: string) => {
				const startTime = Date.now(),
					toastId = createProgressToast({
						title: `Echo - ${metadata.name}`,
						message: '',
						value: 0,
						min: 0,
						max: file.size,
					});

				axios(uploadUrl, {
					method: 'POST',
					data: file,
					onUploadProgress: (e) => {
						const elapsedSeconds = (Date.now() - startTime) / 1000,
							//calculate time till completion
							percentDone = e.loaded / e.total,
							bytesPerSecond = e.loaded / elapsedSeconds,
							//remaining = percent left/percent per second
							secondsTillDone = (1 - percentDone) / (percentDone / elapsedSeconds),
							showMinutes = secondsTillDone > 60,
							megabytesPerSecond = bytes(bytesPerSecond, 'mb'),
							remaining = `${Math.floor(showMinutes ? secondsTillDone / 60 : secondsTillDone)}${
								showMinutes ? 'm' : 's'
							}`;

						updateToast(toastId, {
							value: e.loaded,
							message:
								e.loaded === e.total
									? 'Upload complete!'
									: `${bytes(e.loaded, 'gb')} / ${bytes(e.total, 'gb')} gb - ${megabytesPerSecond} mb/s (${remaining})`,
						});
					},
				})
					.then(() => {
						// Banshee.play(beep, 0.4);
					})
					.catch((err) => {
						createAutoExpireToast({
							variant: 'error',
							title: 'Upload Error',
							message: 'There was a problem uploading the file',
							technicalDetails: err,
						});
					});

				resolve(id);
			};

			if (updatingId) {
				echoEnvoy.emit('updateFile', updatingId, metadata, uploadFile);
			} else {
				echoEnvoy.emit('new', metadata, uploadFile);
			}
		});
	},
};
