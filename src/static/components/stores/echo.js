import {writable, derived, get} from "svelte/store";
import {Envoy} from "../../../shared/envoy";
import {post} from "axios";
import {bytes, tags as formatTags} from "../../../shared/formatters";
import {createProgressToast, updateToast} from 'sheodox-ui';
import {socket} from "../../socket";
import page from 'page';
import {activeQueryParams, activeRoute} from "./routing";
import {uploadImage} from "./app";
import {applyChange} from "deep-diff";
const echoEnvoy = new Envoy(socket, 'echo');

const initialEchoData = __INITIAL_STATE__.echo;
let untouchedEchoData = initialEchoData;
export const echoInitialized = writable(!!initialEchoData);
export const echoItems = writable([], () => {
    //if they don't have echo permissions, or they've already initialized, don't try and initialize anymore
    if (!Booker.echo.view || get(echoInitialized)) {
        return;
    }

    echoEnvoy.emit('init', data => {
        setEchoData(data);
    });
});
export const echoDiskUsage = writable(null)
export const echoDownloadToken = writable('');
export const echoOnline = writable(false);
export const echoTagCloud = writable([]);
export const echoSearch = writable(get(activeQueryParams).search);
echoSearch.subscribe(search => {
    if (get(activeRoute) === 'echo') {
        page(`/echo` + (search ? `?search=${encodeURIComponent(search)}` : ''));
    }
})

if (initialEchoData) {
	setEchoData(initialEchoData);
}

export const echoSearchResults = derived([echoItems, echoSearch], ([list, search]) => {
    //be extra sure we make sure we don't mess with the original data
    list = JSON.parse(JSON.stringify(list));

    if (search) {
        const terms = formatTags(search),
            relevancy = list.map(item => {
                //add the item name to the searchable data and format that array as tags so everything is normalized
                const searchable = formatTags([
                    ...(formatTags(item.tags || '')),
                    item.name
                ]);

                let matches = terms.filter(term => {
                    return !!searchable.find(item => {
                        return item.indexOf(term) >= 0;
                    });
                }).length;
                item.relevancy = matches / terms.length;
                return {item, matches};
            });

        return relevancy
            .filter(hit => {
                return hit.matches > 0;
            })
            .sort((a, b) => b.matches - a.matches)
            .map(hit => {
                return hit.item;
            })
    }
    else {
        return list;
    }
});

function setEchoData(data) {
    untouchedEchoData = data;

    echoItems.set(data.items);
    echoDiskUsage.set(data.diskUsage);
    echoOnline.set(data.echoOnline);
    echoTagCloud.set(data.tagCloud);
    echoInitialized.set(true);
}

echoEnvoy.on({
    diff: (changes) => {
        if (get(echoInitialized)) {
            for (const change of changes) {
                applyChange(untouchedEchoData, change);
            }
            setEchoData(untouchedEchoData)
        }
    },
    downloadToken: token => {
        echoDownloadToken.set(token);
    }
});

export const echoOps = {
    delete: id => {
        echoEnvoy.emit('delete', id);
    },
    update(id, updatedEchoProperties) {
        echoEnvoy.emit('update', id, updatedEchoProperties);
    },
    uploadImage: (id, file) => {
        return uploadImage(
            'Echo Image Upload',
            file,
            `/echo/${id}/image-upload`
        )
    },
    deleteImage: (id) => {
        echoEnvoy.emit('deleteImage', id);
    },
    /**
     * Saves metadata changes and file changes, then resolves with an ID for this echo item.
     * @param {null|string} updatingId - optional ID, if an ID is passed this will overwrite the data/file for that ID, otherwise it will create a new Echo item
     * @param metadata - user editable metadata to save
     * @param file - a zip file to upload
     * @returns {Promise<string>}
     */
    upload(updatingId, metadata, file) {
        return new Promise((resolve) => {
            const uploadFile = async (id, uploadUrl) => {
                const formData = new FormData(),
                    startTime = Date.now(),
                    toastId = createProgressToast({
                        title: `Echo - ${metadata.name}`,
                        message: '',
                        min: 0,
                        max: file.size
                    })
                formData.append('echo-item', file);

                post(uploadUrl, formData, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    onUploadProgress: (e) => {
                        const elapsedSeconds = (Date.now() - startTime) / 1000,
                            //calculate time till completion
                            percentDone = e.loaded / e.total,
                            bytesPerSecond = e.loaded / elapsedSeconds,
                            //remaining = percent left/percent per second
                            secondsTillDone = (1 - percentDone) / (percentDone / elapsedSeconds),
                            showMinutes = secondsTillDone > 60,
                            megabytesPerSecond = bytes(bytesPerSecond, 'mb'),
                            remaining = `${Math.floor(showMinutes ? secondsTillDone / 60 : secondsTillDone)}${showMinutes ? 'm' : 's'}`;

                        updateToast(toastId, {
                            value: e.loaded,
                            message: e.loaded === e.total ? 'Upload complete!' :
                                `${bytes(e.loaded, 'gb')} / ${bytes(e.total, 'gb')} gb - ${megabytesPerSecond} mb/s (${remaining})`
                        });
                    }
                })
                    .then(() => {
                        // Banshee.play(beep, 0.4);
                    });

                resolve(id);
            };

            if (updatingId) {
                echoEnvoy.emit('updateFile', updatingId, metadata, uploadFile)
            } else {
                echoEnvoy.emit('new', metadata, uploadFile)
            }
        });
    }
}
