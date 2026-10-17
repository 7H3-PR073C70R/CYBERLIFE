import React from 'react';
import { WorldViewport } from '@/presentation/world/WorldViewport';

export const App: React.FC = () => {
  return (
    <main className="app-container" data-testid="cyberlife-app-root">
      {/* 3D World Viewport Layer with synchronized HUD overlays */}
      <WorldViewport />
    </main>
  );
};

export default App;
