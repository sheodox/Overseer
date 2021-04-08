import {writable, get} from 'svelte/store';
import {createAutoExpireToast, createProgressToast, updateToast} from "sheodox-ui";
import {post} from "axios";
import {bytes as formatBytes} from "../../../shared/formatters";
import {Conduit} from "../../../shared/conduit";
import {socket} from "../../socket";
const appConduit = new Conduit(socket, 'app');

export const pageName = writable('');
pageName.subscribe(page => {
    const app = 'Overseer';
    document.title = page ? `${page} - ${app}` : app;
});

export function uploadImage(toastTitle, file, postPath) {
    const progressToastId = createProgressToast({
        title: toastTitle,
        message: '',
        min: 0,
        max: file.size
    });

    const errorToast = message => createAutoExpireToast({
        variant: 'error',
        title: 'Upload Error',
        message
    });

    return post(postPath, file, {
        headers: {
            'Content-type': file.type
        },
        onUploadProgress(e) {
            if (e.loaded === e.total) {
                updateToast(progressToastId, {
                    message: 'Upload complete!',
                    value: e.loaded,
                    max: e.total,
                });
                return;
            }
            updateToast(progressToastId, {
                value: e.loaded,
                max: e.total,
                messaage: `${formatBytes(e.loaded, 'mb')} mb / ${formatBytes(e.total, 'mb')} mb`
            })
        }
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

export const userRegistry = writable({});

export function requestUser(userId) {
    const user = get(userRegistry)[userId];

    if (!user) {
        userRegistry.update(registry => {
            registry[userId] = {
                loading: true
            };
            return registry;
        });

        appConduit.emit('getUserMeta', userId, (meta) => {
            userRegistry.update(registry => {
                registry[userId] = {
                    loading: false,
                    ...meta
                }
                return registry;
            });
        });
    }
}

export function scrollPageToTop() {
    window.scrollTo(0, 0);
}