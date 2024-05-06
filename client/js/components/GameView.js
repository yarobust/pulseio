export function GameView(){
  const gameElm = document.createElement('canvas');
  gameElm.id = 'canvas';
  gameElm.tabIndex = 1;
  return gameElm;
}