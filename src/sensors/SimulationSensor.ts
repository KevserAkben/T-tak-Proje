import { beacons } from '../data';
import { addRssiNoise, rssiFromDistance } from '../engine/pathLoss';
import type { ISensor, Point, RssiReading, SensorListener } from '../types';

const TICK_MS = 400;

/**
 * Synthesizes RSSI from known beacon positions and a controllable true position.
 * Used for Android demos without physical BLE hardware.
 */
export class SimulationSensor implements ISensor {
  readonly mode = 'simulation' as const;

  private listener: SensorListener | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private truePosition: Point = { x: 20, y: 27 };

  setTruePosition(point: Point): void {
    this.truePosition = { ...point };
  }

  getTruePosition(): Point {
    return { ...this.truePosition };
  }

  start(listener: SensorListener): void {
    this.stop();
    this.listener = listener;
    this.emit();
    this.timer = setInterval(() => this.emit(), TICK_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.listener = null;
  }

  private emit(): void {
    if (!this.listener) return;
    const readings: RssiReading[] = beacons.map((beacon) => {
      const d = Math.hypot(this.truePosition.x - beacon.x, this.truePosition.y - beacon.y);
      const clean = rssiFromDistance(d, beacon.txPower);
      return {
        beaconId: beacon.id,
        rssi: addRssiNoise(clean, 2.0),
      };
    });
    this.listener(readings);
  }
}
