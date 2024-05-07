import { Player } from './Player.js';
import { Wall } from './line/Wall.js';

const PLAYER_RADIUS = 20;
const BALL_RADIUS = 10;


export class Game {
  constructor() {
    this._width = 990;
    this._height = 510;
    //hold all player's positions
    this._gameState = {};
    /** @type {Player[]} */
    this._players = [];
    this._walls = [];

    this.buildStadium();
  }
  /** 
   * @param {String} playerId 
   * @returns {playerData} 
   */
  addPlayer(playerId) {
    // should decide where to place player
    const player = new Player({
      id: playerId,
      x: Math.random() * (this._width - PLAYER_RADIUS) + PLAYER_RADIUS,
      y: 400,
      r: PLAYER_RADIUS,
    })
    this._players.push(player);
    return player.initData;
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

  /** @return {gameStateData} */
  updateGameState(deltaTime) {

    //collision with walls (possible optimization when placing walls one after the other. if there is collision check also adjacent  wall)
    this._walls.forEach((wall) => {
      this._players.forEach((player) => {
        if (player.checkWallCollision(wall)) {
          player.resolveWallCollision(wall);
        } 
      })
    })
    
    // console.log('game state update')
    this._players.forEach((player) => {
      player.move(deltaTime);
    })

    


    //collision with players
  for (let currentPlayer = 0; currentPlayer < this._players.length - 1; currentPlayer++) {
    for (let nextPlayer = currentPlayer + 1; nextPlayer < this._players.length; nextPlayer++) {
      if (this._players[currentPlayer].checkPlayerCollision(this._players[nextPlayer])) {
        this._players[currentPlayer].resolvePlayerCollision(this._players[nextPlayer]);
      }
    }
  }

    return {
      players: this._players.map((player) => player.updateData),
    }
  }



  buildStadium() {
    const goalLineSize = Math.min(BALL_RADIUS * 10, this._height);
    const goalLineY0 = this._height/2 - goalLineSize/2;
    const goalLineY1 = goalLineY0 + goalLineSize;
    this._walls.push(new Wall({
      x0: 0,
      y0: goalLineY0,
      x1: 0,
      y1: 0
    }),new Wall({
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
      y0: goalLineY1,
      x1: this._width,
      y1: this._height
    }),new Wall({
      x0: this._width,
      y0: this._height,
      x1: 0,
      y1: this._height
    }), new Wall({
      x0: 0,
      y0: this._height,
      x1: 0,
      y1: goalLineY1
    }))
  }

  get dimensions() {
    return {
      width: this._width,
      height: this._height
    }
  }
}