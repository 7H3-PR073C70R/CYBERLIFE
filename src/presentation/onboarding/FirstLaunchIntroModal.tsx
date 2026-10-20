/**
 * Cyberlife — Milestone 10: First-Launch Introduction Modal Component
 *
 * Provides a short, polished, accessible introductory tour for first-time players.
 * Teaches:
 * - 3D Lagos Island open world & movement controls
 * - Camera toggle [V]
 * - Contextual interactions [E] with NPCs and objects
 * - Physical workstation & virtual desktop boundary
 * - 100% simulated sandbox safety guarantee
 * - Field Guide manual reference & manual terminal command typing
 * - Objective tracking and incident response workflow
 * - M9 local game persistence
 *
 * Supports skipping, resuming, keyboard navigation, and updates
 * authoritative SimulationState onboarding progress.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ONBOARDING_STEPS } from '@/simulation/onboarding/stepDefinitions';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface FirstLaunchIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenControlsReference?: () => void;
}

export const FirstLaunchIntroModal: React.FC<FirstLaunchIntroModalProps> = ({
  isOpen,
  onClose,
  onOpenControlsReference,
}) => {
  const sim = useOptionalSimulation();
  const onboarding = sim?.state.onboarding;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const currentStep = ONBOARDING_STEPS[currentStepIndex] ?? ONBOARDING_STEPS[0]!;

  // Sync step index if simulation has an active step ID
  useEffect(() => {
    if (onboarding?.activeStepId) {
      const idx = ONBOARDING_STEPS.findIndex(s => s.id === onboarding.activeStepId);
      if (idx >= 0) {
        setCurrentStepIndex(idx);
      }
    }
  }, [onboarding?.activeStepId]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = ONBOARDING_STEPS[nextIdx];
      setCurrentStepIndex(nextIdx);

      sim?.dispatch({
        type: 'CompleteOnboardingStep',
        stepId: currentStep.id,
        nextStepId: nextStep?.id,
      });
    } else {
      // Completed the final step
      sim?.dispatch({
        type: 'CompleteOnboardingStep',
        stepId: currentStep.id,
        nextStepId: null,
      });
      onClose();
    }
  }, [currentStepIndex, totalSteps, currentStep.id, sim, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem('cyberlife_intro_skipped', 'true');
    } catch {
      // Ignore in private browsing
    }
    sim?.dispatch({
      type: 'SkipOnboarding',
    });
    onClose();
  }, [sim, onClose]);

  // Keyboard navigation: Escape to skip, Left to go back, Right/Enter to advance
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      className="onboarding-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      data-testid="first-launch-intro-modal"
    >
      <div className="onboarding-modal-card hud-interactive">
        {/* Header with Title and Close / Skip */}
        <div className="onboarding-modal-header">
          <div className="onboarding-badge-group">
            <span className="onboarding-icon" aria-hidden="true">
              🚀
            </span>
            <span className="onboarding-step-counter" data-testid="onboarding-step-counter">
              Step {currentStep.stepNumber} of {totalSteps}
            </span>
            <span className="onboarding-category-pill">{currentStep.category.toUpperCase()}</span>
          </div>

          <button
            type="button"
            className="btn-icon-close"
            onClick={handleSkip}
            aria-label="Skip introduction tour"
            data-testid="onboarding-skip-btn"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Stepper Bar */}
        <div
          className="onboarding-progress-bar"
          role="progressbar"
          aria-valuenow={currentStep.stepNumber}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Onboarding Progress"
        >
          <div
            className="onboarding-progress-fill"
            style={{ width: `${(currentStep.stepNumber / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="onboarding-modal-body">
          <h2
            id="onboarding-modal-title"
            className="onboarding-step-title"
            data-testid="onboarding-step-title"
          >
            {currentStep.title}
          </h2>

          <p className="onboarding-step-desc" data-testid="onboarding-step-desc">
            {currentStep.description}
          </p>

          {/* Controls Badge Reminder */}
          {currentStep.controlsHint && (
            <div className="onboarding-controls-callout" data-testid="onboarding-controls-hint">
              <span className="controls-callout-icon" aria-hidden="true">
                🎮
              </span>
              <div>
                <strong>Action: </strong>
                <span>{currentStep.controlsHint}</span>
              </div>
            </div>
          )}

          {/* Why It Matters Callout */}
          <div className="onboarding-why-callout" data-testid="onboarding-why-it-matters">
            <span className="why-callout-icon" aria-hidden="true">
              💡
            </span>
            <div>
              <strong style={{ color: 'var(--color-accent-emerald)' }}>Why this matters: </strong>
              <span>{currentStep.whyItMatters}</span>
            </div>
          </div>

          {/* Prompt */}
          <div className="onboarding-action-prompt">
            <span aria-hidden="true">👉</span>
            <span>{currentStep.actionPrompt}</span>
          </div>
        </div>

        {/* Navigation Actions Footer */}
        <div className="onboarding-modal-footer">
          <button
            type="button"
            className="btn-ghost-secondary"
            onClick={handleSkip}
            data-testid="onboarding-skip-tour-btn"
          >
            Skip Orientation
          </button>

          {onOpenControlsReference && (
            <button
              type="button"
              className="btn-ghost-secondary"
              onClick={() => {
                onOpenControlsReference();
              }}
              data-testid="onboarding-open-controls-btn"
              style={{ fontSize: '0.8rem' }}
            >
              ⌨️ Full Controls Reference
            </button>
          )}

          <div className="onboarding-nav-btn-group">
            {!isFirstStep && (
              <button
                type="button"
                className="btn-outline"
                onClick={handlePrev}
                data-testid="onboarding-prev-btn"
              >
                Back
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              data-testid="onboarding-next-btn"
            >
              {isLastStep ? 'Finish Orientation' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
