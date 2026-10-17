import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusOverlay } from '@/presentation/hud/StatusOverlay';

describe('StatusOverlay Component', () => {
  it('renders the title, milestone badge, and prototype indicator', () => {
    render(<StatusOverlay />);

    expect(screen.getByRole('heading', { level: 1, name: /Cyberlife/i })).toBeInTheDocument();
    expect(screen.getByTestId('hud-milestone-badge')).toHaveTextContent(/M1: Bootable Foundation/i);
    expect(screen.getByTestId('hud-prototype-badge')).toHaveTextContent(/Prototype/i);
  });

  it('provides an accessible system status indicator', () => {
    render(<StatusOverlay />);

    const statusElement = screen.getByRole('status', { name: /Simulation and rendering status/i });
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveTextContent(/WebGL Active/i);
  });
});
