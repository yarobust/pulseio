import { BACKEND_URL } from './constants.js';
import { RoomList } from './components/RoomList.js';
import { GameView } from './components/GameView.js';
import { Player } from './player.js';
import { Game } from './game/Game.js';

export class App {
  /** @param {HTMLElement} appElm */
  constructor(appElm) {
    this._appElm = appElm;
    this._socket = null;
    
    // for debug purposes
    this._randomLatencygMs = 1 || Math.random() * 100 + 200;
    console.log(this._randomLatencygMs);
  }
  //add htmlElement to app root
  showRoomList() {
    this._appElm.replaceChildren(RoomList({
      connectToRoom: this.connectToRoom.bind(this)
    }));
  }
  //add htmlElement to app root
  showGame() {
    this._appElm.prepend(GameView());
  }
  connectToRoom(roomId) {
    if (this._socket) {
      this._socket.disconnect();
    }

    /** @type {import('socket.io-client').Socket} */
    const socket = window.io(BACKEND_URL, {
      query: {
        roomId,
      }
    });

    socket.on('connect', () => {
      socket; console.log('connected');
      this._socket = socket;
    });
    socket.on('disconnect', () => { console.log('disconnected'); })

    socket.on('game:init',/** @param {import('../types.js').gameInitData} data */ (data) => {
      this.showGame();
      this.initGame(data);
    });
    // socket.on('player:add', (data) => {
    //   this._game.addPlayer(data);
    // });
    // socket.on('player:remove', (data) => {
    // });
    socket.on('disconnect:reason', (reason) => {
      console.log(reason);
    });
  }

  /**@param {import('../types.js').gameInitData} data */
  initGame(data) {
    let canvas = document.getElementById('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Cannot find canvas');
    }
    this.bindControls(canvas);

    this._game = new Game(canvas, data);
    this._game.changeDimensions(data.width, data.height, innerWidth, innerHeight);
    this._game.buildStadium();
    this._game.start();

    // should be registered after game creation. Reason: Possibility earlier invoke than 'game:init' event
   this._socket.on('game:update', /** @param {import('../types.js').gameStateData} data */ (data) => {
      this._game.updateGame(data);
    });

  }

  bindControls(canvas) {
    const controls = [false, false, false, false, false];
    let isNewDirection = false;
    canvas.focus();
    canvas.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': {
          if(!controls[0]) {isNewDirection = true;}
          controls[0] = true;
          break;
        }
        case 'KeyD': {
          if(!controls[1]) {isNewDirection = true;}
          controls[1] = true;
          break;
        }
        case 'KeyS': {
          if(!controls[2]) {isNewDirection = true;}
          controls[2] = true;
          break;
        }
        case 'KeyA': {
          if(!controls[3]) {isNewDirection = true;}
          controls[3] = true;
          break;
        }
        case 'Space': {
          if(!controls[4]) {isNewDirection = true;}
          controls[4] = true;
          break;
        }
      }
      if (isNewDirection) {
        setTimeout(()=>{this._socket.emit('player:move', controls);}, this._randomLatencygMs);
        isNewDirection = false;
      }
    });

    canvas.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': {
          isNewDirection = true;
          controls[0] = false;
          break;
        }
        case 'KeyD': {
          isNewDirection = true;
          controls[1] = false;
          break;
        }
        case 'KeyS': {
          isNewDirection = true;
          controls[2] = false;
          break;
        }
        case 'KeyA': {
          isNewDirection = true;
          controls[3] = false;
          break;
        }
        case 'Space': {
          isNewDirection = true;
          controls[4] = false;
          break;
        }
      }
      if (isNewDirection) {
        setTimeout(()=>{this._socket.emit('player:move', controls);}, this._randomLatencygMs);
        isNewDirection = false;
      }
    });
  }
}