export class Player {
  /** @param {import('../../types').playerData} data*/
  constructor(data) {
    this._id = data.id;
    this._x = data.x
    this._y = data.y
    this._r = data.r
    this._xVelocity = data.xVelocity
    this._yVelocity = data.yVelocity
    this._acceleration = data.acceleration
    this._friction = data.friction

    this._controls = [false, false,false,false,false];
  }


  /** @param {import('../../types').playerData} data  */
  updateData(data) {
    this._x = data.x;
    this._y = data.y;
    this._r = data.r;
    this._xVelocity = data.xVelocity;
    this._yVelocity = data.yVelocity;
    this._controls = data.controls;
  }
  // Eliminate jerks between server responses
  interpolate() {

  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath();
    //todo: round position
    ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
    ctx.strokeStyle = this._controls[4] ? 'red' : 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'green';
    ctx.fill();
  }
}