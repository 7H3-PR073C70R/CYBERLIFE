import { SimulationState } from './types';
import { calculateCalendarTime, DEFAULT_SIMULATION_START_ISO } from '../time/calendar';
import { validateSimulationState } from './invariants';
import { deepFreeze } from './stateUtils';
import { AsterIncidentMissionState } from '../missions/types';
import { createInitialAsterIncidentMissionState } from '../missions/initialMissionState';
import { NpcSimulationState } from '../actors/types';
import { NPC_PROFILES } from '../actors/npcProfiles';
import { CareerState, JobBoardState, SkillId, SkillState, EconomyState } from '../career/types';
import { createInitialSkillState } from '../career/skillDefinitions';
import { DEFAULT_RECURRING_EXPENSES } from '../career/shopDefinitions';
import { OnboardingSimulationState } from '../onboarding/types';
import { CatalogueSimulationState } from '../catalogue/types';
import { createInitialCatalogueState } from '../catalogue/catalogueHandler';
import { NarrativeState } from '../narrative/narrativeTypes';
import { createInitialNarrativeState } from '../narrative/initialNarrativeState';

export interface InitialStateOverrides {
  readonly schemaVersion?: number;
  readonly revision?: number;
  readonly scenarioId?: string;
  readonly simulationTimeSeconds?: number;
  readonly startIso?: string;
  readonly playerId?: string;
  readonly playerName?: string;
  readonly health?: number;
  readonly energy?: number;
  readonly moneyKobo?: number;
  readonly locationId?: string;
  readonly inventorySlots?: ReadonlyArray<{ readonly itemId: string; readonly quantity: number }>;
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
  readonly mission?: AsterIncidentMissionState;
  readonly npcs?: Readonly<Record<string, NpcSimulationState>>;
  readonly career?: CareerState;
  readonly jobs?: JobBoardState;
  readonly skills?: Readonly<Record<SkillId, SkillState>>;
  readonly economy?: EconomyState;
  readonly onboarding?: OnboardingSimulationState;
  readonly catalogue?: CatalogueSimulationState;
  readonly narrative?: NarrativeState;
}

/**
 * Creates the deterministic initial simulation state for Cyberlife.
 * Uses documented defaults for Lagos Island environment.
 */
export function createInitialSimulationState(
  overrides?: InitialStateOverrides
): Readonly<SimulationState> {
  const startIso = overrides?.startIso ?? DEFAULT_SIMULATION_START_ISO;
  const simulationTimeSeconds = overrides?.simulationTimeSeconds ?? 0;
  const calendar = calculateCalendarTime(simulationTimeSeconds, startIso);

  const initialMoneyKobo = overrides?.moneyKobo ?? 250_000; // ₦2,500.00

  const state: SimulationState = {
    metadata: {
      schemaVersion: overrides?.schemaVersion ?? 1,
      revision: overrides?.revision ?? 0,
      scenarioId: overrides?.scenarioId ?? 'lagos_island_intro',
      initializedAtIso: startIso,
    },
    time: {
      simulationTimeSeconds,
      calendar,
    },
    player: {
      id: overrides?.playerId ?? 'player_01',
      name: overrides?.playerName ?? 'Babatunde Vance',
      health: overrides?.health ?? 100,
      energy: overrides?.energy ?? 100,
      moneyKobo: initialMoneyKobo,
      locationId: overrides?.locationId ?? 'neighborhood',
    },
    inventory: {
      slots: overrides?.inventorySlots ?? [
        { itemId: 'item_access_badge', quantity: 1 },
        { itemId: 'item_cedarline_notebook', quantity: 1 },
      ],
    },
    flags: overrides?.flags ?? {
      apartment_door_unlocked: true,
      has_read_community_noticeboard: false,
      mission_aster_active: true,
      mission_aster_phase: 'briefing',
    },
    timers: [],
    nextTimerSequence: 0,
    mission: overrides?.mission ?? createInitialAsterIncidentMissionState(),
    npcs:
      overrides?.npcs ??
      Object.fromEntries(
        NPC_PROFILES.map(profile => [
          profile.id,
          {
            id: profile.id,
            relationship: profile.initialRelationship,
            memory: {
              met: false,
              conversationCount: 0,
              topicsDiscussed: [],
              choicesMade: [],
              sharedFacts: [],
              commitments: [],
            },
          },
        ])
      ),
    career: overrides?.career ?? {
      currentPathId: 'career_sec_analyst',
      currentLevel: 1,
      roleTitle: 'Trainee Analyst',
      employer: 'Cedarline Solutions',
      xp: 0,
      promotionsEarned: 0,
      promotionEligible: false,
    },
    jobs: overrides?.jobs ?? {
      availableJobIds: ['job_cedarline_triage', 'job_marina_port_audit'],
      activeJobs: [],
      completedJobHistory: [],
    },
    skills: overrides?.skills ?? createInitialSkillState(),
    economy: overrides?.economy ?? {
      transactions: [
        {
          id: 'tx_initial_balance',
          type: 'INITIAL_BALANCE',
          amountKobo: initialMoneyKobo,
          direction: 'CREDIT',
          balanceAfterKobo: initialMoneyKobo,
          timestamp: simulationTimeSeconds,
          description: 'Initial relocation stipend & personal savings',
        },
      ],
      recurringExpenses: DEFAULT_RECURRING_EXPENSES.map(e => ({
        ...e,
        nextDueSimulationTime: simulationTimeSeconds + e.intervalSeconds,
      })),
    },
    onboarding: overrides?.onboarding ?? {
      introCompleted: false,
      introSkipped: false,
      completedStepIds: [],
      dismissedHintIds: [],
      guidanceMode: 'guided',
      activeStepId: 'step_intro_welcome',
    },
    catalogue: overrides?.catalogue ?? createInitialCatalogueState(),
    narrative: overrides?.narrative ?? createInitialNarrativeState(),
  };

  validateSimulationState(state);
  return deepFreeze(state);
}
