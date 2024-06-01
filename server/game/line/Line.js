export class Line {
  /** @param {LineInitData} data  */
  constructor(data) {
    this._x0 = data.x0;
    this._y0 = data.y0;
    this._x1 = data.x1;
    this._y1 = data.y1;
    this._color = data.color || 'black';
    this._lineWidth = data.lineWidth || 1;
  }


  initData() {
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