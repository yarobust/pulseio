import { fetchRooms } from '../api/rooms.js';
import { App } from '../app.js';

/**
 * @returns {HTMLElement}
 */
export function RoomList({connectToRoom}) {
  const roomListElm = document.createElement('div');
  roomListElm.id = 'room-list'
  const containerElm = document.createElement('div');
  containerElm.classList.add('room-list__container');

  const handleRoomListClick = (event) => {
    // if (event.target.class)
    if (event.target.classList.contains('room-list__play-button')){
      connectToRoom(event.target.parentNode.id);
    }
  }
  
  fetchRooms()
    .then((res) => res.json())
    .then((res) => {
      res.forEach((room) => {
        const roomElm = document.createElement('p');
        roomElm.id = room.id
        roomElm.classList.add('room');
        const descriptionElm = document.createElement('span');
        descriptionElm.textContent = `name: ${room.id.slice(0, 8)}|players: ${room.playerNumber}/${room.playerLimit}`;
        const buttonElm = document.createElement('button');
        buttonElm.classList.add('room-list__play-button')
        buttonElm.textContent = 'Play';
        roomElm.append(descriptionElm, buttonElm)
        containerElm.append(roomElm);

        roomElm.addEventListener('mouseup', handleRoomListClick)
      })
    })
    .catch((reason)=> {
      const errorElm = document.createElement('p');
      errorElm.classList.add('error');
      errorElm.textContent = 'Unable to fetch rooms';
      containerElm.append(errorElm);
    });
  
    roomListElm.append(containerElm);
  return roomListElm;
}