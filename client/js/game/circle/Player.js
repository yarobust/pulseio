import { Circle } from './Circle.js';

export class Player extends Circle {
  /** @param {import('../../../types').PlayerData} data*/
  constructor(data) {
    const { id, controls, actionStrokeStyle, ...restData } = data;
    super(restData)
    this._id = id;
    this._controls = controls || Array(5).map(() => false);
    this._actionStrokeStyle = actionStrokeStyle || 'red'
  }

  /** @param {import('../../../types').PlayerData} data  */
  updateData(data) {
    this._x = data.x;
    this._y = data.y;
    this._r = data.r;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
    this._acceleration = data.acceleration
    this._friction = data.friction
    this._controls = data.controls;
  }
  // Eliminate jerks between server responses
  interpolate() {

  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath();
    //todo: round position
    // ctx.scale(1, 1);
    ctx.arc(this._x, this._y, this._r - this._lineWidth / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = this._controls[4] ? this._actionStrokeStyle : this._strokeStyle;
    ctx.lineWidth = this._lineWidth;
    ctx.stroke();
    if (this._fillStyle) {
      ctx.fillStyle = this._fillStyle;
      ctx.fill();
    }
  }

  get id(){
    return this._id;
  }
  
}