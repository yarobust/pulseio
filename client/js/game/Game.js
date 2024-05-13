import { Circle } from './circle/Circle.js';
import { Ball } from './circle/Ball.js';
import { Player } from './circle/Player.js';
import { Line } from './line/Line.js';
import { Wall } from './line/Wall.js';

export class Game {
  /** 
   * @param {HTMLCanvasElement} canvas
    */
  constructor(canvas) {
    this._canvas = canvas;
    this._mainPlayer = null;
    /** @type {Player[]} */
    this._players = [];
    this._ball = null;
    this._stadium = {
      /** @type {Wall[]} */
      walls: [],
      /** @type {Line[]} */
      lines: [],
      /** @type {Circle[]} */
      circles: [],
    };

    this._mainLoopRequestId = 0;
    this._scaleFactor = 1;
  }

  start() {
    cancelAnimationFrame(this._mainLoopRequestId);
    const ctx = this._canvas.getContext('2d');
    ctx.reset();
    ctx.scale(this._scaleFactor, this._scaleFactor);
    let previousTime = 0;
    /** @param {DOMHighResTimeStamp} timeStamp */
    const mainLoop = (timeStamp) => {
      const deltaTime = timeStamp - previousTime;
      previousTime = timeStamp;

      //--------------------
      ctx.clearRect(0, 0, this._canvas.width / this._scaleFactor, this._canvas.height / this._scaleFactor);

      this._stadium.walls.forEach((wall) => wall.draw(ctx));
      this._stadium.lines.forEach((line) => line.draw(ctx));
      this._stadium.circles.forEach((circle) => circle.draw(ctx));

      this._players.forEach((player) => {
        player.draw(ctx);
      })
      this._ball.draw(ctx);

      this._mainLoopRequestId = requestAnimationFrame(mainLoop);
    }
    mainLoop(previousTime);
  }

  /** @param {{players: import('../../types.js').PlayerData[], ball: import('../../types.js').BallData}} data*/
  reset(data) {
    this.addPlayers(data.players, this._mainPlayer.id);
    this.addBall(data.ball);
  }

  stop() {
    cancelAnimationFrame(this._mainLoopRequestId);
  }

  /** @param {import('../../types.js').GameStateData} data  */
  updateGame(data) {
    // if there are players in the incoming data that are less than 'this._players', they will not be included in the uptaedPlayers array.
    const updatedPlayers = [];

    let remoteI = 0;
    for (let localI = 0; localI < this._players.length; localI++) {
      if (remoteI >= data.players.length) {
        break;
      }
      if (this._players[localI].id === data.players[remoteI].id) {
        this._players[localI].updateData(data.players[remoteI]);
        updatedPlayers.push(this._players[localI]);
        remoteI++;
      }
    }
    for (remoteI; remoteI < data.players.length; remoteI++) {
      updatedPlayers.push(new Player(data.players[remoteI]));
    }
    this._players = updatedPlayers;

    this._ball.updateData(data.ball);
  }
  /** 
   * @param {import('../../types.js').PlayerData[]} players 
   * @param {string} mainPlayerId  
   */
  addPlayers(players, mainPlayerId) {
    const newPlayers = []
    players.forEach((player) => {
      if (player.id === mainPlayerId) {
        this._mainPlayer = new Player(player);
        newPlayers.push(this._mainPlayer);
        return;
      }
      newPlayers.push(new Player(player));
    })
    this._players = newPlayers;
  }

  /** @param {import('../../types.js').BallData} data  */
  addBall(data) {
    this._ball = new Ball(data);
  }

  changeDimensions(sWidth, sHeight, dWidth, dHeight) {
    let aspectRatio = sWidth / sHeight;
    if (dWidth / dHeight <= aspectRatio) {
      this._canvas.width = dWidth;
      this._canvas.height = Math.ceil(dWidth / aspectRatio);
      this._scaleFactor = dWidth / sWidth;
    } else {
      this._canvas.width = Math.ceil(dHeight * aspectRatio);
      this._canvas.height = dHeight;
      this._scaleFactor = dHeight / sHeight;
    }

  }
  /** @param {import('../../types.js').StadiumData} data  */
  buildStadium(data) {
    data.walls.forEach((wall) => this._stadium.walls.push(new Wall(wall)));
    data.lines.forEach((line) => this._stadium.lines.push(new Line(line)));
    data.circles.forEach((circle) => this._stadium.circles.push(new Circle(circle)));
  }
}