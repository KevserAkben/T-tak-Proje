import type { NavigationStep, Point, RouteResult } from '../types';

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function bearing(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function turnType(prevBearing: number, nextBearing: number): 'left' | 'right' | 'straight' {
  let delta = nextBearing - prevBearing;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  if (Math.abs(delta) < 30) return 'straight';
  return delta > 0 ? 'right' : 'left';
}

/**
 * Convert route polyline into Turkish turn-by-turn instructions.
 */
export function buildNavigationSteps(route: RouteResult, destinationName: string): NavigationStep[] {
  const { points } = route;
  if (points.length === 0) {
    return [];
  }

  if (points.length === 1) {
    return [
      {
        id: 'arrive',
        instruction: `${destinationName} konumundasınız.`,
        distanceMeters: 0,
        type: 'arrive',
      },
    ];
  }

  const steps: NavigationStep[] = [
    {
      id: 'start',
      instruction: `${destinationName} hedefine doğru ilerleyin.`,
      distanceMeters: dist(points[0], points[1]),
      type: 'start',
    },
  ];

  let prevBearing = bearing(points[0], points[1]);
  let straightAccum = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const nextBearing = bearing(points[i], points[i + 1]);
    const segment = dist(points[i], points[i + 1]);
    const turn = turnType(prevBearing, nextBearing);

    if (turn === 'straight') {
      straightAccum += segment;
    } else {
      if (straightAccum > 1) {
        steps.push({
          id: `straight-${i}`,
          instruction: `Yaklaşık ${Math.round(straightAccum)} metre düz ilerleyin.`,
          distanceMeters: straightAccum,
          type: 'straight',
        });
        straightAccum = 0;
      }
      const label = turn === 'left' ? 'sola' : 'sağa';
      steps.push({
        id: `turn-${i}`,
        instruction: `${label.charAt(0).toUpperCase() + label.slice(1)} dönün, sonra ${Math.round(segment)} metre ilerleyin.`,
        distanceMeters: segment,
        type: turn,
      });
    }
    prevBearing = nextBearing;
  }

  if (straightAccum > 0.5) {
    steps.push({
      id: 'final-straight',
      instruction: `Yaklaşık ${Math.round(straightAccum)} metre düz ilerleyin.`,
      distanceMeters: straightAccum,
      type: 'straight',
    });
  }

  steps.push({
    id: 'arrive',
    instruction: `${destinationName} hedefine ulaştınız.`,
    distanceMeters: 0,
    type: 'arrive',
  });

  return steps;
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return `${Math.max(1, Math.round(minutes * 60))} sn`;
  }
  return `${minutes.toFixed(1)} dk`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
