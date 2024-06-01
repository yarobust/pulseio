import { Circle } from './Circle.js';

export class Ball extends Circle {
  /** @param {import('../../../types').BallInitData} data */
  constructor(data){
    super(data);
  }

  /** @param {import('../../../types').BallStateData} data  */
  updateData(data) {
    this._x = data.x;
    this._y = data.y;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
  }
}