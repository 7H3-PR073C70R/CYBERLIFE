import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DesktopShell } from '@/presentation/desktop/DesktopShell';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('DesktopShell Component', () => {
  it('renders desktop workspace, shortcuts, taskbar, and initial welcome banner', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    expect(screen.getByTestId('desktop-shell-container')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-taskbar')).toBeInTheDocument();

    // Shortcuts
    expect(screen.getByTestId('desktop-shortcut-terminal')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-shortcut-fieldGuide')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-shortcut-systemInfo')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-shortcut-notes')).toBeInTheDocument();

    // Welcome banner
    expect(screen.getByTestId('desktop-welcome-banner')).toBeInTheDocument();
  });

  it('dismisses welcome banner when clicking Got It button', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    const dismissBtn = screen.getByTestId('btn-welcome-dismiss');
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId('desktop-welcome-banner')).not.toBeInTheDocument();
  });

  it('opens Field Guide window when clicking desktop shortcut', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    const fieldGuideShortcut = screen.getByTestId('desktop-shortcut-fieldGuide');
    fireEvent.click(fieldGuideShortcut);

    expect(screen.getByTestId('window-frame-fieldGuide')).toBeInTheDocument();
    expect(screen.getByTestId('field-guide-container')).toBeInTheDocument();
  });

  it('toggles start menu and launches System Info from launcher', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    // Open start menu
    const startBtn = screen.getByTestId('btn-start-launcher');
    fireEvent.click(startBtn);

    expect(screen.getByTestId('desktop-start-menu')).toBeInTheDocument();

    // Click System Info item
    const sysInfoItem = screen.getByTestId('start-menu-item-systemInfo');
    fireEvent.click(sysInfoItem);

    // Start menu closes and window is opened
    expect(screen.queryByTestId('desktop-start-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('window-frame-systemInfo')).toBeInTheDocument();
  });

  it('calls onExitDesktop when tray Exit Desktop button is clicked', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    const exitBtn = screen.getByTestId('btn-tray-exit');
    fireEvent.click(exitBtn);

    expect(handleExit).toHaveBeenCalledTimes(1);
  });

  it('calls onExitDesktop on Escape key press when welcome banner is closed', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={handleExit} />
      </SimulationProvider>
    );

    // First Esc dismisses welcome banner
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByTestId('desktop-welcome-banner')).not.toBeInTheDocument();
    expect(handleExit).not.toHaveBeenCalled();

    // Second Esc exits desktop
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleExit).toHaveBeenCalledTimes(1);
  });

  it('displays empty desktop hint when all windows are closed', () => {
    const handleExit = vi.fn();

    render(
      <SimulationProvider>
        <DesktopShell
          workstationId="interact_cedarline_workstation"
          onExitDesktop={handleExit}
          initialApp="terminal"
        />
      </SimulationProvider>
    );

    // Terminal is open initially
    expect(screen.getByTestId('window-frame-terminal')).toBeInTheDocument();

    // Close terminal window
    const closeBtn = screen.getByTestId('btn-close-terminal');
    fireEvent.click(closeBtn);

    // Empty desktop hint appears
    expect(screen.getByTestId('empty-desktop-hint')).toBeInTheDocument();

    // Clicking Open Terminal on empty hint restores terminal
    const openTerminalBtn = screen.getByTestId('btn-empty-open-terminal');
    fireEvent.click(openTerminalBtn);
    expect(screen.getByTestId('window-frame-terminal')).toBeInTheDocument();
  });

  it('renders active incident banner and yellow flow on incident icon when incident is active', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={() => {}} />
      </SimulationProvider>
    );

    // Banner is rendered
    expect(screen.getByTestId('desktop-incident-banner')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE SOC DISPATCH/i)).toBeInTheDocument();

    // Incident shortcut has active yellow flow class
    const incidentShortcut = screen.getByTestId('desktop-shortcut-incident');
    expect(incidentShortcut).toHaveClass('shortcut-active-incident');

    // Welcome banner shows active case
    expect(screen.getByText(/Active SOC Case:/i)).toBeInTheDocument();
  });

  it('does NOT render incident banner or yellow flow on incident icon when incident is completed', () => {
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
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={() => {}} />
      </SimulationProvider>
    );

    // Banner is NOT rendered
    expect(screen.queryByTestId('desktop-incident-banner')).not.toBeInTheDocument();

    // Incident shortcut does NOT have active yellow flow class
    const incidentShortcut = screen.getByTestId('desktop-shortcut-incident');
    expect(incidentShortcut).not.toHaveClass('shortcut-active-incident');

    // Welcome banner does NOT show active case
    expect(screen.queryByText(/Active SOC Case:/i)).not.toBeInTheDocument();
  });

  it('does NOT render incident banner or yellow flow on incident icon when there is no active incident', () => {
    const engine = createSimulationEngine();
    const baseState = engine.getState();
    engine.loadState({
      ...baseState,
      mission: undefined,
    });

    render(
      <SimulationProvider engine={engine}>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={() => {}} />
      </SimulationProvider>
    );

    // Banner is NOT rendered
    expect(screen.queryByTestId('desktop-incident-banner')).not.toBeInTheDocument();

    // Incident shortcut does NOT have active yellow flow class
    const incidentShortcut = screen.getByTestId('desktop-shortcut-incident');
    expect(incidentShortcut).not.toHaveClass('shortcut-active-incident');

    // Welcome banner does NOT show active case
    expect(screen.queryByText(/Active SOC Case:/i)).not.toBeInTheDocument();
  });
});
