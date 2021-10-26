import {writable, get, readable} from 'svelte/store';
import {createAutoExpireToast, createProgressToast, updateToast} from "sheodox-ui";
import {post} from "axios";
import {bytes as formatBytes} from "../../../shared/formatters";
import {Envoy} from "../../../shared/envoy";
import {socket} from "../../socket";
const appEnvoy = new Envoy(socket, 'app');

export const pageName = writable('');
pageName.subscribe(page => {
    const app = 'Overseer';
    document.title = page ? `${page} - ${app}` : app;
});
export const pushSubscribed = writable(true, set => {
    navigator.serviceWorker.ready
        .then(sw => {
            return sw.pushManager.getSubscription();
        })
        .then(pushSubscription => {
			appEnvoy.emit('ensurePushSubscription', pushSubscription);
			set(!!pushSubscription);

			if (pushSubscription) {
				const subscription = JSON.parse(JSON.stringify(pushSubscription));
				storePushEndpoint(subscription);
			}
        })
});

//ensure we know what the last known subscription was, so if we need to update the subscription endpoint /was/
//so it can be replaced if the serviceworker gets a pushsubscriptionchange event
export function storePushEndpoint(subscription) {
	localStorage.setItem('overseer-push-endpoint', subscription.endpoint);
}

export let settings = writable(window.user?.settings);

let settingsSubscriptionInitialized = false;
settings.subscribe(settings => {
    //skip the first run of this, we only care about changes to the settings, not its initial value
    if (!settingsSubscriptionInitialized) {
        settingsSubscriptionInitialized = true;
        return;
    }
    appEnvoy.emit('updateSettings', settings);
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
                message: `${formatBytes(e.loaded, 'mb')} mb / ${formatBytes(e.total, 'mb')} mb`
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

        appEnvoy.emit('getUserMeta', userId, (meta) => {
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

