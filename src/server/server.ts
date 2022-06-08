import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

export const app = express();
export const server = createServer(app);
export const internalServerApp = express();
export const internalServer = createServer(internalServerApp);
export const io = new SocketIOServer(server);
export const wss = new WebSocketServer({ noServer: true });
