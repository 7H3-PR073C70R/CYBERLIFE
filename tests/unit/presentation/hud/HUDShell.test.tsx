import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HUDShell } from '@/presentation/hud/HUDShell';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('HUDShell Component — Incident Status Visibility', () => {
  it('renders objective tracker and menu incident action when incident is active', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <HUDShell />
      </SimulationProvider>
    );

    // Objective tracker panel is visible outside the computer
    expect(screen.getByTestId('objective-tracker-panel')).toBeInTheDocument();
    expect(screen.getByText(/Review Incident Briefing/i)).toBeInTheDocument();
    expect(screen.getByTestId('objective-status-badge')).toHaveTextContent('0/9 Done');

    // Open menu to verify checklist option is present
    const menuBtn = screen.getByTestId('hud-menu-toggle-btn');
    fireEvent.click(menuBtn);
    expect(screen.getByTestId('hud-menu-incident-btn')).toBeInTheDocument();
  });

  it('does NOT render objective tracker or menu incident action when incident is completed', () => {
    const engine = createSimulationEngine();
    const baseState = engine.getState();
    engine.loadState({
      ...baseState,
      flags: {
        ...baseState.flags,
        mission_aster_completed: true,
      },
      mission: {
        ...baseState.mission!,
        isCompleted: true,
        phase: 'completed',
        objectives: baseState.mission!.objectives.map(o => ({ ...o, isCompleted: true })),
      },
    });

    render(
      <SimulationProvider engine={engine}>
        <HUDShell />
      </SimulationProvider>
    );

    // Objective tracker panel is NOT rendered outside the computer
    expect(screen.queryByTestId('objective-tracker-panel')).not.toBeInTheDocument();

    // Open menu to verify checklist option is NOT present
    const menuBtn = screen.getByTestId('hud-menu-toggle-btn');
    fireEvent.click(menuBtn);
    expect(screen.queryByTestId('hud-menu-incident-btn')).not.toBeInTheDocument();
  });

  it('does NOT render objective tracker or menu incident action when there is no active incident', () => {
    const engine = createSimulationEngine();
    const baseState = engine.getState();
    engine.loadState({
      ...baseState,
      mission: undefined,
    });

    render(
      <SimulationProvider engine={engine}>
        <HUDShell />
      </SimulationProvider>
    );

    // Objective tracker panel is NOT rendered outside the computer
    expect(screen.queryByTestId('objective-tracker-panel')).not.toBeInTheDocument();

    // Open menu to verify checklist option is NOT present
    const menuBtn = screen.getByTestId('hud-menu-toggle-btn');
    fireEvent.click(menuBtn);
    expect(screen.queryByTestId('hud-menu-incident-btn')).not.toBeInTheDocument();
  });
});
