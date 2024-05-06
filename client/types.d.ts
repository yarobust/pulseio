import { io } from 'socket.io-client';

declare global {
  interface Window { io: typeof io }
}

type Controls = boolean[]

interface circleData {
  x: number,
  y: number,
  r: number,
  xVelocity: number,
  yVelocity: number,
  acceleration?: number,
  friction?: number,
}

interface ballData extends circleData {

}

interface playerData extends circleData {
  id: string,
  controls?: Controls,
}

interface gameInitData {
  width: number,
  height: number,
  mainPlayer: playerData, //The player you are playing on
}

interface gameStateData {
  players: playerData[]
  ball: ballData
}
