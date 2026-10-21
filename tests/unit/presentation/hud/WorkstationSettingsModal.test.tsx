import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkstationSettingsModal } from '@/presentation/hud/WorkstationSettingsModal';
import { audioManager } from '@/presentation/audio/AudioManager';

describe('WorkstationSettingsModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    audioManager.setMuted(false);
    audioManager.setBusVolume('master', 1.0);
    audioManager.setBusVolume('voice', 1.0);
    audioManager.setBusVolume('sfx', 0.8);
    audioManager.setBusVolume('ambience', 0.5);
    audioManager.setBusVolume('music', 0.35);
    audioManager.setBusVolume('ui', 0.6);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <WorkstationSettingsModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders audio bus sliders and mute button when isOpen is true', () => {
    render(<WorkstationSettingsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('workstation-settings-modal')).toBeInTheDocument();
    expect(screen.getByText(/Audio & Volume Buses/i)).toBeInTheDocument();

    expect(screen.getByTestId('setting-audio-master')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-voice')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-sfx')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-ambience')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-music')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-ui')).toBeInTheDocument();
    expect(screen.getByTestId('setting-audio-mute')).toBeInTheDocument();
  });

  it('updates audio bus volume in audioManager when slider changes', () => {
    render(<WorkstationSettingsModal isOpen={true} onClose={vi.fn()} />);

    const musicSlider = screen.getByTestId('setting-audio-music');
    fireEvent.change(musicSlider, { target: { value: '0.75' } });

    expect(audioManager.getBusVolume('music')).toBeCloseTo(0.75);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('toggles mute state and updates the mute button text', () => {
    render(<WorkstationSettingsModal isOpen={true} onClose={vi.fn()} />);

    const muteBtn = screen.getByTestId('setting-audio-mute');
    expect(muteBtn).toHaveTextContent(/Mute All/i);

    fireEvent.click(muteBtn);
    expect(audioManager.isMasterMuted()).toBe(true);
    expect(muteBtn).toHaveTextContent(/Muted/i);

    fireEvent.click(muteBtn);
    expect(audioManager.isMasterMuted()).toBe(false);
    expect(muteBtn).toHaveTextContent(/Mute All/i);
  });

  it('calls onClose when close button or Done button is clicked', () => {
    const handleClose = vi.fn();
    render(<WorkstationSettingsModal isOpen={true} onClose={handleClose} />);

    fireEvent.click(screen.getByTestId('settings-close-btn'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('settings-done-btn'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
