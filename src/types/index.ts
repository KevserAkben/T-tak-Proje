export type Point = {
  x: number;
  y: number;
};

export type Beacon = {
  id: string;
  name: string;
  x: number;
  y: number;
  txPower: number;
};

export type Room = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export type GraphNode = {
  id: string;
  x: number;
  y: number;
  label?: string;
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type Destination = {
  id: string;
  name: string;
  description: string;
  nodeId: string;
  category: string;
};

export type FloorMap = {
  width: number;
  height: number;
  unit: string;
  rooms: Room[];
  walls: { x1: number; y1: number; x2: number; y2: number }[];
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type RssiReading = {
  beaconId: string;
  rssi: number;
};

export type PositionEstimate = Point & {
  accuracy: number;
  method: 'trilateration' | 'nearest' | 'fallback';
};

export type RouteResult = {
  nodeIds: string[];
  points: Point[];
  distanceMeters: number;
  durationMinutes: number;
};

export type NavigationStep = {
  id: string;
  instruction: string;
  distanceMeters: number;
  type: 'start' | 'straight' | 'left' | 'right' | 'arrive';
};

export type SensorMode = 'simulation' | 'ble';

export type SensorListener = (readings: RssiReading[]) => void;

export interface ISensor {
  readonly mode: SensorMode;
  start(listener: SensorListener): void;
  stop(): void;
  /** Simulation only: set the true user position used to synthesize RSSI. */
  setTruePosition?(point: Point): void;
}
