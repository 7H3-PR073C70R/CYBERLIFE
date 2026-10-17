import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '@/app/App';

describe('App Root Component', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the complete Cyberlife application shell successfully', () => {
    render(<App />);

    // Check main container
    const appRoot = screen.getByTestId('cyberlife-app-root');
    expect(appRoot).toBeInTheDocument();

    // Check 3D World Viewport
    const worldViewport = screen.getByTestId('world-viewport-container');
    expect(worldViewport).toBeInTheDocument();

    // Check HUD layer
    const hudLayer = screen.getByTestId('hud-layer');
    expect(hudLayer).toBeInTheDocument();

    // Check Header and Brand
    expect(screen.getByRole('heading', { level: 1, name: /Cyberlife/i })).toBeInTheDocument();

    // Check Objective Tracker Panel
    expect(screen.getByTestId('objective-tracker-panel')).toBeInTheDocument();

    // Check Interaction Help Card
    expect(screen.getByTestId('interaction-help-card')).toBeInTheDocument();
  });
});
