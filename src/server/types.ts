import { User } from '@prisma/client';
import {Request} from 'express';

export interface AppRequest extends Request {
    user: User
}

//options available to sheodox-ui toasts
export interface ToastOptions {
    title: string
    message: string
    technicalDetails?: string
    variant: 'info' | 'error'
    href?: string
}