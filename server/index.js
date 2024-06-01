import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

import { Room } from './game/Room.js';
 
const __dirname = dirname(fileURLToPath(import.meta.url));
 
const app = express();
const server = createServer(app); 
const ioServer = new Server(server);

app.use(express.static(join(__dirname, '../client')));

//return information about available rooms
app.get('/rooms', (req, res) => {
  const rooms = roomList.map((room) => {
    return {
      id: room.id,
      playerNumber: room.players,
      playerLimit: room.playersLimit,
      name: room.name,
    }
  })
  res.json(rooms);
})

const roomList = [new Room({ioServer, roomName: 'unnamed'}), new Room({ioServer, roomName: 'royale battle'})];
roomList[0].startGame();
roomList.forEach((room) => {
  room.startGame();
});

//todo: make some auth
ioServer.use((socket, next) => {
  socket;
  next(); 
})

ioServer.on('connection', (socket) => {
  console.log('new connection');
  const {roomId, name} = socket.handshake.query;
  const roomToConnect = roomList.find((room) => room.id === roomId);
  if (!roomToConnect || typeof name !== 'string') {
    socket.disconnect(true);
    return;
  }
  roomToConnect.handlePlayerConnection(socket, name.slice(0, 10));
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});