/**
 * Cyberlife — Milestone 10: First-Launch Step Definitions
 *
 * Authored step sequence guiding first-time players through:
 * 1. Lagos Island world & navigation
 * 2. Camera switching
 * 3. Character & object interaction [E]
 * 4. Physical workstation access
 * 5. Physical world vs. virtual desktop boundary
 * 6. Field Guide manual reference
 * 7. Terminal basics & manual command typing
 * 8. Objective tracking & incident response
 */

import { OnboardingStepDefinition } from './types';

export const ONBOARDING_STEPS: readonly OnboardingStepDefinition[] = [
  {
    id: 'step_intro_welcome',
    stepNumber: 1,
    totalSteps: 8,
    category: 'welcome',
    title: 'Welcome to Lagos Island',
    description:
      'You are in the commercial and technology district of Lagos Island (Broad Street & Marina). Cyberlife is a 3D cybersecurity life RPG combining neighborhood exploration, authentic NPC relationships, career progression, and realistic simulated security investigations.',
    controlsHint: '[W][A][S][D] / [Arrow Keys] to walk',
    whyItMatters:
      'Cybersecurity is not just isolated hacking; it happens in real organizations, physical spaces, and communities where human relationships and trust are vital.',
    actionPrompt: 'Walk forward to explore the street and observe your surroundings.',
    nextStepId: 'step_movement_camera',
  },
  {
    id: 'step_movement_camera',
    stepNumber: 2,
    totalSteps: 8,
    category: 'movement',
    title: 'Camera & Spatial Awareness',
    description:
      "You can switch between 3rd-Person view (behind your avatar) and immersive 1st-Person view (through your avatar's eyes). In 1st-Person, click the screen to look around with your mouse, and press [Esc] anytime to release the cursor.",
    controlsHint: 'Press [V] to toggle camera mode',
    whyItMatters:
      'Physical inspection of security perimeters, server rooms, and workspace environments requires both wide situational awareness and detailed first-person examination.',
    actionPrompt: 'Press [V] to change your camera perspective.',
    prevStepId: 'step_intro_welcome',
    nextStepId: 'step_locate_npc_workstation',
  },
  {
    id: 'step_locate_npc_workstation',
    stepNumber: 3,
    totalSteps: 8,
    category: 'interaction',
    title: 'Locate Characters & Workstations',
    description:
      'Look for colleagues such as Lead Investigator Blessing or Goodness on the street, or head inside Cedarline Solutions to locate your analyst desk. Interactive objects and NPCs glow with a turquoise target beacon when you are nearby.',
    controlsHint: 'Approach glowing beacons on the ground',
    whyItMatters:
      'Gathering facts in security investigations begins with interviews, physical access points, and identifying key stakeholders before touching systems.',
    actionPrompt: 'Walk near an NPC or the Cedarline entrance marker.',
    prevStepId: 'step_movement_camera',
    nextStepId: 'step_interaction_key',
  },
  {
    id: 'step_interaction_key',
    stepNumber: 4,
    totalSteps: 8,
    category: 'interaction',
    title: 'The Interaction Key [E]',
    description:
      'Whenever you are close to an interactive person, door, noticeboard, or computer, a prompt will appear at the center of your screen. Press [E] to start a dialogue or activate the object.',
    controlsHint: 'Press [E] to interact',
    whyItMatters:
      'Dialogue choices affect your professional reputation, coworker trust, and unlock crucial evidence during incidents.',
    actionPrompt: 'Press [E] when a prompt appears to start an interaction.',
    prevStepId: 'step_locate_npc_workstation',
    nextStepId: 'step_workstation_launch',
  },
  {
    id: 'step_workstation_launch',
    stepNumber: 5,
    totalSteps: 8,
    category: 'workstation',
    title: 'Your Physical Workstation',
    description:
      'Inside Cedarline HQ or your apartment, walk up to the computer desk and press [E]. Your avatar sits down, and your monitor boots into the simulated Orion OS virtual desktop.',
    controlsHint: 'Press [E] at the computer desk',
    whyItMatters:
      'The physical workstation is your command center for network scans, evidence verification, email coordination, and incident management.',
    actionPrompt: 'Access your workstation desk to launch the virtual desktop.',
    prevStepId: 'step_interaction_key',
    nextStepId: 'step_desktop_vs_world',
  },
  {
    id: 'step_desktop_vs_world',
    stepNumber: 6,
    totalSteps: 8,
    category: 'cyber',
    title: 'Simulated Desktop vs. Real World',
    description:
      'All cybersecurity tools, terminals, hosts, and network packets inside Cyberlife are 100% sandboxed in browser memory. No command ever executes on your physical computer, and no real network scans are ever conducted.',
    controlsHint: 'Click window title bars to drag; click [✕] to close',
    whyItMatters:
      'Safety and ethics are foundational in cybersecurity. You can experiment boldly and learn without any risk to your real system.',
    actionPrompt: 'Review the sandbox guarantee in the desktop environment.',
    prevStepId: 'step_workstation_launch',
    nextStepId: 'step_field_guide_terminal',
  },
  {
    id: 'step_field_guide_terminal',
    stepNumber: 7,
    totalSteps: 8,
    category: 'terminal',
    title: 'Field Guide & Terminal Basics',
    description:
      'Open the Field Guide app (📖) on your desktop to read plain-English guides on every tool. Then open the Terminal app (💻) to view your command prompt. Remember: you must manually type commands — there are no auto-complete cheat buttons!',
    controlsHint: 'Click Terminal icon or type "help" in prompt',
    whyItMatters:
      'Manual command entry develops real terminal fluency, muscle memory, and an understanding of command syntax and arguments.',
    actionPrompt: 'Open the Terminal and type "status" or "whoami" to inspect your system.',
    prevStepId: 'step_desktop_vs_world',
    nextStepId: 'step_manual_commands_objectives',
  },
  {
    id: 'step_manual_commands_objectives',
    stepNumber: 8,
    totalSteps: 8,
    category: 'objectives',
    title: 'Objective Tracking & Career Path',
    description:
      'Check the Objective Tracker on the right side of your HUD for active mission milestones like The Aster Incident. Visit the Career app to browse freelance tickets, level up skills, earn income, and buy upgraded hardware.',
    controlsHint: 'Check HUD Objective Tracker (top-right)',
    whyItMatters:
      'Structured incident response follows a deliberate cycle: assessment, evidence preservation, containment, remediation, and verified reporting.',
    actionPrompt:
      'You are ready to begin your career. Click "Finish Orientation" to start playing!',
    prevStepId: 'step_field_guide_terminal',
  },
] as const;

export function getOnboardingStepById(id: string): OnboardingStepDefinition | undefined {
  return ONBOARDING_STEPS.find(step => step.id === id);
}
