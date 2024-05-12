import { Circle } from './Circle.js';

export class Ball extends Circle {
  /** @param {BallConstructorData} data  */
  constructor(data){
    super(data);
  }
  
  /** @returns {BallData} */
  get data(){
    return  super.getData();
  }
}