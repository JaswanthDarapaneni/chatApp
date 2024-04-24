const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const config = require('./env/config');

const app = express();
const io = http.createServer(app);

const server = new Server(io, { cors: { origin: [config.url, "http://localhost:3001"] } });

server.setMaxListeners(200);

module.exports = { io, server, app, express, mongoose, cors }