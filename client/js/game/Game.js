import { Circle } from './circle/Circle.js';
import { Ball } from './circle/Ball.js';
import { Player } from './circle/Player.js';
import { Line } from './line/Line.js';
import { Wall } from './line/Wall.js';

export class Game {
  /** 
   * @param {HTMLCanvasElement} canvas
    */
  constructor(canvas, mainPlayerId = null) {
    this._canvas = canvas;
    this._mainPlayer = null;
    this._mainPlayerId = mainPlayerId;
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
    ctx.textAlign = 'center';

    let previousTime = 0;
    /** @param {DOMHighResTimeStamp} timeStamp */
    const mainLoop = (timeStamp) => {
      const deltaTime = timeStamp - previousTime;
      previousTime = timeStamp;

      //--------------------
      ctx.clearRect(0, 0, this._canvas.width / this._scaleFactor, this._canvas.height / this._scaleFactor);
      
      ctx.fillStyle = this._stadium.color;
      ctx.fillRect(0, 0, this._canvas.width / this._scaleFactor, this._canvas.height / this._scaleFactor);

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
  stop() {
    cancelAnimationFrame(this._mainLoopRequestId);
  }

  /** @param {{players: import('../../types.js').PlayerInitData[], ball: import('../../types.js').BallInitData}} data*/
  reset(data) {
    this._players = [];
    this._ball = null;
    this.addPlayers(data.players);
    this.addBall(data.ball);
  }

  /** @param {import('../../types.js').GameStateData} data  */
  updateGame(data) {
    for (let i = 0; i < this._players.length; i++) {
      this._players[i].updateData(data.players[i]);
      if (this._players[i].id !== data.players[i].id) {
        console.error('Players id mismatch');
      }
    }
    this._ball.updateData(data.ball);
  }
  /** 
   * @param {import('../../types.js').PlayerInitData[]} players   
   */
  addPlayers(players) {
    players.forEach((player) => {
      this._players.push(new Player(player));
      if (player.id === this._mainPlayerId) {
        this._mainPlayer = this._players[this._players.length - 1];
      }
    });
  }

  removePlayer(id) {
    this._players = this._players.filter((player) => player.id !== id);
  }

  /** @param {import('../../types.js').BallInitData} data  */
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
    this._stadium.color = data.color || 'white';
    data.walls.forEach((wall) => this._stadium.walls.push(new Wall(wall)));
    data.lines.forEach((line) => this._stadium.lines.push(new Line(line)));
    data.circles.forEach((circle) => this._stadium.circles.push(new Circle(circle)));
  }
}