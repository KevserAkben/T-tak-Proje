import type { Beacon, Point, PositionEstimate, RssiReading } from '../types';
import { distanceFromRssi } from './pathLoss';

type Circle = { x: number; y: number; r: number };

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Closed-form trilateration for 3 circles (least-squares for >3 via averaging pairs).
 * Falls back to nearest-beacon weighted centroid if geometry is degenerate.
 */
export function estimatePosition(
  readings: RssiReading[],
  beacons: Beacon[],
): PositionEstimate {
  const beaconMap = new Map(beacons.map((b) => [b.id, b]));
  const circles: Circle[] = [];

  for (const reading of readings) {
    const beacon = beaconMap.get(reading.beaconId);
    if (!beacon) continue;
    circles.push({
      x: beacon.x,
      y: beacon.y,
      r: distanceFromRssi(reading.rssi, beacon.txPower),
    });
  }

  circles.sort((a, b) => a.r - b.r);

  if (circles.length === 0) {
    return { x: 20, y: 27, accuracy: 99, method: 'fallback' };
  }

  if (circles.length === 1) {
    return { x: circles[0].x, y: circles[0].y, accuracy: circles[0].r, method: 'nearest' };
  }

  if (circles.length === 2) {
    const [a, b] = circles;
    const d = distance(a, b);
    if (d < 0.01) {
      return { x: a.x, y: a.y, accuracy: (a.r + b.r) / 2, method: 'nearest' };
    }
    const t = Math.max(0, Math.min(1, a.r / (a.r + b.r)));
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      accuracy: Math.abs(a.r - b.r) / 2 + 1,
      method: 'nearest',
    };
  }

  const tri = trilaterateThree(circles[0], circles[1], circles[2]);
  if (!tri) {
    return weightedCentroid(circles);
  }

  // Refine with remaining circles if any
  let x = tri.x;
  let y = tri.y;
  if (circles.length > 3) {
    const points: Point[] = [tri];
    for (let i = 1; i < circles.length - 2; i++) {
      const p = trilaterateThree(circles[i], circles[i + 1], circles[i + 2]);
      if (p) points.push(p);
    }
    x = points.reduce((s, p) => s + p.x, 0) / points.length;
    y = points.reduce((s, p) => s + p.y, 0) / points.length;
  }

  const residuals = circles.map((c) => Math.abs(distance({ x, y }, c) - c.r));
  const accuracy = residuals.reduce((s, v) => s + v, 0) / residuals.length;

  return { x, y, accuracy, method: 'trilateration' };
}

function trilaterateThree(c1: Circle, c2: Circle, c3: Circle): Point | null {
  const A = 2 * (c2.x - c1.x);
  const B = 2 * (c2.y - c1.y);
  const C =
    c1.r * c1.r -
    c2.r * c2.r -
    c1.x * c1.x +
    c2.x * c2.x -
    c1.y * c1.y +
    c2.y * c2.y;
  const D = 2 * (c3.x - c2.x);
  const E = 2 * (c3.y - c2.y);
  const F =
    c2.r * c2.r -
    c3.r * c3.r -
    c2.x * c2.x +
    c3.x * c3.x -
    c2.y * c2.y +
    c3.y * c3.y;

  const denom = A * E - B * D;
  if (Math.abs(denom) < 1e-6) {
    return null;
  }

  return {
    x: (C * E - B * F) / denom,
    y: (A * F - C * D) / denom,
  };
}

function weightedCentroid(circles: Circle[]): PositionEstimate {
  let wSum = 0;
  let x = 0;
  let y = 0;
  for (const c of circles) {
    const w = 1 / Math.max(c.r, 0.5);
    x += c.x * w;
    y += c.y * w;
    wSum += w;
  }
  return {
    x: x / wSum,
    y: y / wSum,
    accuracy: circles[0].r,
    method: 'nearest',
  };
}

export function clampToFloor(point: Point, width: number, height: number, margin = 0.5): Point {
  return {
    x: Math.min(Math.max(point.x, margin), width - margin),
    y: Math.min(Math.max(point.y, margin), height - margin),
  };
}
