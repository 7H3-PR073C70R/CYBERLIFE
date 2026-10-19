import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirstLaunchIntroModal } from '@/presentation/onboarding/FirstLaunchIntroModal';
import { ControlsReferenceModal } from '@/presentation/onboarding/ControlsReferenceModal';
import { ContextualGuidanceHUD } from '@/presentation/onboarding/ContextualGuidanceHUD';

describe('Milestone 10: Onboarding Presentation UI', () => {
  describe('FirstLaunchIntroModal', () => {
    it('renders intro modal with step information and controls', () => {
      const onClose = vi.fn();
      const onOpenControls = vi.fn();

      render(
        <FirstLaunchIntroModal
          isOpen={true}
          onClose={onClose}
          onOpenControlsReference={onOpenControls}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to Lagos Island/i)).toBeInTheDocument();
      expect(screen.getByText(/Why this matters:/i)).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-next-btn')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-skip-btn')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('onboarding-next-btn'));
      expect(screen.getByText(/Camera & Spatial Awareness/i)).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-prev-btn')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('onboarding-prev-btn'));
      expect(screen.getByText(/Welcome to Lagos Island/i)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('onboarding-skip-btn'));
      expect(onClose).toHaveBeenCalled();
    });

    it('closes on Escape key press', () => {
      const onClose = vi.fn();

      render(<FirstLaunchIntroModal isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ControlsReferenceModal', () => {
    it('renders control categories and key shortcuts', () => {
      const onClose = vi.fn();
      const onOpenIntroTour = vi.fn();

      render(
        <ControlsReferenceModal isOpen={true} onClose={onClose} onOpenIntroTour={onOpenIntroTour} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Cyberlife Controls & Game Reference/i)).toBeInTheDocument();
      expect(screen.getByText(/3D World Navigation & Camera/i)).toBeInTheDocument();
      expect(screen.getByText(/W A S D \/ Arrows/i)).toBeInTheDocument();
      expect(screen.getByText(/Virtual Workstation & Desktop/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulated Terminal Shell/i)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('controls-close-btn'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('allows restarting the introduction tour from the controls modal', () => {
      const onClose = vi.fn();
      const onOpenIntroTour = vi.fn();

      render(
        <ControlsReferenceModal isOpen={true} onClose={onClose} onOpenIntroTour={onOpenIntroTour} />
      );

      const restartBtn = screen.getByTestId('controls-restart-tour-btn');
      expect(restartBtn).toBeInTheDocument();

      fireEvent.click(restartBtn);
      expect(onClose).toHaveBeenCalled();
      expect(onOpenIntroTour).toHaveBeenCalled();
    });
  });

  describe('ContextualGuidanceHUD', () => {
    it('renders nothing when simulation context is not provided', () => {
      const { container } = render(
        <ContextualGuidanceHUD
          isNearInteraction={false}
          isDesktopOpen={false}
          isTerminalActive={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
