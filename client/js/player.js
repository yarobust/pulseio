export class Player {
  // /**@param {import("./game.js").Game} game*/
  /** @param {HTMLCanvasElement} canvas*/
  constructor(canvas) {
    this.canvas = canvas;

    this.position = { x: 0, y: 0 }
    this.controls = { up: false, right: false, down: false, left: false, action: false };
    this.isControlsChanged = false;
    this.canvas.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
          if (!this.controls.up) {
            this.isControlsChanged = true;
            this.controls.up = true;
          }
          break;
        case 'KeyD':
          if (!this.controls.right) {
            this.isControlsChanged = true;
            this.controls.right = true;
          }
          break;
        case 'KeyS':
          if (!this.controls.down) {
            this.isControlsChanged = true;
            this.controls.down = true;
          }
          break;
        case 'KeyA':
          if (!this.controls.left) {
            this.isControlsChanged = true;
            this.controls.left = true;
          }
          break;
        case 'Space':
          if (!this.controls.action) {
            this.isControlsChanged = true;
            this.controls.action = true;
          }
          break;
      }
    });
    this.canvas.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
            this.isControlsChanged = true;
            this.controls.up = false;
          break;
        case 'KeyD':
            this.isControlsChanged = true;
            this.controls.right = false;
          break;
        case 'KeyS':
            this.isControlsChanged = true;
            this.controls.down = false;
          break;
        case 'KeyA':
            this.isControlsChanged = true;
            this.controls.left = false;
            break;
        case 'Space':
            this.isControlsChanged = true;
            this.controls.action = false;
          break;
      }
    });

  }
}