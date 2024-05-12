import { Circle } from './circle/Circle.js';
import { Player } from './circle/Player.js';
import { Ball } from './circle/Ball.js';
import { Line } from './line/Line.js';
import { Wall } from './line/Wall.js';

const PLAYER_RADIUS = 20;
const BALL_RADIUS = 10;

export class Game {
  constructor(playersLimit) {
    this._playersLimit = playersLimit;
    this._width = 990;
    this._height = 510;
    this._score = [0, 0];
    /** @type {Player[]} */
    this._players = [];
    /** @type {Ball} */
    this._ball = new Ball({
      x: this._width / 2,
      y: this._height / 2,
      r: BALL_RADIUS,
      fillStyle: 'aqua'
    })
    this._stadium = {
      /** @type {Wall[]} */
      walls: [],
      /** @type {Line[]} */
      lines: [],
      /** @type {Circle[]} */
      circles: []
    }

    // left team and right team spawn points
    this._leftSpawnPoints = [];
    this._rightSpawnPoints = [];

    //should go before buildStadium
    this.createSpawnPoints();
    this.buildStadium();
  }
  /** 
   * @param {String} playerId 
   */
  addPlayer(playerId) {
    // should decide where to place player
    this._players.push(new Player({
      id: playerId,
      x: Math.random() * (this._width - PLAYER_RADIUS) + PLAYER_RADIUS,
      y: 400,
      r: PLAYER_RADIUS,
      lineWidth: 3,
      fillStyle: 'green',
    }));
  }
  /** 
   * @param {String} playerId
   */
  removePlayer(playerId) {
    this._players = this._players.filter((player) => player._id !== playerId);
  }

  updatePlayerDirection(playerId, direction) {
    this._players.find((player) => player._id === playerId).controls = direction;
  }

  /** @return {GameStateData} */
  updateGameState(deltaTime) {

    // console.log('game state update')
    this._players.forEach((player) => {
      player.move(deltaTime);
    })
    this._ball.move(deltaTime);


    //collision with walls (possible optimization when placing walls one after the other. if there is collision check also adjacent  wall)
    this._stadium.walls.forEach((wall) => {
      this._players.forEach((player) => {
        if (player.checkWallCollision(wall)) {
          player.resolveWallCollision(wall);
        }
      })
      if (wall.type === 'normal' && this._ball.checkWallCollision(wall)) {
        this._ball.resolveWallCollision(wall);
      }
    })


    //collision with players
    for (let currentPlayer = 0; currentPlayer < this._players.length - 1; currentPlayer++) {
      for (let nextPlayer = currentPlayer + 1; nextPlayer < this._players.length; nextPlayer++) {
        if (this._players[currentPlayer].checkCircleCollision(this._players[nextPlayer])) {
          this._players[currentPlayer].resolveCircleCollision(this._players[nextPlayer]);
        }
      }
    }

    //players' collision with ball
    this._players.forEach((player) => {
      if (player.checkCircleCollision(this._ball)) {
        player.resolveCircleCollision(this._ball);
      }
    })

    return {
      players: this._players.map((player) => player.getData()),
      ball: this._ball.getData(),
    }
  }

  checkGoal() {
    if (this._ball.x < 0) {
      this._score[0]++;
      return true;
    } else if (this._ball.x > this._width) {
      this._score[1]++;
      return true;
    }
    return false;
  }

  /** @returns {RestartGameData} */
  resetRound(){
    this._ball.reset(this._width / 2, this._height / 2);
    // restart players position
    return {
      score: this._score,
      ball: this._ball.getData(),
      players: this._players.map((player) => player.getData()),
    }
  }
  
  
  /** @returns {RestartGameData} */
  reset() {
    this._score = [0, 0];
    this._ball.reset(this._width / 2, this._height / 2);
    // restart players position

    return {
      score: this._score,
      ball: this._ball.getData(),
      players: this._players.map((player) => player.getData()),
    }
  }

