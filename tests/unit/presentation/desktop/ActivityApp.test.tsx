import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ActivityApp } from '@/presentation/desktop/apps/ActivityApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('ActivityApp Component', () => {
  it('renders activity monitor header, safety notice, and baseline activities', () => {
    render(
      <SimulationProvider>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.getByTestId('activity-app-container')).toBeInTheDocument();
    expect(screen.getByText(/Security Activity Monitor/i)).toBeInTheDocument();
    expect(screen.getByText(/cedarline-sec-ws04.corp.local/i)).toBeInTheDocument();
    expect(screen.getByText(/Console Session Established/i)).toBeInTheDocument();
    expect(screen.getByText(/Perimeter Egress Drop Logged/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Baseline Synchronized/i)).toBeInTheDocument();
  });

  it('filters activities by category pills', () => {
    render(
      <SimulationProvider>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Initial has 3 cards
    expect(screen.getAllByTestId('activity-card').length).toBe(3);

    // Filter to SYSTEM only
    fireEvent.click(screen.getByTestId('activity-filter-system'));
    expect(screen.getByText(/Perimeter Egress Drop Logged/i)).toBeInTheDocument();
    expect(screen.queryByText(/Console Session Established/i)).not.toBeInTheDocument();

    // Filter back to ALL
    fireEvent.click(screen.getByTestId('activity-filter-all'));
    expect(screen.getAllByTestId('activity-card').length).toBe(3);
  });

  it('dynamically receives and displays CYBER_ACTIVITY_RECORDED simulation events', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ActivityApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.queryByText(/Tool Executed: NETMAP/i)).not.toBeInTheDocument();

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
});
