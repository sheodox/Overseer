import type { EchoImage, Prisma } from '@prisma/client';

export interface PreparedEchoItem extends Omit<EchoItem, 'size'> {
	//Echo stores this as a BigInt because an int in postgres is too small
	//to handle files over about 2GB, but a regular number in JS is big enough,
	//we have to convert it this otherwise JSON.stringify() will get mad
	size: number;
	//the url path to view this in Overseer
	path: string;
	//the url path to edit this in Overseer
	editPath: string;
	//a full URL for downloading this item from Echo (does not include the download token)
	downloadUrl: string;
	//markdown rendered notes
	notesRendered: string;
	images: EchoImage[];
}

type EchoItem = Prisma.EchoGetPayload<{}>;

export interface EchoDiskUsage {
	total: number;
	used: number;
	free: number;
}

export interface EchoData {
	diskUsage?: EchoDiskUsage;
	echoOnline: boolean;
	echoServerHost: string;
	items: PreparedEchoItem[];
	tagCloud: string[];
}

export type EchoItemEditable = Pick<EchoItem, 'tags' | 'name' | 'notes'>;
export type EchoServerData = Pick<EchoItem, 'size'>;