  createSpawnPoints() {
    if (!this._playersLimit || this._playersLimit % 2 === 1) {
      throw new Error(`Inappropriate players limit: ${this._playersLimit}`)
    }
    const r = this._height / 4;
    const leftCentre = {
      x: this._width / 4,
      y: this._height / 2,
    }
    const rightCentre = {
      x: 3 * this._width / 4,
      y: this._height / 2, 
    }
    for (let i = 1; i <= (this._playersLimit / 2); i++) {
      const x = (Math.cos(i / (this._playersLimit / 2) * 2 * Math.PI) * r) + leftCentre.x; 
      const y = (Math.sin(i / (this._playersLimit / 2) * 2 * Math.PI) * r) + leftCentre.y;
this._leftSpawnPoints.push([x,y]);
    }
    for (let i = 1; i <= (this._playersLimit / 2); i++) {
      const x = (Math.cos(i / (this._playersLimit / 2) * 2 * Math.PI + Math.PI) * r) + rightCentre.x; 
      const y = (Math.sin(i / (this._playersLimit / 2) * 2 * Math.PI + Math.PI) * r) + rightCentre.y;
this._rightSpawnPoints.push([x,y]);
    }
  }

  buildStadium() {
    const goalLineSize = Math.min(BALL_RADIUS * 10, this._height);
    const goalLineY0 = this._height / 2 - goalLineSize / 2;
    const goalLineY1 = goalLineY0 + goalLineSize;
    this._stadium.walls.push(new Wall({
      x0: 0,
      y0: goalLineY0,
      x1: 0,
      y1: 0
    }), new Wall({
      x0: 0,
      y0: 0,
      x1: this._width,
      y1: 0
    }), new Wall({
      x0: this._width,
      y0: 0,
      x1: this._width,
      y1: goalLineY0
    }), new Wall({
      x0: this._width,
      y0: goalLineY0,
      x1: this._width,
      y1: goalLineY1,
      type: 'goal-line',
      color: 'blue',
      lineWidth: 3,
    }), new Wall({
      x0: this._width,
      y0: goalLineY1,
      x1: this._width,
      y1: this._height
    }), new Wall({
      x0: this._width,
      y0: this._height,
      x1: 0,
      y1: this._height
    }), new Wall({
      x0: 0,
      y0: this._height,
      x1: 0,
      y1: goalLineY1
    }), new Wall({
      x0: 0,
      y0: goalLineY1,
      x1: 0,
      y1: goalLineY0,
      type: 'goal-line',
      color: 'red',
      lineWidth: 3,
    }),
    )

    this._stadium.lines.push(new Line({
      x0: this._width / 2,
      y0: 0,
      x1: this._width / 2,
      y1: this._height,
    }))

    this._stadium.circles.push(new Circle({
      x: this._width / 2,
      y: this._height / 2,
      r: goalLineSize / 2
    }), new Circle({
      x: 0,
      y: this._height / 2,
      r: goalLineSize / 2,
    }), new Circle({
      x: this._width,
      y: this._height / 2,
      r: goalLineSize / 2,
    }));

    this._leftSpawnPoints.forEach((point) => {
      this._stadium.circles.push(new Circle({
        x: point[0],
        y: point[1],
        r: 4,
        lineWidth: 0,
        fillStyle: 'red'
      }), new Circle({
        x: point[0],
        y: point[1],
        r: 10,
        lineWidth: 1,
        strokeStyle: 'red'
      }))
    });

    this._rightSpawnPoints.forEach((point) => {
      this._stadium.circles.push(new Circle({
        x: point[0],
        y: point[1],
        r: 4,
        lineWidth: 0,
        fillStyle: 'blue'
      }), new Circle({
        x: point[0],
        y: point[1],
        r: 10,
        lineWidth: 1,
        strokeStyle: 'blue'
      }))
    })
  }

  get score() {
    return [this._score[0], this._score[1]]
  }
  /** @returns {GameInitData} */
  get initData() {
    return {
      width: this._width,
      height: this._height,
      players: this._players.map((player) => player.getData()),
      ball: this._ball.getData(),
      stadium: {
        walls: this._stadium.walls.map((wall) => wall.getData()),
        lines: this._stadium.lines.map((line) => line.getData()),
        circles: this._stadium.circles.map((circle) => circle.getData())
      },
      score: this.score
    }
  }
}