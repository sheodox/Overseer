self.addEventListener('push', (event) => {
	event.waitUntil(notify(event));
});

async function notify(event) {
	const payload = event.data.json();
	await self.registration.showNotification(`Overseer - ${payload.title}`, {
		body: payload.message,
		icon: '/assets/favicon.png',
		vibrate: [100],
		timestamp: new Date(payload.createdAt).getTime(),
		data: payload,
	});
}

self.addEventListener('notificationclick', (event) => {
	const notificationViewPath = `/n/${event.notification.data.id}`;

	event.waitUntil(
		(async function () {
			const allClients = await clients.matchAll({
				includeUncontrolled: true,
			});

			let openClient;

			for (const client of allClients) {
				const url = new URL(client.url);

				if (url.pathname === notificationViewPath) {
					client.focus();
					openClient = client;
					return;
				}
			}

			if (!openClient) {
				await clients.openWindow(notificationViewPath);
			}
		})()
	);
});

self.addEventListener(
	'pushsubscriptionchange',
	(event) => {
		event.waitUntil(
			fetch('/user/replace-push-subscription', {
				method: 'post',
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify({
					oldEndpoint: event.oldSubscription
						? event.oldSubscription.endpoint
						: localStorage.getItem('overseer-push-endpoint'),
					newSubscription: JSON.parse(JSON.stringify(event.newSubscription)),
				}),
			})
		);
	},
	false
);
