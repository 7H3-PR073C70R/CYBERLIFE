import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SyntheticMapModal } from '@/presentation/hud/SyntheticMapModal';

describe('SyntheticMapModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<SyntheticMapModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('synthetic-map-modal')).not.toBeInTheDocument();
  });

  it('renders modal title, geolocation coordinates, and markers when open', () => {
    render(
      <SyntheticMapModal
        isOpen={true}
        onClose={vi.fn()}
        currentLocationName="Lagos Island Marina"
      />
    );

    expect(screen.getByTestId('synthetic-map-modal')).toBeInTheDocument();
    expect(screen.getByText(/Lagos Island Tactical Geolocation Map/i)).toBeInTheDocument();
    expect(screen.getByText(/6.4531° N, 3.3958° E/i)).toBeInTheDocument();

    // Verify key markers
    expect(screen.getByTestId('map-marker-home')).toBeInTheDocument();
    expect(screen.getByTestId('map-marker-office')).toBeInTheDocument();
    expect(screen.getByTestId('map-marker-player')).toBeInTheDocument();
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('OFFICES')).toBeInTheDocument();
    expect(screen.getByText('YOU ARE HERE')).toBeInTheDocument();
  });

  it('calls onClose when close button or backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<SyntheticMapModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('synthetic-map-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId('synthetic-map-modal');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('closes when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<SyntheticMapModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('dynamically tracks player coordinates and movement', () => {
    const { rerender } = render(
      <SyntheticMapModal
        isOpen={true}
        onClose={vi.fn()}
        playerCoords={{ x: 0, z: 10 }}
      />
    );

    const playerMarker = screen.getByTestId('map-marker-player');
    expect(playerMarker).toBeInTheDocument();
    expect(screen.getAllByText(/0\.0m.*10\.0m/i).length).toBeGreaterThan(0);

    // Player moves to apartment (-12, -14)
    rerender(
      <SyntheticMapModal
        isOpen={true}
        onClose={vi.fn()}
        playerCoords={{ x: -12, z: -14 }}
      />
    );

    expect(screen.getAllByText(/-12\.0m.*-14\.0m/i).length).toBeGreaterThan(0);
  });
});
