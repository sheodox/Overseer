import type { EchoData } from './echo';
import type { VoterData } from './voter';
import type { EventsData } from './events';

export interface User {
	id: string;
	oauthId: string;
	displayName: string;
	profileImage: string;
	createdAt: Date;
	lastActiveAt: Date;
	settings?: UserSettings;
	links: {
		href: string;
		text: string;
		icon: string;
	}[];
}

export interface BookerPermissions {
	voter: {
		view: boolean;
		vote: boolean;
		remove_candidate: boolean;
		rename_race: boolean;
		remove_race: boolean;
		reset_votes: boolean;
		update_candidate: boolean;
		ban_candidate: boolean;
		add_race: boolean;
		add_candidate: boolean;
		add_image: boolean;
		remove_image: boolean;
	};
	echo: {
		view: boolean;
		upload: boolean;
		download: boolean;
		delete: boolean;
		update: boolean;
		add_image: boolean;
		remove_image: boolean;
	};
	events: {
		view: boolean;
		organize: boolean;
		rsvp: boolean;
	};
	app: {
		user_meta: boolean;
		notifications: boolean;
		settings: boolean;
	};
}

export interface UserSettings {
	notifyEchoUploads: boolean;
	notifyEventReminders: boolean;
	notifyNewEvents: boolean;
	notifySiteAnnouncements: boolean;
	pushNotifications: boolean;
}

export interface AppBootstrap {
	booker: BookerPermissions;
	user?: User;
	initialData: {
		echo: EchoData;
		voter: VoterData;
		events: EventsData;
	};
	serverMetadata: {
		pushVapidPublicKey: string;
	};
}
