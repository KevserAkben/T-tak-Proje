import beaconsData from './beacons.json';
import destinationsData from './destinations.json';
import floorMapData from './floor_map.json';
import type { Beacon, Destination, FloorMap } from '../types';

export const floorMap = floorMapData as FloorMap;
export const beacons = beaconsData as Beacon[];
export const destinations = destinationsData as Destination[];

export const WALKING_SPEED_MPS = 1.2;
