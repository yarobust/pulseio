const ACCELERATION = 0.000275; //px/ms
const FRICTION = 0.001;

export class Circle {
  /** @param {import('../../../types').CircleData} data  */
  constructor(data) {
    this._x = data.x;
    this._y = data.y;
    this._r = data.r;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
    this._acceleration = data.acceleration;
    this._friction = data.friction;

    this._lineWidth = data.lineWidth || 1;
    this._strokeStyle = data.strokeStyle || 'black';
    this._fillStyle = data.fillStyle;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath();
    //todo: round position
    ctx.arc(this._x, this._y, this._r - this._lineWidth, 0, 2 * Math.PI);
    ctx.strokeStyle = this._strokeStyle;
    ctx.lineWidth = this._lineWidth;
    ctx.stroke();
    if (this._fillStyle) {
      ctx.fillStyle = this._fillStyle;
      ctx.fill();
    }
  }

  set x(num) {
    this._x = num;
  }
  set y(num) {
    this._y = num;
  }
  set r(num) {
    this._r = num;
  }
  set xVelocity(num) {
    this._xVelocity = num;
  }
  set yVelocity(num) {
    this._yVelocity = num;
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get r() {
    return this._r;
  }
  get xVelocity() {
    return this._xVelocity;
  }
  get yVelocity() {
    return this._yVelocity;
  }
  get acceleration() {
    return this._acceleration;
  }
  get friction() {
    return this._friction;
  }
}