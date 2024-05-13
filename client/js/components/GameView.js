export function GameView({handleExit=()=>{}}={}) {
  const gameViewElm = document.createElement('div');
  gameViewElm.id = 'game-view';
  const containerElm = document.createElement('div');
  containerElm.classList.add('game-view__container');

  const barContainerElm = document.createElement('div');
  barContainerElm.classList.add('game-view__bar-container');
  const barElm = document.createElement('div');
  barElm.classList.add('game-view__bar');

  const scoreElm = document.createElement('div');
  scoreElm.classList.add('bar__score');
  scoreElm.textContent = '-:-'

  const timerElm = document.createElement('div');
  timerElm.classList.add('bar__timer');
  timerElm.textContent = '--:--'
  
  const exitBtn = document.createElement('button');
  exitBtn.classList.add('bar__exit-btn');
  exitBtn.textContent = 'exit'
  exitBtn.addEventListener('click', handleExit);

  const canvasContainerElm = document.createElement('div');
  canvasContainerElm.classList.add('game-view__canvas-container');
  const canvasElm = document.createElement('canvas');
  canvasElm.id = 'canvas';
  canvasElm.tabIndex = 1;


  barElm.append(scoreElm, timerElm, exitBtn);
  barContainerElm.append(barElm);
  canvasContainerElm.append(canvasElm);
  containerElm.append(barContainerElm, canvasContainerElm);
  gameViewElm.append(containerElm);

  return gameViewElm;
}