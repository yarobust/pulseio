export function ScreenControls() {
  const screenControlsElm = document.createElement('div');
  screenControlsElm.id = 'screen-controls';

  const arrowsContainerElm = document.createElement('div');
  arrowsContainerElm.classList.add('screen-controls__arrows-container');
  const upArrowElm = document.createElement('div');
  upArrowElm.dataset.direction = 'up';
  const rightArrowElm = document.createElement('div');
  rightArrowElm.dataset.direction = 'right';
  const downArrowElm = document.createElement('div');
  downArrowElm.dataset.direction = 'down';
  const leftArrowElm = document.createElement('div');
  leftArrowElm.dataset.direction = 'left';
  arrowsContainerElm.append(upArrowElm, rightArrowElm, downArrowElm, leftArrowElm);

  screenControlsElm.addEventListener('pointerdown', (e) => {
    if (!(e.target instanceof HTMLElement && e.target.dataset.direction)) {
      return;
    }
    e.target.setPointerCapture(e.pointerId);
    e.target.classList.add('screen-controls__arrow--pressed');
    let event;
    switch (e.target.dataset.direction) {
      case 'up':
        event = new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true });
        break;
      case 'right':
        event = new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true });
        break;
      case 'down':
        event = new KeyboardEvent('keydown', { code: 'KeyS', bubbles: true });
        break;
      case 'left':
        event = new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true });
        break;
    }
    screenControlsElm.dispatchEvent(event);
  });
  screenControlsElm.addEventListener('pointerup', (e) => {
    if (!(e.target instanceof HTMLElement && e.target.dataset.direction)) {
      return;
    }
    e.target.classList.remove('screen-controls__arrow--pressed');
    let event;
    switch (e.target.dataset.direction) {
      case 'up':
        event = new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true });
        break;
      case 'right':
        event = new KeyboardEvent('keyup', { code: 'KeyD', bubbles: true });
        break;
      case 'down':
        event = new KeyboardEvent('keyup', { code: 'KeyS', bubbles: true });
        break;
      case 'left':
        event = new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true });
        break;
    }
    screenControlsElm.dispatchEvent(event);
  });

  screenControlsElm.append(arrowsContainerElm);
  return screenControlsElm;
}