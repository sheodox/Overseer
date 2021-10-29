import { v4 as uuidv4 } from 'uuid';
import { Response, NextFunction } from 'express';
import { AppRequest } from '../types';

export const requestId = (req: AppRequest, res: Response, next: NextFunction) => {
	const requestId = uuidv4();
	req.requestId = requestId;
	res.set('X-Request-ID', requestId);
	next();
};
