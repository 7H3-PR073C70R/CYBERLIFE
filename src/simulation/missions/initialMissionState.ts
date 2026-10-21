/**
 * Cyberlife : Initial State Factory for The Aster Incident Mission
 */

import { AsterIncidentMissionState } from './types';
import {
  ASTER_INCIDENT_GROUND_TRUTH,
  INITIAL_ASTER_SERVICE_STATUS,
  DEFAULT_MISSION_OBJECTIVES,
} from './asterIncidentGroundTruth';

export function createInitialAsterIncidentMissionState(): AsterIncidentMissionState {
  return {
    missionId: ASTER_INCIDENT_GROUND_TRUTH.missionId,
    title: ASTER_INCIDENT_GROUND_TRUTH.title,
    hasStarted: true,
    phase: 'briefing',
    objectives: DEFAULT_MISSION_OBJECTIVES,
    discoveredHosts: [],
    inspectedServices: [],
    analyzedLogIds: [],
    preservedEvidenceIds: [],
    asterService: { ...INITIAL_ASTER_SERVICE_STATUS },
    isContained: false,
    isRemediated: false,
    isVerified: false,
    isCompleted: false,
  };
}
