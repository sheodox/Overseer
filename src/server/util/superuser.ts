import { AppRequest } from '../types';

const superUserId = process.env.SUPER_USER_ID;

export function isReqSuperUser(req: AppRequest) {
	return req.user && superUserId && req.user.id === superUserId;
}
export function isUserSuperUser(userId: string) {
	// make sure a super user is defined, because otherwise if a superuser
	// is not configured then not logged in users could be super users (undefined === undefined)
	return superUserId && superUserId === userId;
}
