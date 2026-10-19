import { createContext } from 'react';
import type { PersistenceContextValue } from './types';

export const PersistenceContext = createContext<PersistenceContextValue | null>(null);
