import { Player } from './Player.js';
import { Wall } from './line/Wall.js';

export class Game {
  constructor() {
    this._width = 990;
    this._height = 510;
    //hold all player's positions
    this._gameState = {};
    /** @type {Player[]} */
    this._players = [];
    this._walls = [];
  }
  /** 
   * @param {String} playerId 
   * @returns {playerData} 
   */
  addPlayer(playerId) {
    // should decide where to place player
    const player = new Player({
      id: playerId,
      x: Math.random() * 1980,
      y: 200,
      r: 20,
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
    
  }

  get dimensions() {
    return {
      width: this._width,
      height: this._height
    }
  }
}