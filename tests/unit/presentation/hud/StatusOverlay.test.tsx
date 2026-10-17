import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusOverlay } from '@/presentation/hud/StatusOverlay';

describe('StatusOverlay Component', () => {
  it('renders the title, M2 milestone badge, and playable world indicator', () => {
    render(<StatusOverlay />);

    expect(screen.getByRole('heading', { level: 1, name: /Cyberlife/i })).toBeInTheDocument();
    expect(screen.getByTestId('hud-milestone-badge')).toHaveTextContent(/M2: 3D Neighborhood/i);
    expect(screen.getByTestId('hud-prototype-badge')).toHaveTextContent(/Playable World/i);
  });

  it('renders custom milestone title when passed as prop', () => {
    render(<StatusOverlay milestoneTitle="M1: Bootable Foundation" />);
    expect(screen.getByTestId('hud-milestone-badge')).toHaveTextContent(/M1: Bootable Foundation/i);
  });

  it('displays the current location badge', () => {
    render(<StatusOverlay currentLocationName="Downtown Urban Block" />);
    expect(screen.getByTestId('hud-location-badge')).toHaveTextContent(/Downtown Urban Block/i);
  });

  it('displays active camera mode and triggers onToggleCamera callback', () => {
    const handleToggleCamera = vi.fn();
    render(<StatusOverlay cameraMode="THIRD_PERSON" onToggleCamera={handleToggleCamera} />);

    const cameraBtn = screen.getByTestId('hud-camera-toggle-btn');
    expect(cameraBtn).toHaveTextContent(/3rd Person \[V\]/i);

    fireEvent.click(cameraBtn);
    expect(handleToggleCamera).toHaveBeenCalledTimes(1);
  });

  it('provides an accessible system status indicator', () => {
    render(<StatusOverlay />);

    const statusElement = screen.getByRole('status', { name: /Simulation and rendering status/i });
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveTextContent(/WebGL Active/i);
  });
});
