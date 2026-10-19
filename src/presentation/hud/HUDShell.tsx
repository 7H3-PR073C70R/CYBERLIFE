import React, { useState, useEffect } from 'react';
import { CameraMode, InteractableDefinition } from '../world/worldConfig';
import { StatusOverlay } from './StatusOverlay';
import { ObjectiveTrackerHUD } from './ObjectiveTrackerHUD';
import { MovementHelp } from './MovementHelp';
import { InteractionPrompt } from './InteractionPrompt';
import { InteractionHelpPrompt } from './InteractionHelpPrompt';
import { DevSimulationDrawer } from './DevSimulationDrawer';
import { SaveManagerModal } from './SaveManagerModal';
import { FirstLaunchIntroModal } from '../onboarding/FirstLaunchIntroModal';
import { ControlsReferenceModal } from '../onboarding/ControlsReferenceModal';
import { ContextualGuidanceHUD } from '../onboarding/ContextualGuidanceHUD';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface HUDShellProps {
  currentLocationName?: string;
  cameraMode?: CameraMode;
  activeTarget?: InteractableDefinition | null;
  milestoneTitle?: string;
  simulationTimeString?: string;
  playerFunds?: string;
  onToggleCamera?: () => void;
  onInteract?: () => void;
}

export const HUDShell: React.FC<HUDShellProps> = ({
  currentLocationName = 'Lagos Island — Broad Street & Marina',
  cameraMode = 'THIRD_PERSON',
  activeTarget = null,
  milestoneTitle = 'M10: Guided Learning & Onboarding',
  simulationTimeString,
  playerFunds,
  onToggleCamera,
  onInteract,
}) => {
  const sim = useOptionalSimulation();
  const onboarding = sim?.state.onboarding;

  const [isMovementHelpOpen, setIsMovementHelpOpen] = useState<boolean>(false);
  const [isDevDrawerOpen, setIsDevDrawerOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // M10 First-launch intro modal: Opens by default if onboarding intro is not yet completed or skipped
  const isIntroPending = Boolean(
    onboarding && !onboarding.introCompleted && !onboarding.introSkipped
  );
  const [isIntroModalOpen, setIsIntroModalOpen] = useState<boolean>(isIntroPending);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState<boolean>(false);

  // Listen for 'H' / 'h' keyboard shortcut to toggle Controls Reference
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsControlsModalOpen(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMovementHelpOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="hud-layer" data-testid="hud-layer">
      {/* Top Header */}
      <StatusOverlay
        milestoneTitle={milestoneTitle}
        currentLocationName={currentLocationName}
        cameraMode={cameraMode}
        simulationTimeString={simulationTimeString}
        playerFunds={playerFunds}
        onToggleCamera={onToggleCamera}
        onToggleHelp={() => setIsMovementHelpOpen(prev => !prev)}
        onToggleDevDrawer={() => setIsDevDrawerOpen(prev => !prev)}
        onToggleSaveModal={() => setIsSaveModalOpen(prev => !prev)}
        onToggleTour={() => setIsIntroModalOpen(true)}
        onToggleControls={() => setIsControlsModalOpen(true)}
        isHelpOpen={isMovementHelpOpen}
        isDevDrawerOpen={isDevDrawerOpen}
        isControlsOpen={isControlsModalOpen}
      />

      {/* Middle Layout: Side Panels & Nearby Interaction Prompt */}
      <div className="hud-body">
        {/* Left Side: Movement & Controls Guide */}
        <MovementHelp
          isOpen={isMovementHelpOpen}
          onClose={() => setIsMovementHelpOpen(false)}
          cameraMode={cameraMode}
        />

        {/* Center: Contextual Interaction Prompt (Appears when near an interactive location) */}
        <InteractionPrompt target={activeTarget} onInteract={onInteract} />

        {/* Right Side: Objective Tracker */}
        <ObjectiveTrackerHUD />
      </div>

      {/* Dynamic Contextual Guidance Card */}
      <ContextualGuidanceHUD
        isNearInteraction={Boolean(activeTarget)}
        onOpenControlsReference={() => setIsControlsModalOpen(true)}
      />

      {/* Accessible Interaction & Narrative Guidance Footer */}
      <InteractionHelpPrompt />

      {/* First-Launch Introduction Walkthrough Modal */}
      <FirstLaunchIntroModal
        isOpen={isIntroModalOpen}
        onClose={() => setIsIntroModalOpen(false)}
        onOpenControlsReference={() => {
          setIsIntroModalOpen(false);
          setIsControlsModalOpen(true);
        }}
      />

      {/* Full Controls & Game Reference Modal */}
      <ControlsReferenceModal
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
        onOpenIntroTour={() => setIsIntroModalOpen(true)}
      />

      {/* Development-only Simulation Verification Drawer */}
      <DevSimulationDrawer isOpen={isDevDrawerOpen} onClose={() => setIsDevDrawerOpen(false)} />

      {/* Persistent Save/Load & Recovery Manager Modal */}
      <SaveManagerModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
    </div>
  );
};
