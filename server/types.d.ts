
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
  ball?: ballData
}

interface LineData {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color?: 'string',
  lineWidth?: number,
}

interface WallData extends LineData {
  type?: 'normal' | 'bouncy'| 'goal-line',
}