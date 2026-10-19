import { useContext } from 'react';
import { PersistenceContext } from './context';
import type { PersistenceContextValue } from './types';

export function usePersistence(): PersistenceContextValue {
  const ctx = useContext(PersistenceContext);
  if (!ctx) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return ctx;
}

export function useOptionalPersistence(): PersistenceContextValue | null {
  return useContext(PersistenceContext);
}
