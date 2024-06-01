import { Circle } from './Circle.js';

export class Player extends Circle {
  /** @param {import('../../../types').PlayerInitData} data*/
  constructor(data) {
    const { id, controls, actionStyle, name, ...restData } = data;
    super(restData)
    this._id = id;
    this._name = name;
    this._controls = controls || Array(5).map(() => false);
    this._actionStyle = actionStyle || 'yellow';
  }

  /** @param {import('../../../types').PlayerStateData} data */
  updateData(data) {
    this._x = data.x;
    this._y = data.y;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
    this._controls = data.controls;
  }
  // Eliminate jerks between server responses
  interpolate() {

  }

  reset(data) {

  }
  

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath();
    //todo: round position
    ctx.arc(this._x, this._y, this._r - this._lineWidth / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = this._strokeStyle;
    ctx.lineWidth = this._lineWidth;
    ctx.stroke();
    if (this._fillStyle) {
      ctx.fillStyle = this._controls[4] ? this._actionStyle : this._fillStyle;
      ctx.fill();
    }
    
    ctx.fillText(this._name, this._x, this._y + this._r + 10);
  }

  get id(){
    return this._id;
  }
  
}