import { Line } from './Line.js';

export class Wall extends Line {
  /** @param {WallData} data  */
  constructor(data){
    const {type='normal', ...restData} = data;
    super(restData);
    this._type = type;
  }

  getData(){
    return { 
      type: this._type,
      ...super.getData()
    };
  }
  get type() {
    return this._type;
  }
}
