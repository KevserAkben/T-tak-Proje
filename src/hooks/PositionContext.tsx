import React, { createContext, useContext } from 'react';
import { useIndoorPosition } from './useIndoorPosition';

type PositioningApi = ReturnType<typeof useIndoorPosition>;

export const PositionContext = createContext<PositioningApi | null>(null);

export function PositionProvider({ children }: { children: React.ReactNode }) {
  const positioning = useIndoorPosition('simulation');
  return (
    <PositionContext.Provider value={positioning}>{children}</PositionContext.Provider>
  );
}

export function usePosition(): PositioningApi {
  const ctx = useContext(PositionContext);
  if (!ctx) {
    throw new Error('usePosition must be used within PositionProvider');
  }
  return ctx;
}
