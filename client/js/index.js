import {App} from './app.js'

const app = new App(document.getElementById('app'));
console.log(1);

const startApp = () => {
  app.showRoomList();
}

const setUpGame = () => {

  const player = new Player(canvas);
  setInterval(() => {

    if (player.isControlsChanged) {
      player.isControlsChanged = false;

      // socket.emit('controlsChanged', player.controls);
    }
  }, 1000)
  // const mainLoop = () => {
  //   requestAnimationFrame(mainLoop);
  // }
  // mainLoop();
}

window.addEventListener('load', startApp);