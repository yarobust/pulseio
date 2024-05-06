export class Line {
  /** @param {LineData} data  */
  constructor(data) {
    this._x0 = data.x0;
    this._y0 = data.y0;
    this._x1 = data.x1;
    this._y1 = data.y1;
    this._color = data.color || 'black';
    this._lineWidth = data.lineWidth || 1;
  }
  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(this._x0, this._y0);
    ctx.lineTo(this._x1, this._y1);
    ctx.strokeStyle = this._color;
    ctx.lineWidth = this._lineWidth;
    ctx.stroke();
  }
}