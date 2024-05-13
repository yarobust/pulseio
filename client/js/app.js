import { BACKEND_URL } from './constants.js';
import { RoomList } from './components/RoomList.js';
import { GameView } from './components/GameView.js';
import { Player } from './player.js';
import { Game } from './game/Game.js';
import { ContinueDialog } from './components/ContinueDialog.js';
import { DisconnectDialog } from './components/DisconnectDialog.js';

export class App {
  /** @param {HTMLElement} appElm */
  constructor(appElm) {
    this._appElm = appElm;
    this._socket = null;
    this._game = null;
    // for debug purposes
    this._randomLatencygMs = 1 || Math.random() * 100 + 200;
    this._gameTimer = 0;
    this._gameTimerId = 0;
  }
  //add htmlElement to app root
  showRoomList() {
    this._game && this._game.stop();
    this._game = null;
    this._socket && this._socket.disconnect();
    this._appElm.replaceChildren(RoomList({
      connectToRoom: this.connectToRoom.bind(this)
    }));
  }
  //add htmlElement to app root
  showGame() {
    this._appElm.replaceChildren(GameView({
      handleExit: () => this.showRoomList()
    }));
  }

  showContinueDialog({ timeLeft, handleExit, handleContinue }) {
    const timeoutId = setTimeout(() => {handleExit();continueDialogElm.remove();}, timeLeft);
    const continueDialogElm = ContinueDialog({
      timeLeft,
      handleExit: () => {
        clearTimeout(timeoutId)
        handleExit();
        continueDialogElm.remove();
      },
      handleContinue: () => {
        clearTimeout(timeoutId);
        handleContinue();
        continueDialogElm.remove();
      }
    })
    this._appElm.append(continueDialogElm);
  }

  setGameScore(score){
    const scoreElm = document.querySelector('#game-view .bar__score');
    scoreElm.textContent = `${score[0]}:${score[1]}`;
  }
  setGameTimer(timeLeft){
    const timerElm = document.querySelector('#game-view .bar__timer');
    clearInterval(this._gameTimerId);
    if (timeLeft < 0) {
      timerElm.textContent = 'wait';
      return;
    }
    this._gameTimer = timeLeft / 1000;
    const timer = () => {
      const minutes = Math.floor(this._gameTimer / 60);
      const seconds = Math.floor(this._gameTimer % 60);
      this._gameTimer--;
      timerElm.textContent = `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`
      if (this._gameTimer < 0) {
        clearInterval(this._gameTimerId);
      }
    };
    this._gameTimerId = window.setInterval(timer, 1000)
    timer();
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
      this._socket = socket;
    });
    socket.on('game:init',/** @param {import('../types.js').GameInitData} data */(data) => {
      if (this._game) {
        this._appElm.append(DisconnectDialog({
          reason: 'The game is already initialized',
          handleExit: () => this.showRoomList()
        }))
      }
      this.showGame();
      this.initGame(data);
    });
    socket.on('disconnect:reason', (reason) => {
      this._appElm.append(DisconnectDialog({
        reason,
        handleExit: () => this.showRoomList()
      }))
    });
  }

  /**@param {import('../types.js').GameInitData} data */
  initGame(data) {
    const canvas = document.querySelector('#canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Cannot find canvas');
    }
    const gameContainerElm = document.querySelector('#game-view .game-view__container');
    const barContainer = document.querySelector('#game-view .game-view__bar-container');
    
    this.setGameScore(data.score);
    this.setGameTimer(data.timeLeft);

    this.bindControls(canvas);

    const { width: dWidth, height: dHeight } = gameContainerElm.getBoundingClientRect();

    this._game = new Game(canvas);
    this._game.changeDimensions(data.width, data.height, dWidth, dHeight - barContainer.getBoundingClientRect().height);
    this._game.addPlayers(data.players, this._socket.id);
    this._game.addBall(data.ball);
    this._game.buildStadium(data.stadium);
    this._game.start();

    // should be registered after game creation. Reason: Possibility earlier invoke than 'game:init' event
    this._socket.on('game:update', /** @param {import('../types.js').GameStateData} data */(data) => {
      this._game.updateGame(data);
    });

    this._socket.on('game:goal', (data) => {
      console.log('goal', data);
    });
    this._socket.on('game:end', (data) => {
      console.log('end', data);
    })

    this._socket.on('game:restart', /** @param {import('../types.js').gameRestartData} data */(data) => {
      const { score, timeLeft, ...restData } = data;
      this.setGameScore(score);
      timeLeft && this.setGameTimer(timeLeft);
      this._game.reset(restData);
      this._game.start();

      const canvas = document.querySelector('#canvas');
      canvas.focus();
    })

    this._socket.on('game:continue', /** @param {import('../types.js').continueEventData} data */(data, callback) => {
      const timeLeft = data.timeout - (Date.now() - data.dateNow);
      this.setGameTimer(-1);
      this.showContinueDialog({
        timeLeft,
        handleExit: () => { this.showRoomList() },
        handleContinue: callback
      });
      this._game.stop();
    })
  }




  bindControls(canvas) {
    const controls = [false, false, false, false, false];
    let isNewDirection = false;
    canvas.focus();
    canvas.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': {
          if (!controls[0]) { isNewDirection = true; }
          controls[0] = true;
          break;
        }
        case 'KeyD': {
          if (!controls[1]) { isNewDirection = true; }
          controls[1] = true;
          break;
        }
        case 'KeyS': {
          if (!controls[2]) { isNewDirection = true; }
          controls[2] = true;
          break;
        }
        case 'KeyA': {
          if (!controls[3]) { isNewDirection = true; }
          controls[3] = true;
          break;
        }
        case 'Space': {
          if (!controls[4]) { isNewDirection = true; }
          controls[4] = true;
          break;
        }
      }
      if (isNewDirection) {
        setTimeout(() => { this._socket.emit('player:move', controls); }, this._randomLatencygMs);
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
        setTimeout(() => { this._socket.emit('player:move', controls); }, this._randomLatencygMs);
        isNewDirection = false;
      }
    });
  }
}