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

  /** @param {number} deltaTime  */
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

    // if (Math.abs(this._xVelocity) > this._r / deltaTime) {
    //   this._xVelocity = this._r / deltaTime * Math.sign(this._xVelocity);
    // }
    // if (Math.abs(this._yVelocity) > this._r / deltaTime) {
    //   this._yVelocity = this._r / deltaTime * Math.sign(this._yVelocity);
    // } 

    this._x += this._xVelocity * deltaTime;
    this._y += this._yVelocity * deltaTime;
  }

  /** 
   * @param {number} x 
   * @param {number} y
  */
  reset(x, y, fillStyle = null) {
    this._x = x;
    this._y = y;
    this._xVelocity = 0;
    this._yVelocity = 0;
    this._fillStyle = fillStyle || this._fillStyle;
  }
  /** @param {import('../line/Wall.js').Wall} wall  */
  checkWallCollision(wall) {
    const dx = wall.x1 - wall.x0;
    const dy = wall.y1 - wall.y0;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) {
      return false;
    }
    const t = Math.max(0, Math.min(1, ((this._x - wall.x0) * dx + (this._y - wall.y0) * dy) / l2));
    const projectionX = wall.x0 + t * dx;
    const projectionY = wall.y0 + t * dy;
    const distance = Math.sqrt((this._x - projectionX) ** 2 + (this._y - projectionY) ** 2);
    return distance < this._r;

    //optimization: return calculation and then use it in resolveWallCollision
  }

  /** @param {import('../line/Wall.js').Wall} wall  */
  resolveWallCollision(wall) {
    const dx = wall.x1 - wall.x0;
    const dy = wall.y1 - wall.y0;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) {
      return;
    }
    //the point on the wall line closest to the circle.[]
    // t - magnitude of unit vector
    const t = Math.max(0, Math.min(1, ((this._x - wall.x0) * dx + (this._y - wall.y0) * dy) / l2));
    const projectionX = wall.x0 + t * dx;
    const projectionY = wall.y0 + t * dy;
    const distance = Math.sqrt((this._x - projectionX) ** 2 + (this._y - projectionY) ** 2);
    const overlap = this._r - distance;

    //unit vector pointing from the closest point on the wall to the circle's center.
    const collisionNormal = {
      x: (this._x - projectionX) / distance,
      y: (this._y - projectionY) / distance,
    };
    this._x += overlap * collisionNormal.x;
    this._y += overlap * collisionNormal.y;
    const dotProduct = this._xVelocity * collisionNormal.x + this._yVelocity * collisionNormal.y;
    this._xVelocity -= 1.99 * dotProduct * collisionNormal.x;
    this._yVelocity -= 1.99 * dotProduct * collisionNormal.y;
  }


  /** @param {Circle} circle*/
  checkCircleCollision(circle) {
    return ((this._x - circle.x) ** 2 + (this._y - circle.y) ** 2) < ((this._r + circle.r) ** 2);
  }
  //dynamic collision methods response for circles
  /** @param {Circle} circle */
  resolveCircleCollision(circle) {
    let distance = Math.sqrt((this._x - circle.x) ** 2 + (this._y - circle.y) ** 2);
    if (distance === 0) {
      return;
    }
    const overlap = (this._r + circle.r) - distance;
    const collisionNormal = {
      x: (circle.x - this._x) / distance,
      y: (circle.y - this._y) / distance,
    };
    this._x -= overlap * collisionNormal.x;
    this._y -= overlap * collisionNormal.y;
    circle.x += overlap * collisionNormal.x;
    circle.y += overlap * collisionNormal.y;

    const relativeVelocity = {
      x: this._xVelocity - circle.xVelocity,
      y: this._yVelocity - circle.yVelocity,
    };
    const speed = relativeVelocity.x * collisionNormal.x + relativeVelocity.y * collisionNormal.y;
    if (speed < 0) {
      return;
    }
    const impulse = 2 * speed / (this._r + circle.r);
    this._xVelocity -= impulse * circle.r * collisionNormal.x;
    this._yVelocity -= impulse * circle.r * collisionNormal.y;
    circle.xVelocity += impulse * this._r * collisionNormal.x;
    circle.yVelocity += impulse * this._r * collisionNormal.y;
  }

  /** @returns {CircleInitData} */
  initData() {
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
  /** @returns {CircleStateData} */
  stateData() {
    return {
      x: this._x,
      y: this._y,
      xVelocity: this._xVelocity,
      yVelocity: this._yVelocity,
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