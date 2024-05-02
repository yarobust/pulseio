import { Game } from './Game.js';
import {v4 as uuidv4 } from 'uuid';

export class Room {
  constructor(io) {
    this.io = io;
    this.id = uuidv4();
    this.playerNumber = 0;
    this.playerLimit = 2;
  }
  /** @param {import('socket.io').Socket} socket  */
  handlePlayerConnection(socket) {
    console.log(`player ${socket.id} connected to room ${this.id}`);
    socket.on('disconnect', () => {
      this.handlePlayerDisconnection(socket);
    });

    if (!this.game) {
      this.startGame();
    }

    socket.join(this.id);
    //add player to game
    socket.on('send:message', (message) => {
      io.to(this.id).emit('send:message', message);
    })
  }
  handlePlayerDisconnection() {
    console.log('user disconnected from roomId', this.id);
  }

  startGame() {
    console.log('game started');
    this.game = new Game();
  }
  stopGame() {

  }
}