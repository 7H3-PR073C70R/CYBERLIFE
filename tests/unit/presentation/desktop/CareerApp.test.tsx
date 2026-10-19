import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CareerApp } from '@/presentation/desktop/apps/CareerApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('CareerApp Component', () => {
  it('renders career header, tier badge, and starting authoritative balance', () => {
    render(
      <SimulationProvider>
        <CareerApp />
      </SimulationProvider>
    );

    expect(screen.getByTestId('career-app')).toBeInTheDocument();
    expect(screen.getByTestId('career-level-badge')).toHaveTextContent('Tier 1');
    expect(screen.getByTestId('career-balance-display')).toHaveTextContent('₦2,500.00');
    expect(screen.getByTestId('career-overview-tab')).toBeInTheDocument();
  });

  it('navigates seamlessly between all five tabs', () => {
    render(
      <SimulationProvider>
        <CareerApp />
      </SimulationProvider>
    );

    // Tab 1: Overview
    expect(screen.getByTestId('career-overview-tab')).toBeInTheDocument();

    // Tab 2: Job Board
    fireEvent.click(screen.getByTestId('tab-jobs'));
    expect(screen.getByTestId('job-board-tab')).toBeInTheDocument();

    // Tab 3: Skills Matrix
    fireEvent.click(screen.getByTestId('tab-skills'));
    expect(screen.getByTestId('skills-matrix-tab')).toBeInTheDocument();

    // Tab 4: Market
    fireEvent.click(screen.getByTestId('tab-market'));
    expect(screen.getByTestId('shop-market-tab')).toBeInTheDocument();

    // Tab 5: Ledger
    fireEvent.click(screen.getByTestId('tab-ledger'));
    expect(screen.getByTestId('financial-ledger-tab')).toBeInTheDocument();
  });

  it('browses available tickets and accepts a job ticket', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <CareerApp />
      </SimulationProvider>
    );

    // Switch to Job Board
    fireEvent.click(screen.getByTestId('tab-jobs'));

    // Check Cedarline triage job card
    expect(screen.getByTestId('job-card-job_cedarline_triage')).toBeInTheDocument();
    expect(screen.getByTestId('btn-accept-job-job_cedarline_triage')).toBeInTheDocument();

    // Accept Cedarline triage job
    act(() => {
      fireEvent.click(screen.getByTestId('btn-accept-job-job_cedarline_triage'));
    });

    // Subtab automatically switches to active assignment
    expect(screen.getByTestId('active-assignment-panel')).toBeInTheDocument();
    expect(screen.getAllByText(/Triage svc-aster Credential Spike/i).length).toBeGreaterThan(0);
  });

  it('shows live objectives in active assignment and alerts when objectives are incomplete', () => {
    const engine = createSimulationEngine();
    engine.dispatch({ type: 'AcceptJob', jobId: 'job_cedarline_triage' });

    render(
      <SimulationProvider engine={engine}>
        <CareerApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('tab-jobs'));
    fireEvent.click(screen.getByTestId('subtab-active-assignment'));

    expect(screen.getByTestId('active-assignment-panel')).toBeInTheDocument();
    expect(screen.getByTestId('active-obj-obj_triage_log')).toBeInTheDocument();

    // Attempting to verify without meeting objectives
    act(() => {
      fireEvent.click(screen.getByTestId('btn-verify-assignment'));
    });

    // Alert feedback banner should report incomplete objectives
    expect(screen.getByTestId('career-feedback-banner')).toBeInTheDocument();
    expect(screen.getByTestId('career-feedback-banner')).toHaveTextContent(
      /pending objectives|cannot complete/i
    );
  });

  it('renders all 7 cybersecurity skills with levels and progress bars', () => {
    render(
      <SimulationProvider>
        <CareerApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('tab-skills'));

    expect(screen.getByTestId('skill-card-log_analysis')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-network_fundamentals')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-incident_response')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-security_fundamentals')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-evidence_handling')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-reporting')).toBeInTheDocument();
    expect(screen.getByTestId('skill-card-troubleshooting')).toBeInTheDocument();
  });

  it('allows purchasing affordable item, deducting funds and adding to inventory', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <CareerApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('tab-market'));

    // Buy Lagos Ceramic Mug (₦200.00 = 20,000 kobo)
    const buyMugBtn = screen.getByTestId('btn-purchase-item_lagos_coffee_mug');
    expect(buyMugBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(buyMugBtn);
    });

    // Balance changes from ₦2,500.00 to ₦2,300.00
    expect(screen.getByTestId('career-balance-display')).toHaveTextContent('₦2,300.00');

    // Feedback confirms purchase
    expect(screen.getByTestId('career-feedback-banner')).toHaveTextContent(/Purchased/i);

    // Verify simulation state inventory
    const slot = engine.getState().inventory.slots.find(s => s.itemId === 'item_lagos_coffee_mug');
    expect(slot).toBeDefined();
    expect(slot?.quantity).toBe(1);
  });

  it('shows financial ledger with authoritative audit transactions and recurring expenses', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <CareerApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('tab-ledger'));

    expect(screen.getByTestId('financial-ledger-tab')).toBeInTheDocument();
    expect(screen.getByTestId('recurring-expense-expense_apartment_rent')).toBeInTheDocument();
    expect(screen.getByTestId('recurring-expense-expense_workstation_fiber')).toBeInTheDocument();
    expect(screen.getByTestId('tx-row-tx_initial_balance')).toBeInTheDocument();
  });
});
