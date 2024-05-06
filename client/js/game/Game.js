import { Player } from './Player.js';

export class Game {
  /** 
   * @param {HTMLCanvasElement} canvas
   * @param {import('../../types.js').gameInitData} data 
    */
  constructor(canvas, {width, height, mainPlayer}) {
    this._canvas = canvas;
    /** @type {Player[]} */
    this._players = [];
    this._mainPlayer = this._mainPlayer = new Player(mainPlayer);

    this._mainLoopRequestId = 0;
    this._scaleFactor = 1;
  }

  start() {
    cancelAnimationFrame(this._mainLoopRequestId);
    const ctx = this._canvas.getContext('2d');
    ctx.scale(this._scaleFactor, this._scaleFactor);
    let previousTime = 0;
    /** @param {DOMHighResTimeStamp} timeStamp */
    const mainLoop = (timeStamp) => {
      const deltaTime = timeStamp - previousTime;
      previousTime = timeStamp;

      //--------------------
      ctx.clearRect(0, 0, this._canvas.width / this._scaleFactor, this._canvas.height / this._scaleFactor);
      this._players.forEach((player) => {
        player.draw(ctx);
      })
      
      this._mainLoopRequestId = requestAnimationFrame(mainLoop);
    }
    mainLoop(previousTime);
  }

  /** @param {import('../../types.js').gameStateData} data  */
  updateGame(data) {
    // if there are players in the incoming data that are less than 'this._players', they will not be included in the uptaedPlayers array.
    const updatedPlayers = [];
    data.players.forEach((player, i) => {
      if (this._players[i]?._id === player.id) {
        this._players[i].updateData(player);
        updatedPlayers.push(this._players[i]);
      } else if (this._mainPlayer._id === player.id) {
        this._mainPlayer.updateData(player);
        updatedPlayers.push(this._mainPlayer);
      } else {
        updatedPlayers.push(new Player(player))
      }
    })
    this._players = updatedPlayers;
  }
  /** @param {import('../../types.js').playerData} data  */
  addPlayer(data) {
    if (!this._mainPlayer) {
      
      this._players.push(this._mainPlayer);
      return;
    }

    // this._players.push(new Player(data));
  }

  removePlayer(data) {

  }

  changeDimensions(sWidth, sHeight, dWidth, dHeight) {
    let aspectRatio = sWidth / sHeight;
    if (dWidth / dHeight <= aspectRatio) {
      this._canvas.width = dWidth;
      this._canvas.height = dWidth / aspectRatio;
      this._scaleFactor = dWidth / sWidth;
    } else {
      this._canvas.width = dHeight * aspectRatio;
      this._canvas.height = dHeight;
      this._scaleFactor = dHeight / sHeight;
    }

  }
  buildStadium() {

  }

}