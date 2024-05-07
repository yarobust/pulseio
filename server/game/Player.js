//@ts-check
export class Player {
  constructor({id, x, y, r}) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._r = r;
    this._xVelocity = 0;
    this._yVelocity = 0;
    this._acceleration = 0.000275; //px/ms
    this._friction = 0.001;

    this._controls = [false, true, true, false, false]
  }

  move(deltaTime) {
    const deltaAcceleration = this._acceleration * deltaTime;
    const deltaFriction = this._friction * deltaTime;

    if (this._controls[0]) {
      this._yVelocity -= deltaAcceleration;
    }
    if (this._controls[1]) {
      this._xVelocity += deltaAcceleration;
    }
    if (this._controls[2]) {
      this._yVelocity += deltaAcceleration;
    }
    if (this._controls[3]) {
      this._xVelocity -= deltaAcceleration;
    }

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

  /** @param {Player} player */
  checkPlayerCollision(player) {
    return ((this._x - player._x) ** 2 + (this._y - player._y) ** 2) < ((this._r + player._r) ** 2);
  }
  //dynamic collision methods response for circles
  /** @param {Player} player */
  resolvePlayerCollision(player) {
    let distance = Math.sqrt((this._x - player._x) ** 2 + (this._y - player._y) ** 2);
    if (distance === 0) {
      return;
    }
    const overlap = (this._r + player._r) - distance;
    const collisionNormal = {
      x: (player._x - this._x) / distance,
      y: (player._y - this._y) / distance,
    };
    this._x -= overlap * collisionNormal.x;
    this._y -= overlap * collisionNormal.y;
    player._x += overlap * collisionNormal.x;
    player._y += overlap * collisionNormal.y;

    const relativeVelocity = {
      x: this._xVelocity - player._xVelocity,
      y: this._yVelocity - player._yVelocity,
    };
    const speed = relativeVelocity.x * collisionNormal.x + relativeVelocity.y * collisionNormal.y;
    if (speed < 0) {
      return;
    }
    const impulse = 2 * speed / (this._r + player._r);
    this._xVelocity -= impulse * player._r * collisionNormal.x;
    this._yVelocity -= impulse * player._r * collisionNormal.y;
    player._xVelocity += impulse * this._r * collisionNormal.x * (this._controls[4] ? 2 : 1);
    player._yVelocity += impulse * this._r * collisionNormal.y * (this._controls[4] ? 2 : 1);
  }

  /** @param {Controls} arr  */
  set controls(arr) {
    this._controls = arr;
  }

  
/** @return {playerData} */
  get initData(){
    return {
      id: this._id, 
      x: this._x,
      y: this._y,
      r: this._r,
      xVelocity: this._xVelocity,
      yVelocity: this._yVelocity,
      acceleration: this._acceleration,
      friction: this._friction,
    }
  }
  /** @return {playerData} */
  get updateData() {
    return {
      id: this._id, 
      x: this._x,
      y: this._y,
      r: this._r,
      xVelocity: this._xVelocity,
      yVelocity: this._yVelocity,
      controls: [...this._controls]
    }
  }
}