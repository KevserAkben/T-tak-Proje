import type { ISensor, SensorListener } from '../types';

/**
 * Placeholder for future react-native-ble-plx integration.
 * Emits empty readings so the UI can show that BLE mode is not active yet.
 */
export class BleSensorStub implements ISensor {
  readonly mode = 'ble' as const;

  private listener: SensorListener | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  start(listener: SensorListener): void {
    this.stop();
    this.listener = listener;
    this.timer = setInterval(() => {
      this.listener?.([]);
    }, 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.listener = null;
  }
}
