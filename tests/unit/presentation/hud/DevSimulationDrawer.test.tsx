import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevSimulationDrawer } from '@/presentation/hud/DevSimulationDrawer';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

describe('DevSimulationDrawer Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={false} onClose={() => {}} />
      </SimulationProvider>
    );

    expect(screen.queryByTestId('dev-sim-drawer')).not.toBeInTheDocument();
  });

  it('renders simulation inspector and displays authoritative state values when open', () => {
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={true} onClose={() => {}} />
      </SimulationProvider>
    );

    expect(screen.getByTestId('dev-sim-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('dev-state-revision')).toHaveTextContent('Rev: #0');
    expect(screen.getByTestId('dev-state-clock')).toHaveTextContent('08:00 AM');
    expect(screen.getByTestId('dev-state-funds')).toHaveTextContent('2,500.00');

    // Verify initial inventory list
    expect(screen.getByTestId('dev-inventory-list')).toBeInTheDocument();
    expect(screen.getByText('item_access_badge')).toBeInTheDocument();
    expect(screen.getByText('item_cedarline_notebook')).toBeInTheDocument();

    // Verify initial flags
    expect(screen.getByTestId('dev-flags-list')).toBeInTheDocument();
    expect(screen.getByText('apartment_door_unlocked')).toBeInTheDocument();
  });

  it('dispatches AdvanceSimulationTime when +1 Hour Clock button is clicked', () => {
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={true} onClose={() => {}} />
      </SimulationProvider>
    );

    const advanceBtn = screen.getByTestId('dev-btn-advance-1h');
    fireEvent.click(advanceBtn);

    // State revision increments to #1, clock updates to 09:00 AM
    expect(screen.getByTestId('dev-state-revision')).toHaveTextContent('Rev: #1');
    expect(screen.getByTestId('dev-state-clock')).toHaveTextContent('09:00 AM');

    const resultBox = screen.getByTestId('dev-command-result');
    expect(resultBox).toHaveTextContent(/Command Accepted/i);
    expect(resultBox).toHaveTextContent(/Advanced simulation time by 3600s/i);
  });

  it('dispatches CreditMoney when +₦500 Funds button is clicked', () => {
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={true} onClose={() => {}} />
      </SimulationProvider>
    );

    const creditBtn = screen.getByTestId('dev-btn-credit-money');
    fireEvent.click(creditBtn);

    expect(screen.getByTestId('dev-state-revision')).toHaveTextContent('Rev: #1');
    expect(screen.getByTestId('dev-state-funds')).toHaveTextContent('3,000.00');
  });

  it('handles invalid actions by showing rejection message, error code, and leaving state unchanged', () => {
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={true} onClose={() => {}} />
      </SimulationProvider>
    );

    const invalidBtn = screen.getByTestId('dev-btn-test-invalid');
    fireEvent.click(invalidBtn);

    // State revision is unchanged (#0)
    expect(screen.getByTestId('dev-state-revision')).toHaveTextContent('Rev: #0');
    expect(screen.getByTestId('dev-state-funds')).toHaveTextContent('2,500.00');

    // Rejection UI is rendered with stable error code
    const resultBox = screen.getByTestId('dev-command-result');
    expect(resultBox).toHaveTextContent(/Command Rejected/i);
    expect(resultBox).toHaveTextContent(/INSUFFICIENT_FUNDS/i);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SimulationProvider>
        <DevSimulationDrawer isOpen={true} onClose={handleClose} />
      </SimulationProvider>
    );

    const closeBtn = screen.getByRole('button', { name: /Close Simulation Inspector/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
