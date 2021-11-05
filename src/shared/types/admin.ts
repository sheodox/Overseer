import type { Prisma } from '@prisma/client';

export type BookerModuleName = 'echo' | 'voter' | 'events' | 'app';

export interface BookerRole extends Prisma.BookerRoleGetPayload<{}> {
	permissions: Record<string, boolean>;
}
export type BookerAssignment = Prisma.BookerAssignmentGetPayload<{}>;

export type BookerDump = {
	moduleName: BookerModuleName;
	actions: string[];
	assignments: BookerAssignment[];
	roles: BookerRole[];
};
