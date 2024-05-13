import { Circle } from './Circle.js';

export class Ball extends Circle {
  /** @param {import('../../../types').BallData} data */
  constructor(data){
    super(data);
  }

  /** @param {import('../../../types').BallData} data  */
  updateData(data) {
    this._x = data.x;
    this._y = data.y;
    this._r = data.r;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
    this._acceleration = data.acceleration
    this._friction = data.friction
  }
}