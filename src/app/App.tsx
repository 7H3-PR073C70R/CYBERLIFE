import React from 'react';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <main className="app-container" data-testid="cyberlife-app-root">
        {/* 3D World Viewport Layer with synchronized HUD overlays and authoritative simulation */}
        <WorldViewport />
      </main>
    </SimulationProvider>
  );
};

export default App;
