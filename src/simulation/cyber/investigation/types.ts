/**
 * Cyberlife — Milestone 16: Network Investigation Scenario & State Types
 *
 * Defines the authoritative domain types for the M16 Network Analysis & Threat
 * Intelligence investigation ("Operation Marina Nexus").
 *
 * Preserves player findings, analyst notes, objective progress, and evidence-supported conclusions.
 */

import { ThreatReviewStatus } from '../threatintel/types';

export type InvestigationPhase =
  | 'BRIEFING'
  | 'TOPOLOGY_TRIAGE'
  | 'TRAFFIC_INSPECTION'
  | 'THREAT_CORRELATION'
  | 'EVIDENCE_SYNTHESIS'
  | 'CONCLUSION_SUBMISSION'
  | 'COMPLETED';

export interface InvestigationObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly hint: string;
  readonly isCompleted: boolean;
  readonly completedAtSimTime?: number;
  readonly requiredAction:
    | 'INSPECT_SUSPICIOUS_NODE'
    | 'FILTER_TRAFFIC_BY_PROTOCOL'
    | 'DISSECT_SUSPICIOUS_PACKET'
    | 'CORRELATE_THREAT_INDICATOR'
    | 'IDENTIFY_FALSE_POSITIVE'
    | 'PRESERVE_NETWORK_EVIDENCE'
    | 'SUBMIT_INVESTIGATION_ASSESSMENT';
}

export interface AnalystNote {
  readonly id: string;
  readonly createdAtSimTime: number;
  readonly title: string;
  readonly content: string;
  readonly category: 'TOPOLOGY' | 'TRAFFIC' | 'THREAT_INTEL' | 'HYPOTHESIS';
  readonly linkedHostIds: readonly string[];
  readonly linkedEventIds: readonly string[];
  readonly linkedIndicatorIds: readonly string[];
}

export interface InvestigationConclusionSubmission {
  readonly suspectedActor: string; // e.g. "Phantom Weaver APT"
  readonly compromisedHostId: string; // e.g. "app-portal-01"
  readonly primaryC2Channel: string; // e.g. "TLS on port 8443 to 198.51.100.45"
  readonly exfiltrationMethod: string; // e.g. "High-entropy DNS TXT tunneling & TLS egress"
  readonly falsePositiveRecognized: string; // e.g. "mon-siem-01 vulnerability scanner probe"
  readonly preservedEvidenceIds: readonly string[];
  readonly analystNotes: string;
  readonly submittedAtSimTime: number;
}

export interface InvestigationEvaluationResult {
  readonly isApproved: boolean;
  readonly scorePercentage: number; // 0 to 100
  readonly feedbackSummary: string;
  readonly correctActor: boolean;
  readonly correctCompromisedHost: boolean;
  readonly correctC2Channel: boolean;
  readonly correctExfiltrationMethod: boolean;
  readonly correctFalsePositiveIdentification: boolean;
  readonly evidenceCompletenessScore: number;
  readonly missingEvidenceIds: readonly string[];
}

export interface NetworkInvestigationState {
  readonly scenarioId: string;
  readonly title: string;
  readonly activePhase: InvestigationPhase;
  readonly objectives: readonly InvestigationObjective[];
  readonly inspectedHostIds: readonly string[];
  readonly inspectedEventIds: readonly string[];
  readonly correlatedIndicatorIds: readonly string[];
  readonly collectedEvidenceIds: readonly string[];
  readonly indicatorReviews: Readonly<Record<string, ThreatReviewStatus>>;
  readonly analystNotes: readonly AnalystNote[];
  readonly activeFilterPreset?: string;
  readonly selectedHostId?: string;
  readonly selectedEventId?: string;
  readonly selectedIndicatorId?: string;
  readonly conclusionSubmission?: InvestigationConclusionSubmission;
  readonly evaluationResult?: InvestigationEvaluationResult;
}
