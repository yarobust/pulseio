import { Circle } from './circle/Circle.js';
import { Player } from './circle/Player.js';
import { Ball } from './circle/Ball.js';
import { Line } from './line/Line.js';
import { Wall } from './line/Wall.js';

const PLAYER_RADIUS = 20 * 1;
const BALL_RADIUS = 10 * 1;

export class Game {
  constructor(playersLimit) {
    this._playersLimit = playersLimit;
    this._width = 990 * 1;
    this._height = 510 * 1;
    this._score = [0, 0];
    this._isGoal = false;
    this._gameState = {

    };
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

    this._leftSpawnPoints = [];
    this._rightSpawnPoints = [];

    this._gameLoopTimeoutId;
    this._tickRate = 1000 / 60;
    this._startTime = 0;

    //should go before buildStadium
    this.createSpawnPoints();
    this.buildStadium();
  }
  /** 
   * @param {String} playerId 
   */
  addPlayer(playerId) {
    let x, y, fillStyle, command;
    if (!this._players.length) {
      command = 'l';
      fillStyle = 'red';
      [x, y] = this._leftSpawnPoints[0];
    } else { 
      const spawnNum = Math.floor(this._players.length/2)
      if (this._players[this._players.length-1].command === 'l') {
        command = 'r';
        fillStyle = 'blue';
        [x, y] = this._rightSpawnPoints[spawnNum];
      } else {
        command = 'l';
        fillStyle = 'red';
        [x, y] = this._leftSpawnPoints[spawnNum];
      }
    }

    this._players.push(new Player({
      id: playerId,
      x,
      y,
      r: PLAYER_RADIUS,
      lineWidth: 3,
      fillStyle,
      command
    }));
  }
  /** 
   * @param {String} playerId
   */ 
  removePlayer(playerId) { 
    let playersDifference = 0;
    let removedPlayerCommand = '';
    let rearrangedTarget = null; 
    //should move the first player of the team!!!
    
    for (let player of this._players) {
      if (player.id === playerId) {
        removedPlayerCommand = player.command;
        continue;
      }
      if (player.command === 'l') {
        playersDifference++;
      } else {
        playersDifference--;
      }
    }

    const rearangedPlayers = [];
    for(let player of this._players) {
      if (player.id === playerId) {
        continue;
      }
      if(Math.abs(playersDifference) > 1 && !rearrangedTarget && player.command !== removedPlayerCommand) {
        const spawnNum = Math.floor(this._playersLimit/2 * Math.random())
        let x, y, fillStyle, command;
        if(removedPlayerCommand === 'l') {
          command = 'l';
          fillStyle = 'red';
          [x,y] = this._leftSpawnPoints[spawnNum];
        } else {
          command = 'r';
          fillStyle = 'blue';
          [x,y] = this._rightSpawnPoints[spawnNum];
        }
        player.reset({x,y,command,fillStyle})
        rearrangedTarget = player;
        continue;
      }
      rearangedPlayers.push(player);
    }
    rearrangedTarget && rearangedPlayers.push(rearrangedTarget);
    this._players = rearangedPlayers;
  }

  updatePlayerDirection(playerId, direction) {
    this._players.find((player) => player._id === playerId).controls = direction;
  }

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


    //collision player-player
    for (let currentPlayer = 0; currentPlayer < this._players.length - 1; currentPlayer++) {
      for (let nextPlayer = currentPlayer + 1; nextPlayer < this._players.length; nextPlayer++) {
        if (this._players[currentPlayer].checkCircleCollision(this._players[nextPlayer])) {
          this._players[currentPlayer].resolveCircleCollision(this._players[nextPlayer]);
        }
      }
    }

    //players-ball collision
    this._players.forEach((player) => {
      if (player.checkCircleCollision(this._ball)) {
        player.resolveCircleCollision(this._ball);
      }
    })

    this.handleGoal();

