import { io } from 'socket.io-client';

declare global {
  interface Window { io: typeof io }
}

type Controls = boolean[]

interface CircleData {
  x: number,
  y: number,
  r: number,
  xVelocity: number,
  yVelocity: number,
  acceleration: number,
  friction: number,
  lineWidth?: number,
strokeStyle?: string,
fillStyle?: string,
}

interface BallData extends CircleData {

}

interface PlayerData extends CircleData {
  id: string,
  controls?: Controls,
  actionStrokeStyle?: string
}

interface LineData {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color?: string,
  lineWidth?: number,
}

interface WallData extends LineData {
  type?: 'normal' | 'bouncy'| 'goal-line',
}

interface StadiumData {
  walls: WallData[],
  lines: LineData[],
  circles: CircleData[],
}

interface GameInitData {
  width: number,
  height: number,
  players: PlayerData[],
  ball: BallData,
  stadium: StadiumData,
  score: number[],
  timeLeft?: number //ms
}

interface GameStateData {
  players: PlayerData[]
  ball: BallData
}

interface gameRestartData {
  score: number[],
  timeLeft?: number, // ms
  players: PlayerData[],
  ball: BallData,
}



interface continueEventData {
  dateNow: number,
  timeout: number
}

