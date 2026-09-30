/**
 * Lightweight sanity check for positioning / routing engines (no RN runtime).
 * Run: npx tsx scripts/smoke-check.ts
 */
import { beacons, floorMap } from '../src/data';
import {
  buildNavigationSteps,
  distanceFromRssi,
  estimatePosition,
  findShortestPath,
  rssiFromDistance,
  routeFromPosition,
} from '../src/engine';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const d = distanceFromRssi(rssiFromDistance(10, -59), -59);
assert(Math.abs(d - 10) < 0.5, `path-loss roundtrip expected ~10, got ${d}`);

const center = { x: 20, y: 14 };
const readings = beacons.map((b) => ({
  beaconId: b.id,
  rssi: rssiFromDistance(Math.hypot(center.x - b.x, center.y - b.y), b.txPower),
}));
const est = estimatePosition(readings, beacons);
assert(Math.hypot(est.x - center.x, est.y - center.y) < 3, `trilateration off: ${est.x},${est.y}`);

const path = findShortestPath(floorMap, 'n_giris', 'n_radyoloji');
assert(!!path && path.distanceMeters > 5, 'dijkstra path missing');

const route = routeFromPosition(floorMap, { x: 20, y: 27 }, 'n_radyoloji');
assert(!!route, 'routeFromPosition failed');
const steps = buildNavigationSteps(route!, 'Radyoloji');
assert(steps.length >= 2, 'navigation steps too short');
assert(steps[steps.length - 1].type === 'arrive', 'missing arrive step');

console.log('smoke-check OK');
console.log({
  trilateration: { x: est.x.toFixed(2), y: est.y.toFixed(2), method: est.method },
  routeMeters: route!.distanceMeters.toFixed(1),
  steps: steps.length,
});
