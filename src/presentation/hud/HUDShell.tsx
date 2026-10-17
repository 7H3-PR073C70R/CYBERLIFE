import React from 'react';
import { StatusOverlay } from './StatusOverlay';
import { ObjectiveTrackerHUD } from './ObjectiveTrackerHUD';
import { InteractionHelpPrompt } from './InteractionHelpPrompt';

export interface HUDShellProps {
  version?: string;
}

export const HUDShell: React.FC<HUDShellProps> = () => {
  return (
    <div className="hud-layer" data-testid="hud-layer">
      <StatusOverlay />
      <div className="hud-body">
        <ObjectiveTrackerHUD />
      </div>
      <InteractionHelpPrompt />
    </div>
  );
};
