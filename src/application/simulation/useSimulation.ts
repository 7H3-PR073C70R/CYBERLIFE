import { useContext } from 'react';
import { SimulationContext } from './context';
import type { SimulationContextValue } from './types';

/**
 * React hook to consume the authoritative simulation engine state and command dispatcher.
 * Throws if not mounted within a SimulationProvider.
 */
export function useSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a <SimulationProvider>');
  }
  return context;
}

/**
 * Optional hook variant that returns null if mounted outside a SimulationProvider.
 */
export function useOptionalSimulation(): SimulationContextValue | null {
  return useContext(SimulationContext);
}
