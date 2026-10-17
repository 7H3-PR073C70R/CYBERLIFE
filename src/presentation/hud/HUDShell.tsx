import React, { useState } from 'react';
import { CameraMode, InteractableDefinition } from '../world/worldConfig';
import { StatusOverlay } from './StatusOverlay';
import { ObjectiveTrackerHUD } from './ObjectiveTrackerHUD';
import { InteractionHelpPrompt } from './InteractionHelpPrompt';
import { MovementHelp } from './MovementHelp';
import { InteractionPrompt } from './InteractionPrompt';
import { DevSimulationDrawer } from './DevSimulationDrawer';

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
  milestoneTitle,
  simulationTimeString,
  playerFunds,
  onToggleCamera,
  onInteract,
}) => {
  const [isMovementHelpOpen, setIsMovementHelpOpen] = useState<boolean>(true);
  const [isDevDrawerOpen, setIsDevDrawerOpen] = useState<boolean>(false);

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
        isHelpOpen={isMovementHelpOpen}
        isDevDrawerOpen={isDevDrawerOpen}
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

        {/* Right Side: Objective Tracker (Prototype Standby) */}
        <ObjectiveTrackerHUD />
      </div>

      {/* Bottom Footer Guidance */}
      <InteractionHelpPrompt />

      {/* Development-only Simulation Verification Drawer */}
      <DevSimulationDrawer isOpen={isDevDrawerOpen} onClose={() => setIsDevDrawerOpen(false)} />
    </div>
  );
};
