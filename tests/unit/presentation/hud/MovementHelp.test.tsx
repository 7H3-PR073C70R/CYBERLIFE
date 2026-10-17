import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MovementHelp } from '@/presentation/hud/MovementHelp';

describe('MovementHelp Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MovementHelp isOpen={false} onClose={vi.fn()} cameraMode="THIRD_PERSON" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders controls guide in plain language when isOpen is true', () => {
    render(<MovementHelp isOpen={true} onClose={vi.fn()} cameraMode="THIRD_PERSON" />);

    expect(screen.getByTestId('movement-help-panel')).toBeInTheDocument();
    expect(screen.getByText(/Neighborhood Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/W A S D/i)).toBeInTheDocument();
    expect(screen.getByText(/3rd Person \(Behind Avatar\)/i)).toBeInTheDocument();
  });

  it('calls onClose when dismiss button is clicked', () => {
    const handleClose = vi.fn();
    render(<MovementHelp isOpen={true} onClose={handleClose} cameraMode="THIRD_PERSON" />);

    const dismissBtn = screen.getByTestId('dismiss-movement-help');
    fireEvent.click(dismissBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays first-person mode indicator when in FIRST_PERSON', () => {
    render(<MovementHelp isOpen={true} onClose={vi.fn()} cameraMode="FIRST_PERSON" />);
    expect(screen.getByText(/1st Person \(Through Eyes\)/i)).toBeInTheDocument();
  });
});
