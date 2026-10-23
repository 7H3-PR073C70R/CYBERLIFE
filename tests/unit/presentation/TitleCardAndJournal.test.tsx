import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleCardOverlay } from '@/presentation/narrative/TitleCardOverlay';
import { BlackoutOverlay } from '@/presentation/narrative/BlackoutOverlay';
import { JournalApp } from '@/presentation/desktop/apps/JournalApp';
import { syncJournalToFilesystem } from '@/simulation/narrative/episodeDirector';

describe('Presentation Components — TitleCard, JournalApp & Blackout', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('TitleCardOverlay Component', () => {
    it('renders boot terminal overlay with title, kernel banner, and hash', () => {
      const handleDismiss = vi.fn();

      render(
        <TitleCardOverlay
          title="ep01_triage_init.pcap"
          episodeHash="c7b9148d2f5a6b0981e4c7310df0b968c9284218a5e82110c7104bfa3513a011"
          kernelBanner="EkoSec Linux 6.12.0-cyberlife-arm64 #1 SMP PREEMPT_DYNAMIC WAT 2026"
          timestampIso="2026-10-12T07:42:00.000Z"
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      expect(screen.getByTestId('episode-title-card')).toBeInTheDocument();
      expect(screen.getByText(/ep01_triage_init\.pcap/i)).toBeInTheDocument();
      expect(screen.getByText(/c7b9148d2f5a6b0981e4c7310df0b968c9284218a5e82110c7104bfa3513a011/i)).toBeInTheDocument();
    });

    it('triggers onDismiss on mouse click', () => {
      const handleDismiss = vi.fn();

      render(
        <TitleCardOverlay
          title="ep01_triage_init.pcap"
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      fireEvent.click(screen.getByTestId('episode-title-card'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('triggers onDismiss on key press', () => {
      const handleDismiss = vi.fn();

      render(
        <TitleCardOverlay
          title="ep01_triage_init.pcap"
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('JournalApp Component', () => {
    beforeEach(() => {
      syncJournalToFilesystem(['ep01_journal_01']);
    });

    it('renders decrypted enclave vault and entry card from virtual filesystem', () => {
      render(<JournalApp />);

      expect(screen.getByTestId('journal-app')).toBeInTheDocument();
      expect(screen.getByText(/AES-256-GCM/i)).toBeInTheDocument();
      expect(screen.getByTestId('journal-entry-ep01_journal_01')).toBeInTheDocument();
      expect(screen.getAllByText(/Monday Morning \/\/ Before the Marina Tower Shift/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders recorded claims and forensic status badges', () => {
      render(<JournalApp />);

      expect(screen.getByText(/ep01_claim_01/i)).toBeInTheDocument();
      expect(screen.getByText(/VERIFIED TRUE/i)).toBeInTheDocument();

      expect(screen.getByText(/ep01_claim_02/i)).toBeInTheDocument();
      expect(screen.getByText(/CONTRADICTED/i)).toBeInTheDocument();
    });

    it('filters claims using search input', () => {
      render(<JournalApp />);

      const searchInput = screen.getByTestId('journal-search-input');
      fireEvent.change(searchInput, { target: { value: 'transit gateway' } });

      expect(screen.getByText(/ep01_claim_01/i)).toBeInTheDocument();
    });
  });

  describe('BlackoutOverlay Component', () => {
    it('renders brownout flicker overlay and battery status HUD', () => {
      const handleDismiss = vi.fn();

      render(
        <BlackoutOverlay
          durationSeconds={4}
          reduceMotion={false}
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      expect(screen.getByTestId('episode-blackout-overlay')).toBeInTheDocument();
      expect(screen.getByText(/VOLTAGE:/i)).toBeInTheDocument();
    });

    it('respects reduceMotion flag by disabling heavy flicker animation', () => {
      const handleDismiss = vi.fn();

      const { container } = render(
        <BlackoutOverlay
          durationSeconds={4}
          reduceMotion={true}
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      const overlay = screen.getByTestId('episode-blackout-overlay');
      expect(overlay).toBeInTheDocument();
      // Verifies reduce motion style or class
      expect(container.innerHTML).toContain('reduced-motion');
    });

    it('triggers onDismiss when clicked', () => {
      const handleDismiss = vi.fn();

      render(
        <BlackoutOverlay
          durationSeconds={4}
          reduceMotion={false}
          onDismiss={handleDismiss}
          speedMultiplier={100}
        />
      );

      fireEvent.click(screen.getByTestId('episode-blackout-overlay'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
