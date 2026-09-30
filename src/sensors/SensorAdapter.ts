import type { ISensor, SensorListener, SensorMode } from '../types';
import { BleSensorStub } from './BleSensor.stub';
import { SimulationSensor } from './SimulationSensor';

export class SensorAdapter {
  private sensor: ISensor;
  private listener: SensorListener | null = null;

  constructor(mode: SensorMode = 'simulation') {
    this.sensor = mode === 'ble' ? new BleSensorStub() : new SimulationSensor();
  }

  get mode(): SensorMode {
    return this.sensor.mode;
  }

  get simulation(): SimulationSensor | null {
    return this.sensor instanceof SimulationSensor ? this.sensor : null;
  }

  setMode(mode: SensorMode): void {
    const wasRunning = this.listener !== null;
    if (wasRunning) {
      this.sensor.stop();
    }
    this.sensor = mode === 'ble' ? new BleSensorStub() : new SimulationSensor();
    if (wasRunning && this.listener) {
      this.sensor.start(this.listener);
    }
  }

  start(listener: SensorListener): void {
    this.listener = listener;
    this.sensor.start(listener);
  }

  stop(): void {
    this.sensor.stop();
    this.listener = null;
  }
}

export { SimulationSensor } from './SimulationSensor';
export { BleSensorStub } from './BleSensor.stub';
