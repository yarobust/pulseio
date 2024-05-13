export class Line {
  /** @param {import('../../../types').LineData} data  */
  constructor(data) {
    this._x0 = data.x0;
    this._y0 = data.y0;
    this._x1 = data.x1;
    this._y1 = data.y1;
    this._color = data.color || 'black';
    this._lineWidth = data.lineWidth || 1;
  }

  /** @param {CanvasRenderingContext2D} ctx  */
  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(this._x0, this._y0);
    ctx.lineTo(this._x1, this._y1);
    ctx.strokeStyle = this._color;
    ctx.lineWidth = this._lineWidth;
    ctx.stroke();
  }
  
  getData() {
    return {
      x0: this._x0,
      y0: this._y0,
      x1: this._x1,
      y1: this._y1,
      color: this._color,
      lineWidth: this._lineWidth,
    }
  }
  get x0() {
    return this._x0;
  }
  get y0() {
    return this._y0;
  }
  get x1() {
    return this._x1;
  }
  get y1() {
    return this._y1;
  }
}