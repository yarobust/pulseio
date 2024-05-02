import { BACKEND_URL } from './constants.js';
import { RoomList } from './components/RoomList.js';
import { Player } from './player.js';
export class App {
  constructor(appElm) {
    this.appElm = appElm;
  }

  showRoomList(){
    this.appElm.replaceChildren(RoomList({
      connectToRoom: this.connectToRoom.bind(this)
    }))
  }
  showGame(){
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth;
  canvas.height = innerHeight;
  }

  connectToRoom(roomId){
    const socket = io(BACKEND_URL,
      { query: { roomId } }
    );
  
    socket.on('connect', () => {
      console.log('connected');
    })
  
    socket.on('disconnet:reason', (reason) => {
      console.log(reason);
    })
  }
  startGame(){

  }
}