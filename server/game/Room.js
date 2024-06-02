import { Socket } from 'socket.io';
import { Game } from './Game.js';
import { v4 as uuidv4 } from 'uuid';

export class Room {
  /** @param {{ioServer: import('socket.io').Server, roomName: string}} param0 */
  constructor({ ioServer, roomName }) {
    this._ioServer = ioServer;
    this._id = uuidv4();
    this._name = roomName;
    /** @type {Socket[]} */
    this._players = [];
    this._playersLimit = 8;

    this._winningScore = 4;
    this._startTime = 0;
    this._gameTimeLimit = 1800000; //ms

    this._playersInactivityLimit = 180000; //ms
    this._playersActivity = new Map();

    /** @type {Game} */
    this._game = new Game(this._playersLimit);
    this._sendUpdateRate = 1000 / 20;
    this._sendUpdateIntervalId;
  }
  /** @param {import('socket.io').Socket} socket  */
  handlePlayerConnection(socket, name) {
    // should be placed before 'socket:disconnect' handler. Unnecessary to handle disconnection of not yet added player
    if (this._players.length >= this._playersLimit) {
      socket.emit('disconnect:reason', 'Room is already filled');
      socket.disconnect(true);
      return;
    }
    // console.log(`player ${socket.id} connected to room ${this._id}`);
    socket.on('disconnect', () => {
      this.handlePlayerDisconnection(socket);
    });

    socket.on('player:change-controls', (controls) => {
      const validatedControls = []
      for (let i = 0; i < 5; i++) {
        validatedControls.push(!!controls[i]);
      }
      this._game.updatePlayerControls(socket.id, validatedControls);
      this._playersActivity.set(socket, Date.now());
    })

    const newPlayer = this._game.addPlayer(socket.id, name);
    socket.join(this._id);
    this._players.push(socket);
    this._playersActivity.set(socket, Date.now());

    this._ioServer.to(this._id).emit('game:add-player', newPlayer);
    const timeLeft = Math.max(this._gameTimeLimit - (performance.now() - this._startTime), -1);
    socket.emit('game:init', { ...this._game.initData, timeLeft });
  }
  /** @param {import('socket.io').Socket} socket  */
  handlePlayerDisconnection(socket) {
    const changedPlayer = this._game.removePlayer(socket.id);
    this._players = this._players.filter((player) => player.id !== socket.id);
    this._playersActivity.delete(socket);
    this._ioServer.to(this._id).emit('game:remove-player', { id: socket.id, changedPlayer });
  }

  startGame() {
    clearInterval(this._sendUpdateIntervalId);
    this._game.start();

    this._startTime = performance.now();
    let previousPlayersActivityCheck = this._startTime;

    this._sendUpdateIntervalId = setInterval(() => {
      const currentTime = performance.now();

      if (previousPlayersActivityCheck + 1000 < currentTime) {
        this.checkPlayersActivity();
        previousPlayersActivityCheck = currentTime - (currentTime - previousPlayersActivityCheck) % 1000;
      }

      const isTimeEnd = currentTime - this._startTime > this._gameTimeLimit;
      //winning condition 
      if (this._game.isGoal || isTimeEnd) {
        const data = this._game.resetRound();
        this._ioServer.to(this._id).emit('game:restart', data);
        if (Math.max(...this._game.score) >= this._winningScore || isTimeEnd) {
          this._game.stop();
          clearInterval(this._sendUpdateIntervalId);
          this.restartGame();
        }
      }

      this._ioServer.to(this._id).emit('game:update', this._game.gameState);
    }, this._sendUpdateRate);
  }
  restartGame() {
    const timeout = 6000;
    this._players.forEach((player) => {
      player.timeout(timeout).emit('game:continue', {
        dateNow: Date.now(),
        timeout
      }, (err) => {
        err && player.disconnect(true);
      });
    });
    setTimeout(() => {
      const data = this._game.restart();
      this._ioServer.to(this._id).emit('game:restart', { ...data, timeLeft: this._gameTimeLimit });
      this.startGame();
    }, timeout);
  }

  checkPlayersActivity() {
    const currentTime = Date.now();
    this._playersActivity.forEach((timestamp, socket) => {
      if (timestamp + this._playersInactivityLimit < currentTime) {
        socket.emit('disconnect:reason', 'Inactivity');
        socket.disconnect(true);
      }
    });
  }

  get id() {
    return this._id;
  }
  get players() {
    return this._players.length;
  }
  get playersLimit() {
    return this._playersLimit;
  }
  get name() {
    return this._name;
  }
}