    this._gameState = {
      players: this._players.map((player) => player.getData()),
      ball: this._ball.getData(),
    }
  }

  handleGoal() {
    if (this._ball.x < 0 - this._ball.r) {
      this._score[1]++;
      this._isGoal = true;
    } else if (this._ball.x > this._width + this._ball.r) {
      this._score[0]++;
      this._isGoal = true;
    }
    return false;
  }

  start(){
    clearTimeout(this._gameLoopTimeoutId);
    // possible questions???
    this._startTime = performance.now();
    let previousTime = this._startTime;
    let remainder = 0;
    const gameLoop = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - previousTime;
      // |____1000____|15|____2000____|30|
      if (deltaTime + remainder > this._tickRate) {
        previousTime = currentTime;
        remainder = (deltaTime + remainder) % this._tickRate;
         //game update
        this.updateGameState(this._tickRate);
      } 
      this._gameLoopTimeoutId = setTimeout(gameLoop, 0);
    };
    gameLoop();
  }

  stop() {
    clearTimeout(this._gameLoopTimeoutId);
  }
  
  /** @returns {RestartGameData} */
  resetRound() {
    this._ball.reset(this._width / 2, this._height / 2);
    this._isGoal = false;
    
    let lNum = 0;
    let rNum = 0;
    this._players.forEach((player) => {
      let x, y, fillStyle, command;
        if(player.command === 'l') {
          command = 'l';
          fillStyle = 'red';
          [x,y] = this._leftSpawnPoints[lNum];
          lNum++;
        } else {
          command = 'r';
          fillStyle = 'blue';
          [x,y] = this._rightSpawnPoints[rNum];
          rNum++;
        }
        player.reset({x,y,command,fillStyle});
    })
    
    return {
      score: this._score,
      ball: this._ball.getData(),
      players: this._players.map((player) => player.getData()),
    }
  }

  /** @returns {RestartGameData} */
  reset() {
    this._score = [0, 0];
    this._isGoal = false;
    this._ball.reset(this._width / 2, this._height / 2);
    // restart players position

    const randomOffset = Math.floor(Math.random() * this._players.length);
    this._players.forEach((player, i) => {
      const newI = (i + randomOffset) % this._players.length;
      const spawnNum = Math.floor( newI / 2);
      let x, y, fillStyle, command;
        if(newI % 2 === 1) {
          command = 'l';
          fillStyle = 'red';
          [x,y] = this._leftSpawnPoints[spawnNum];
        } else {
          command = 'r';
          fillStyle = 'blue';
          [x,y] = this._rightSpawnPoints[spawnNum];
        }
        player.reset({x,y,command,fillStyle});
    })

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
    for (let i = 0; i <= (this._playersLimit / 2) - 1; i++) {
      const x = (Math.cos(i / (this._playersLimit / 2) * 2 * Math.PI) * r) + leftCentre.x;
      const y = (Math.sin(i / (this._playersLimit / 2) * 2 * Math.PI) * r) + leftCentre.y;
      this._leftSpawnPoints.push([x, y]);
    }
    for (let i = 0; i <= (this._playersLimit / 2) - 1; i++) {
      const x = (Math.cos(i / (this._playersLimit / 2) * 2 * Math.PI + Math.PI) * r) + rightCentre.x;
      const y = (Math.sin(i / (this._playersLimit / 2) * 2 * Math.PI + Math.PI) * r) + rightCentre.y;
      this._rightSpawnPoints.push([x, y]);
    }
  }

  buildStadium() {
    const goalLineSize = Math.min(BALL_RADIUS * 10, this._height);
    const goalLineY0 = this._height / 2 - goalLineSize / 2;
    const goalLineY1 = goalLineY0 + goalLineSize;
    const lineWidth = Math.round(BALL_RADIUS / 10);

    this._stadium.walls.push(new Wall({
      x0: 0,
      y0: goalLineY0,
      x1: 0,
      y1: 0,
      lineWidth,
    }), new Wall({
      x0: 0,
      y0: 0,
      x1: this._width,
      y1: 0,
      lineWidth,
    }), new Wall({
      x0: this._width,
      y0: 0,
      x1: this._width,
      y1: goalLineY0,
      lineWidth,
    }), new Wall({
      x0: this._width,
      y0: goalLineY0,
      x1: this._width,
      y1: goalLineY1,
      type: 'goal-line',
      color: 'blue',
      lineWidth,
    }), new Wall({
      x0: this._width,
      y0: goalLineY1,
      x1: this._width,
      y1: this._height,
      lineWidth,
    }), new Wall({
      x0: this._width,
      y0: this._height,
      x1: 0,
      y1: this._height,
      lineWidth,
    }), new Wall({
      x0: 0,
      y0: this._height,
      x1: 0,
      y1: goalLineY1,
      lineWidth,
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

    //centre line
    this._stadium.lines.push(new Line({
      x0: this._width / 2,
      y0: 0,
      x1: this._width / 2,
      y1: this._height,
      lineWidth,
    }))

    //centre circle and side circles
    this._stadium.circles.push(new Circle({
      x: this._width / 2,
      y: this._height / 2,
      r: goalLineSize / 2,
      lineWidth,
    }), new Circle({
      x: 0,
      y: this._height / 2,
      r: goalLineSize / 2,
      lineWidth,
    }), new Circle({
      x: this._width,
      y: this._height / 2,
      r: goalLineSize / 2,
      lineWidth,
    }));

    this._leftSpawnPoints.forEach((point) => {
      this._stadium.circles.push(new Circle({
        x: point[0],
        y: point[1],
        r: BALL_RADIUS / 2,
        lineWidth,
        fillStyle: 'red'
      }), new Circle({
        x: point[0],
        y: point[1],
        r: BALL_RADIUS,
        lineWidth,
        strokeStyle: 'red'
      }))
    });

    this._rightSpawnPoints.forEach((point) => {
      this._stadium.circles.push(new Circle({
        x: point[0],
        y: point[1],
        r: BALL_RADIUS / 2,
        lineWidth,
        fillStyle: 'blue'
      }), new Circle({
        x: point[0],
        y: point[1],
        r: BALL_RADIUS,
        lineWidth,
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

  get gameState(){
    return this._gameState;
  }

  get isGoal() {
    return this._isGoal;
  }
}