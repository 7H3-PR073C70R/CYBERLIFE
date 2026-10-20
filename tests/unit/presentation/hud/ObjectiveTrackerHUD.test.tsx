import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObjectiveTrackerHUD } from '@/presentation/hud/ObjectiveTrackerHUD';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('ObjectiveTrackerHUD Component', () => {
  it('renders the objective panel with default standby state', () => {
    render(<ObjectiveTrackerHUD />);

    expect(screen.getByTestId('objective-tracker-panel')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Mission System Standby/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('objective-status-badge')).toHaveTextContent(/Inactive in M1/i);
    expect(screen.getByTestId('objective-stage-title')).toHaveTextContent(/Prototype Preview/i);
  });

  it('explicitly identifies that the authoritative simulation is reserved for later milestones', () => {
    render(<ObjectiveTrackerHUD />);

    expect(
      screen.getByText(
        /The mission state machine and authoritative gameplay engine will be introduced/i
      )
    ).toBeInTheDocument();
  });

  it('displays active badge if isActive prop is explicitly passed', () => {
    render(<ObjectiveTrackerHUD isActive={true} missionTitle="Test Mission" />);

    expect(screen.getByTestId('objective-status-badge')).toHaveTextContent('Active');
    expect(screen.getByRole('heading', { level: 2, name: /Test Mission/i })).toBeInTheDocument();
  });

  it('allows collapsing and expanding the objective tracker panel', () => {
    render(<ObjectiveTrackerHUD />);
    const toggleButton = screen.getByTestId('btn-toggle-collapse-objective');
    expect(toggleButton).toHaveTextContent('−');
    expect(screen.getByTestId('objective-stage-title')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('⊞');
    expect(screen.queryByTestId('objective-stage-title')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('−');
    expect(screen.getByTestId('objective-stage-title')).toBeInTheDocument();
  });

  it('renders live mission with exact step synchronization and copyable commands', () => {
    const engine = createSimulationEngine();
    render(
      <SimulationProvider engine={engine}>
        <ObjectiveTrackerHUD />
      </SimulationProvider>
    );

    // Initial state: Step 1 of 9
    expect(screen.getByTestId('objective-status-badge')).toHaveTextContent('0/9 Done');
    expect(screen.getByText(/Step 1 of 9/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Incident Briefing with Lead Analyst Amina/i)).toBeInTheDocument();
    expect(screen.getByText(/Where to Go:/i)).toBeInTheDocument();
    expect(screen.getByText(/What to Do:/i)).toBeInTheDocument();
  });

  it('renders completed mission state with 9/9 sync and post-incident roadmap directives', () => {
    const engine = createSimulationEngine();

    // Load completed mission state
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
        <ObjectiveTrackerHUD forceExpanded={true} />
      </SimulationProvider>
    );

    // Status badge is 9/9 Completed
    expect(screen.getByTestId('objective-status-badge')).toHaveTextContent('✓ 9/9 Completed');
    expect(screen.getByText(/Next Play: Expand Career & Explore Lagos Island/i)).toBeInTheDocument();

    // Directives list places and contacts
    expect(screen.getByText(/Where to Go Next/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lead Analyst Amina/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tunde 'ZeroDay' Bakare/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Mama Nkechi/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Folake Davies/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Career & Market App/i).length).toBeGreaterThanOrEqual(1);

    // Collapsed header verification
    const toggleButton = screen.getByTestId('btn-toggle-collapse-objective');
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Incident Solved \(9\/9\) \/\/ Next: Explore Lagos Island/i)).toBeInTheDocument();
  });
});
