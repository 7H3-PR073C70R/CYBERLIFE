import React from 'react';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { PersistenceProvider } from '@/application/persistence/PersistenceContext';

import { DevAssetViewer } from '@/presentation/dev/DevAssetViewer';

export const App: React.FC = () => {
  const isDev = import.meta.env.DEV;
  const isAssetViewer =
    isDev &&
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/asset-viewer' ||
        new URLSearchParams(window.location.search).get('view') === 'asset-viewer'));

  if (isAssetViewer) {
    return <DevAssetViewer />;
  }

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
