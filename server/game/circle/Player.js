import { Circle } from './Circle.js';

export class Player extends Circle {
  /** @param {PlayerConstructorData} data  */
  constructor(data) {
    const {id, actionStrokeStyle, ...restData} = data;
    super(data);
    this._id = id;
    this._controls = Array(5).map(() => false);
    this._actionStrokeStyle = actionStrokeStyle || 'red';
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
      circle.xVelocity += impulse * this._r * collisionNormal.x * (this._controls[4] ? 2 : 1);
      circle.yVelocity += impulse * this._r * collisionNormal.y * (this._controls[4] ? 2 : 1);
    }

  /** @param {Controls} arr  */
  set controls(arr) {
    this._controls = arr;
  }
  get id (){
    return this._id;
  }
  get controls(){
    return [...this._controls];
  }
 /** @returns {PlayerData} */
  getData(){
    return  {
      id: this._id,
      controls: [...this._controls],
      actionStrokeStyle: this._actionStrokeStyle,
      ...super.getData()
    };
  }
}