import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

import { Room } from './game/Room.js';
 
const __dirname = dirname(fileURLToPath(import.meta.url));
 
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, '../client')));

app.get('/rooms', (req, res) => {
  const rooms = roomList.map((room) => {
    return {
      id: room.id,
      playerLimit: room.playerLimit,
      playerNumber: room.playerNumber
    }
  })
  res.json(rooms)
})

const roomList = [new Room(io), new Room(io)];

io.on('connection', (socket) => {
  const roomId = socket.handshake.query['roomId'];
  const roomToConnect = roomList.find((room) => room.id === roomId);
  if (!roomToConnect) {
    socket.disconnect(true);
    return;
  }
  roomToConnect.handlePlayerConnection(socket)
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});