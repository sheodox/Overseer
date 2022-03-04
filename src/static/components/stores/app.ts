import { writable, get } from 'svelte/store';
import { createAutoExpireToast, createProgressToast, updateToast } from 'sheodox-ui';
import axios from 'axios';
import { bytes as formatBytes } from '../../../shared/formatters';
import { Envoy } from '../../../shared/envoy';
import { socket } from '../../socket';
import { AppBootstrap, User } from '../../../shared/types/app';
const appEnvoy = new Envoy(socket, 'app');

export const appBootstrap = (window as unknown as { __APP_BOOTSTRAP__: AppBootstrap }).__APP_BOOTSTRAP__;

export const booker = appBootstrap?.booker;
export const user = { loading: false, ...appBootstrap?.user };

export const pageName = writable('');
pageName.subscribe((page) => {
	const app = 'Overseer';
	document.title = page ? `${page} - ${app}` : app;
});
export const pushSubscribed = writable(true, (set) => {
	navigator.serviceWorker.ready
		.then((sw) => {
			return sw.pushManager.getSubscription();
		})
		.then((pushSubscription) => {
			set(!!pushSubscription);

			if (pushSubscription) {
				const subscription = JSON.parse(JSON.stringify(pushSubscription));
				appEnvoy.emit('ensurePushSubscription', subscription);
				storePushEndpoint(subscription);
			}
		});
});

pushSubscribed.subscribe((subscribed) => {
	console.log('Push subscribed?', subscribed);
});

export const socketConnected = writable(true);

socket.on('connect', () => socketConnected.set(true));
socket.on('disconnect', () => socketConnected.set(false));

//ensure we know what the last known subscription was, so if we need to update the subscription endpoint /was/
//so it can be replaced if the serviceworker gets a pushsubscriptionchange event
export function storePushEndpoint(subscription: PushSubscription) {
	localStorage.setItem('overseer-push-endpoint', subscription.endpoint);
}

export const settings = writable(appBootstrap?.user?.settings);

let settingsSubscriptionInitialized = false;
settings.subscribe((settings) => {
	//skip the first run of this, we only care about changes to the settings, not its initial value
	if (!settingsSubscriptionInitialized) {
		settingsSubscriptionInitialized = true;
		return;
	}
	appEnvoy.emit('updateSettings', settings);
});

export function uploadImage(toastTitle: string, file: File, postPath: string) {
	const progressToastId = createProgressToast({
		title: toastTitle,
		message: '',
		min: 0,
		max: file.size,
	});

	const errorToast = (message: string) =>
		createAutoExpireToast({
			variant: 'error',
			title: 'Upload Error',
			message,
		});

	return axios
		.post(postPath, file, {
			headers: {
				'Content-type': file.type,
			},
			onUploadProgress(e: ProgressEvent) {
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
					message: `${formatBytes(e.loaded, 'mb')} mb / ${formatBytes(e.total, 'mb')} mb`,
				});
			},
		})
		.catch((e: any) => {
			if (e.response.statusCode === 413) {
				errorToast('That image is too big!');
			} else {
				errorToast(e.response.statusText);
			}
		});
}

export type UserRegistryUser = { loading: true } | ({ loading: false } & User);
export const userRegistry = writable<Record<string, UserRegistryUser>>({});

export function requestUser(userId: string) {
	const user = get(userRegistry)[userId];

	if (!user) {
		userRegistry.update((registry) => {
			registry[userId] = {
				loading: true,
			};
			return registry;
		});

		appEnvoy.emit('getUserMeta', userId, (meta: User) => {
			userRegistry.update((registry) => {
				registry[userId] = {
					loading: false,
					...meta,
				};
				return registry;
			});
		});
	}
}

export function scrollPageToTop() {
	window.scrollTo(0, 0);
}
