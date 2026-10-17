import type { ReactNode } from 'react';
import type {
  SimulationEngine,
  SimulationState,
  SimulationCommand,
  CommandResult,
  SimulationEvent,
} from '@/simulation';

export interface SimulationContextValue {
  engine: SimulationEngine;
  state: SimulationState;
  dispatch: (command: SimulationCommand) => CommandResult;
  lastEvents: readonly SimulationEvent[];
}

export interface SimulationProviderProps {
  engine?: SimulationEngine;
  children: ReactNode;
}
