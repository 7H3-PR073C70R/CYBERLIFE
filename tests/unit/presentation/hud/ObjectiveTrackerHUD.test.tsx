import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ObjectiveTrackerHUD } from '@/presentation/hud/ObjectiveTrackerHUD';

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
});
