import { Game } from './Game.js';
import { v4 as uuidv4 } from 'uuid';

export class Room {
  /** @param {import('socket.io').Server} ioServer */
  constructor(ioServer) {
    this._ioServer = ioServer;
    this._id = uuidv4();
    this._players = [];
    this._playerLimit = 6;
    /** @type {Game} */
    this._game = new Game();
    this._tickLengthMs = 1000 / 20;
    this._gameLoopTimeoutId;
  }
  /** @param {import('socket.io').Socket} socket  */
  handlePlayerConnection(socket) {
    // should be placed before 'socket:disconnect' handler. Unnecessary to handle disconnection of not yet added player
    if (this._players.length >= this._playerLimit) {
      socket.emit('disconnect:reason', 'Room is already filled');
      socket.disconnect(true);
      return;
    }

    console.log(`player ${socket.id} connected to room ${this._id}`);
    socket.on('disconnect', () => {
      this.handlePlayerDisconnection(socket);
    });

    socket.on('player:move', (direction) => {
      //direction validation???
      const validatedDirection = []
      for (let i = 0; i<6; i++){
        validatedDirection.push(!!direction[i]);
      }
      console.log(validatedDirection);
      this._game.updatePlayerDirection(socket.id, validatedDirection);
    })

    const playerInitData = this._game.addPlayer(socket.id);
    socket.join(this._id);
    this._players.push(socket);

    //should also return data about all static objects (f.g. walls)
    socket.emit('game:init', {
      ...this._game.dimensions,
      mainPlayer: playerInitData,
    })
    socket.broadcast.to(this._id).emit('player:add', socket.id);
  }
  handlePlayerDisconnection(socket) {
    console.log(`player ${socket.id} disconnected from room ${this._id}`);
    this._game.removePlayer(socket.id);
    this._players = this._players.filter((player) => player.id !== socket.id);
    socket.broadcast.to(this._id).emit('player:add', socket.id);
  }

  startGame() {
    clearTimeout(this._gameLoopTimeoutId);
    // possible questions???
    let previousTime = 0;
    let remainder = 0;

    const gameLoop = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - previousTime;
      // |____1000____|15|____2000____|30|
      if (deltaTime + remainder > this._tickLengthMs) {
        previousTime = currentTime;
        remainder = (deltaTime + remainder) % this._tickLengthMs;

        //game update
        const gameStateData = this._game.updateGameState(this._tickLengthMs);
        this._ioServer.to(this._id).emit('game:update', gameStateData)

      }
      this._gameLoopTimeoutId = setTimeout(gameLoop, 0);
    };
    gameLoop();
  }
  stopGame() {
    clearTimeout(this._gameLoopTimeoutId);
  }

  get id() {
    return this._id;
  }
  get players() {
    return this._players.length;
  }
  get playerLimit() {
    return this._playerLimit;
  }
}