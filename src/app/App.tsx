import React from 'react';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { HUDShell } from '@/presentation/hud/HUDShell';

export const App: React.FC = () => {
  return (
    <main className="app-container" data-testid="cyberlife-app-root">
      {/* 3D World Viewport Layer (Three.js WebGL Canvas) */}
      <WorldViewport />

      {/* 2D HUD & Accessible Guidance Layer (React UI) */}
      <HUDShell />
    </main>
  );
};

export default App;
