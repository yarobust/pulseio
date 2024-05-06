import {App} from './app.js'

const app = new App(document.getElementById('app'));

const startApp = () => {
  app.showRoomList();
}

window.addEventListener('load', startApp);