import React, { useState } from 'react';
import { CameraMode, InteractableDefinition } from '../world/worldConfig';
import { StatusOverlay } from './StatusOverlay';
import { ObjectiveTrackerHUD } from './ObjectiveTrackerHUD';
import { InteractionHelpPrompt } from './InteractionHelpPrompt';
import { MovementHelp } from './MovementHelp';
import { InteractionPrompt } from './InteractionPrompt';

export interface HUDShellProps {
  currentLocationName?: string;
  cameraMode?: CameraMode;
  activeTarget?: InteractableDefinition | null;
  onToggleCamera?: () => void;
  onInteract?: () => void;
}

export const HUDShell: React.FC<HUDShellProps> = ({
  currentLocationName = 'Downtown Urban Block',
  cameraMode = 'THIRD_PERSON',
  activeTarget = null,
  onToggleCamera,
  onInteract,
}) => {
  const [isMovementHelpOpen, setIsMovementHelpOpen] = useState<boolean>(true);

  return (
    <div className="hud-layer" data-testid="hud-layer">
      {/* Top Header */}
      <StatusOverlay
        currentLocationName={currentLocationName}
        cameraMode={cameraMode}
        onToggleCamera={onToggleCamera}
        onToggleHelp={() => setIsMovementHelpOpen(prev => !prev)}
        isHelpOpen={isMovementHelpOpen}
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
    </div>
  );
};
