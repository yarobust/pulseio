const ACCELERATION = 0.000275; //px/ms
const FRICTION = 0.001;

export class Circle {
  /** @param {CircleConstructorData} data  */
  constructor(data) {
    this._x = data.x;
    this._y = data.y;
    this._r = data.r;
    this._xVelocity = 0;
    this._yVelocity = 0;
    this._acceleration = ACCELERATION;
    this._friction = FRICTION;
    this._lineWidth = data.lineWidth || 1;
    this._strokeStyle = data.strokeStyle || 'black';
    this._fillStyle = data.fillStyle;
  }

  move(deltaTime) {
    const deltaAcceleration = this._acceleration * deltaTime;
    const deltaFriction = this._friction * deltaTime;

    if (Math.abs(this._xVelocity) < deltaAcceleration) {
      this._xVelocity = 0;
    } else {
      this._xVelocity *= 1 - deltaFriction;
    }
    if (Math.abs(this._yVelocity) < deltaAcceleration) {
      this._yVelocity = 0;
    } else {
      this._yVelocity *= 1 - deltaFriction;
    }

    this._x += this._xVelocity * deltaTime;
    this._y += this._yVelocity * deltaTime;
  }

  reset(x, y){
    this._x = x;
    this._y = y;
    this._xVelocity = 0;
    this._yVelocity = 0;
  }

  checkWallCollision(wall) {
    const dx = wall.x1 - wall.x0;
    const dy = wall.y1 - wall.y0;
    const l2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((this._x - wall.x0) * dx + (this._y - wall.y0) * dy) / l2));
    const projectionX = wall.x0 + t * dx;
    const projectionY = wall.y0 + t * dy;
    const distance = Math.sqrt((this._x - projectionX) ** 2 + (this._y - projectionY) ** 2);
    return distance < this._r;
  }

  //velocity reflection from wall
  resolveWallCollision(wall) {
    const dx = wall.x1 - wall.x0;
    const dy = wall.y1 - wall.y0;
    const l2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((this._x - wall.x0) * dx + (this._y - wall.y0) * dy) / l2));
    const projectionX = wall.x0 + t * dx;
    const projectionY = wall.y0 + t * dy;
    const distance = Math.sqrt((this._x - projectionX) ** 2 + (this._y - projectionY) ** 2);
    const overlap = this._r - distance;
    const collisionNormal = {
      x: (this._x - projectionX) / distance,
      y: (this._y - projectionY) / distance,
    };
    this._x += overlap * collisionNormal.x;
    this._y += overlap * collisionNormal.y;
    const dotProduct = this._xVelocity * collisionNormal.x + this._yVelocity * collisionNormal.y;
    this._xVelocity -= 2 * dotProduct * collisionNormal.x;
    this._yVelocity -= 2 * dotProduct * collisionNormal.y;
  }

  /** @returns {CircleData} */
  getData() {
    return {
      x: this._x,
      y: this._y,
      r: this._r,
      xVelocity: this._xVelocity,
      yVelocity: this._yVelocity,
      acceleration: this._acceleration,
      friction: this._friction,
      lineWidth: this._lineWidth,
      strokeStyle: this._strokeStyle,
      fillStyle: this._fillStyle,
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