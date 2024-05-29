import { Socket } from 'socket.io';
import { Game } from './Game.js';
import { v4 as uuidv4 } from 'uuid';
 
export class Room { 
  /** @param {{ioServer: import('socket.io').Server, roomName: string}} param0 */
  constructor({ioServer, roomName}) {
    this._ioServer = ioServer;
    this._id = uuidv4();
    this._name = roomName;
    /** @type {Socket[]} */
    this._players = [];
    this._playersLimit = 8;

    this._winningScore = 5;
    this._startTime = 0;
    this._gameTimeLimit = 1135000; //ms
    /** @type {Game} */
    this._game = new Game(this._playersLimit);
    this.sendUpdateRate = 1000 / 20;
    this._sendUpdateIntervalId;
  } 
  /** @param {import('socket.io').Socket} socket  */
  handlePlayerConnection(socket) {
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

    socket.on('player:move', (direction) => {
      //direction validation???
      const validatedDirection = []
      for (let i = 0; i<6; i++){
        validatedDirection.push(!!direction[i]);
      }
      this._game.updatePlayerDirection(socket.id, validatedDirection);
    })

    this._game.addPlayer(socket.id);
    socket.join(this._id);
    this._players.push(socket);

    const timeLeft = Math.max(this._gameTimeLimit - (performance.now() - this._startTime), -1);
    //return data about all static objects (e.g. walls)
    socket.emit('game:init', {...this._game.initData, timeLeft});
  }
  handlePlayerDisconnection(socket) {
    // console.log(`player ${socket.id} disconnected from room ${this._id}`);
    this._game.removePlayer(socket.id);
    this._players = this._players.filter((player) => player.id !== socket.id);
  }

  startGame() {
    clearInterval(this._sendUpdateIntervalId);
    
    this._game.start();

    this._startTime = performance.now();
    let previousTime = this._startTime;
    this._sendUpdateIntervalId = setInterval(() => {
      this._ioServer.to(this._id).emit('game:update', this._game.gameState);
      
       //winning condition 
      if(this._game.isGoal) {
        if (Math.max(...this._game.score) >= this._winningScore) {
          this._game.stop();
          clearInterval(this._sendUpdateIntervalId);
          this.restartGame();
        } else {
          const data =  this._game.resetRound();
          this._ioServer.to(this._id).emit('game:restart', data);
        }
      }
      const currentTime = performance.now();
      if (currentTime - this._startTime> this._gameTimeLimit) {
        this._game.stop();
        clearInterval(this._sendUpdateIntervalId);
        this.restartGame();
      }      
    }, this.sendUpdateRate);
  }
  restartGame(){
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
      const data = this._game.reset();
      this._ioServer.to(this._id).emit('game:restart', {...data, timeLeft: this._gameTimeLimit});
      this.startGame();
    }, timeout);
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