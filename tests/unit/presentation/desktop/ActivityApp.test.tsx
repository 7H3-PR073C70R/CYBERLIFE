import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ActivityApp } from '@/presentation/desktop/apps/ActivityApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('ActivityApp M20 Component', () => {
  it('renders Activity Director header, workstation node info, and all four tabs', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.getByTestId('activity-app-container')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVITY DIRECTOR & CAREER HUB/i)).toBeInTheDocument();
    expect(screen.getByText(/cedarline-sec-ws04.corp.local/i)).toBeInTheDocument();

    // Verify all four tabs are present
    expect(screen.getByTestId('tab-active-mission')).toBeInTheDocument();
    expect(screen.getByTestId('tab-opportunities')).toBeInTheDocument();
    expect(screen.getByTestId('tab-career-goals')).toBeInTheDocument();
    expect(screen.getByTestId('tab-audit-log')).toBeInTheDocument();
  });

  it('renders the Active Mission tab by default with live progress, checklist, and hints', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.getByTestId('panel-active-mission')).toBeInTheDocument();
    expect(screen.getByText(/The Aster Incident: Containment & Remediation/i)).toBeInTheDocument();
    expect(screen.getByText(/Analyze Ingestion Logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Least-Privilege Containment/i)).toBeInTheDocument();
    expect(screen.getByText(/0% Complete/i)).toBeInTheDocument();
  });

  it('switches to Opportunities tab and filters activities by category pills', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Switch to Opportunities tab
    fireEvent.click(screen.getByTestId('tab-opportunities'));
    expect(screen.getByTestId('panel-opportunities')).toBeInTheDocument();

    // Verify opportunity feed exists
    expect(screen.getByText(/Opportunity Director Feed/i)).toBeInTheDocument();
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-primary')).toBeInTheDocument();
    expect(screen.getByTestId('filter-recommended')).toBeInTheDocument();

    // Filter to RECOMMENDED
    fireEvent.click(screen.getByTestId('filter-recommended'));
    expect(screen.getByTestId('filter-recommended')).toBeInTheDocument();
  });

  it('allows generating new procedural contracts from the Opportunities tab', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Switch to Opportunities tab
    fireEvent.click(screen.getByTestId('tab-opportunities'));

    const genButton = screen.getByTestId('btn-generate-procedural');
    expect(genButton).toBeInTheDocument();

    fireEvent.click(genButton);

    // Feedback banner confirms new contract generation
    expect(screen.getByTestId('action-feedback-banner')).toHaveTextContent(
      /New Commercial Contract generated/i
    );
  });

  it('switches to Career & Goals tab and renders career standing, 9-skill matrix, and milestones', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Switch to Career & Goals tab
    fireEvent.click(screen.getByTestId('tab-career-goals'));
    expect(screen.getByTestId('panel-career-goals')).toBeInTheDocument();

    // Verify player standing & role
    expect(screen.getByText(/Current Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Trainee Analyst/i)).toBeInTheDocument();
    expect(screen.getByText(/Career Level & Standing/i)).toBeInTheDocument();
    expect(screen.getByText(/Long-Term Professional Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Cybersecurity Competencies/i)).toBeInTheDocument();

    // Check goals
    expect(screen.getByText(/Achieve Tier 2 Specialist Standing/i)).toBeInTheDocument();
    expect(screen.getByText(/Build 5-Star Freelance Standing/i)).toBeInTheDocument();
    expect(screen.getByText(/Unmask the Broad Street Threat Actor/i)).toBeInTheDocument();
  });

  it('switches to Audit Log tab, renders baseline telemetry, and handles CYBER_ACTIVITY_RECORDED events', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Switch to Audit Log & History tab
    fireEvent.click(screen.getByTestId('tab-audit-log'));
    expect(screen.getByTestId('panel-audit-log')).toBeInTheDocument();

    // Baseline telemetry
    expect(screen.getByText(/Console Session Established/i)).toBeInTheDocument();
    expect(screen.getByText(/Perimeter Egress Drop Logged/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Baseline Synchronized/i)).toBeInTheDocument();

    // Dispatch dynamic cyber activity event
    act(() => {
      engine.dispatch({
        type: 'RecordCyberActivity',
        activityId: 'act-test-netmap-01',
        tool: 'netmap',
        action: 'hosts',
        summary: 'Discovered 6 reachable subnet nodes',
        success: true,
      });
    });

    expect(screen.getByText(/Tool Executed: NETMAP/i)).toBeInTheDocument();
    expect(screen.getByText(/Discovered 6 reachable subnet nodes/i)).toBeInTheDocument();
  });

  it('allows accepting an available activity from Opportunities tab and switching to it', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Switch to Opportunities tab
    fireEvent.click(screen.getByTestId('tab-opportunities'));

    // Find and accept act_career_junior_support
    const acceptBtn = screen.getByTestId('btn-accept-act_career_junior_support');
    expect(acceptBtn).toBeInTheDocument();

    fireEvent.click(acceptBtn);

    // State should now have act_career_junior_support as active activity
    const state = engine.getState();
    expect(state.activityDirector?.activeActivityId).toBe('act_career_junior_support');

    // Automatically switched to Active Mission tab
    expect(screen.getByTestId('panel-active-mission')).toBeInTheDocument();
    expect(screen.getAllByText(/Cedarline Workstation: Diagnostics & Hardware Upgrade/i).length).toBeGreaterThanOrEqual(1);
  });

  it('allows resolving an active activity when objectives are satisfied', () => {
    const engine = createSimulationEngine();

    // Set up state where act_career_junior_support is active and 100% completed
    const baseState = engine.getState();
    const actRuntime = baseState.activityDirector!.activities['act_career_junior_support']!;
    engine.loadState({
      ...baseState,
      activityDirector: {
        ...baseState.activityDirector!,
        activeActivityId: 'act_career_junior_support',
        activities: {
          ...baseState.activityDirector!.activities,
          act_career_junior_support: {
            ...actRuntime,
            status: 'ACTIVE',
            objectives: actRuntime.objectives.map(o => ({ ...o, isCompleted: true })),
            progressPercentage: 100,
          },
        },
      },
    });

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.getByTestId('panel-active-mission')).toBeInTheDocument();
    const resolveBtn = screen.getByTestId('btn-resolve-activity');
    expect(resolveBtn).toBeInTheDocument();

    fireEvent.click(resolveBtn);

    const updatedState = engine.getState();
    expect(
      updatedState.activityDirector?.activities['act_career_junior_support']?.status
    ).toBe('COMPLETED');
    expect(updatedState.activityDirector?.completedHistory.length).toBe(1);
  });
});
