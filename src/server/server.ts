import express from "express";
import {Server as SocketIOServer} from "socket.io";

export const app = express();
export const server = require('http').createServer(app);
export const io = new SocketIOServer(server);
