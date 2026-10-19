import React, { useEffect, useMemo, useState } from 'react';
import { createSimulationEngine } from '@/simulation';
import { SimulationContext } from './context';
import type { SimulationContextValue, SimulationProviderProps } from './types';
import type { SimulationEvent } from '@/simulation';

export const SimulationProvider: React.FC<SimulationProviderProps> = ({
  engine: propEngine,
  children,
}) => {
  const engine = useMemo(() => propEngine ?? createSimulationEngine(), [propEngine]);
  const [state, setState] = useState(() => engine.getState());
  const [lastEvents, setLastEvents] = useState<readonly SimulationEvent[]>([]);

  useEffect(() => {
    setState(engine.getState());
    const unsubscribe = engine.subscribe((nextState, events) => {
      setState(nextState);
      setLastEvents(events);
    });

    if (typeof window !== 'undefined') {
      (window as unknown as { __CYBERLIFE_SIM__?: typeof engine }).__CYBERLIFE_SIM__ = engine;
    }

    return () => {
      unsubscribe();
    };
  }, [engine, propEngine]);

  const dispatch = React.useCallback(
    (command: Parameters<typeof engine.dispatch>[0]) => {
      return engine.dispatch(command);
    },
    [engine]
  );

  const contextValue: SimulationContextValue = {
    engine,
    state,
    dispatch,
    lastEvents,
  };

  return <SimulationContext.Provider value={contextValue}>{children}</SimulationContext.Provider>;
};
