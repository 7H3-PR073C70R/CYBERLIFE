import React from 'react';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { PersistenceProvider } from '@/application/persistence/PersistenceContext';

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <PersistenceProvider>
        <main className="app-container" data-testid="cyberlife-app-root">
          {/* 3D World Viewport Layer with synchronized HUD overlays and authoritative simulation */}
          <WorldViewport />
        </main>
      </PersistenceProvider>
    </SimulationProvider>
  );
};

export default App;
