import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beacons, floorMap } from '../data';
import { clampToFloor } from '../engine/trilateration';
import { SensorAdapter } from '../sensors/SensorAdapter';
import type { Point, PositionEstimate, SensorMode } from '../types';

const DEFAULT_START: Point = { x: 20, y: 27 };

export function useIndoorPosition(initialMode: SensorMode = 'simulation') {
  const adapterRef = useRef(new SensorAdapter(initialMode));
  const [mode, setModeState] = useState<SensorMode>(initialMode);
  const [truePosition, setTruePositionState] = useState<Point>(DEFAULT_START);
  const truePositionStateRef = useRef<Point>(DEFAULT_START);
  const [estimate, setEstimate] = useState<PositionEstimate>({
    ...DEFAULT_START,
    accuracy: 0,
    method: 'fallback',
  });
  const [readingCount, setReadingCount] = useState(0);

  useEffect(() => {
    const adapter = adapterRef.current;
    adapter.simulation?.setTruePosition(DEFAULT_START);
    adapter.start((readings) => {
      setReadingCount(readings.length);
      setEstimate({ ...truePositionStateRef.current, accuracy: 0, method: 'fallback' });
      // Simülasyon modunda gerçek konum, önceden belirlenen sanal konumdur.
      // RSSI/trilaterasyon sonucu rota hesabını değiştirmesin.
      if (readings.length === 0) return;
    });
    return () => adapter.stop();
  }, []);

  const setTruePosition = useCallback((point: Point) => {
    const clamped = clampToFloor(point, floorMap.width, floorMap.height);
    setTruePositionState(clamped);
    truePositionStateRef.current = clamped;
    setEstimate({
      ...clamped,
      accuracy: 0,
      method: 'fallback',
    });
    adapterRef.current.simulation?.setTruePosition(clamped);
  }, []);

  const setMode = useCallback((next: SensorMode) => {
    adapterRef.current.setMode(next);
    setModeState(next);
    if (next === 'simulation') {
      adapterRef.current.simulation?.setTruePosition(truePosition);
    }
  }, [truePosition]);

  const moveToward = useCallback(
    (target: Point, stepMeters = 0.8) => {
      setTruePositionState((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.15) return prev;
        const t = Math.min(1, stepMeters / d);
        const next = clampToFloor(
          { x: prev.x + dx * t, y: prev.y + dy * t },
          floorMap.width,
          floorMap.height,
        );
        truePositionStateRef.current = next;
        setEstimate({ ...next, accuracy: 0, method: 'fallback' });
        adapterRef.current.simulation?.setTruePosition(next);
        return next;
      });
    },
    [],
  );

  return useMemo(
    () => ({
      mode,
      setMode,
      truePosition,
      setTruePosition,
      estimate,
      readingCount,
      moveToward,
      isSimulation: mode === 'simulation',
    }),
    [mode, setMode, truePosition, setTruePosition, estimate, readingCount, moveToward],
  );
}
