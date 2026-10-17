import { createContext } from 'react';
import type { SimulationContextValue } from './types';

export const SimulationContext = createContext<SimulationContextValue | null>(null);
