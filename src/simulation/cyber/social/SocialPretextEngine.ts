/**
 * Cyberlife — Milestone 14: Social Pretexting & Human Security Engine
 *
 * Implements deterministic dialogue branching, trust/credibility/authority/suspicion
 * dynamics, physical badge challenges, out-of-band callbacks, and evidence generation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model. Zero external calls or real manipulation.
 */

import { HumanTrustMetrics } from '../humanPhysical/types';
import {
  PretextDialogueOption,
  PretextEncounterDefinition,
  PretextEncounterOutcome,
  PretextSessionState,
} from './types';
import { SOCIAL_PRETEXT_SCENARIOS } from './fixtures';

export class SocialPretextEngine {
  private scenarios: Map<string, PretextEncounterDefinition>;
  private activeSessions: Map<string, PretextSessionState> = new Map();
  private auditTrail: string[] = [];
  private generatedEvidenceItems: string[] = [];

  constructor(
    initialScenarios: readonly PretextEncounterDefinition[] = SOCIAL_PRETEXT_SCENARIOS
  ) {
    this.scenarios = new Map(initialScenarios.map(s => [s.id, { ...s }]));
  }

  public getAllScenarios(): readonly PretextEncounterDefinition[] {
    return Array.from(this.scenarios.values());
  }

  public getScenario(id: string): PretextEncounterDefinition | undefined {
    return this.scenarios.get(id);
  }

  public getSession(encounterId: string): PretextSessionState | undefined {
    return this.activeSessions.get(encounterId);
  }

  public startEncounter(encounterId: string): PretextSessionState {
    const scenario = this.scenarios.get(encounterId);
    if (!scenario) {
      throw new Error(`Encounter scenario '${encounterId}' was not found.`);
    }

    const state: PretextSessionState = {
      encounterId,
      currentNodeId: scenario.initialNodeId,
      metrics: { ...scenario.initialMetrics },
      history: [
        {
          nodeId: scenario.initialNodeId,
          timestamp: new Date().toISOString(),
        },
      ],
      isCompleted: false,
      auditEvents: [
        `[${new Date().toISOString()}] Encounter started: ${scenario.title} at ${scenario.venueLabel}.`,
      ],
    };

    this.activeSessions.set(encounterId, state);
    return state;
  }

  public selectOption(
    encounterId: string,
    optionId: string
  ): PretextSessionState {
    const session = this.activeSessions.get(encounterId);
    if (!session) {
      throw new Error(`No active session found for encounter '${encounterId}'. Call startEncounter first.`);
    }
    if (session.isCompleted) {
      return session;
    }

    const scenario = this.scenarios.get(encounterId);
    if (!scenario) {
      throw new Error(`Scenario definition '${encounterId}' missing.`);
    }

    const currentNode = scenario.nodes[session.currentNodeId];
    if (!currentNode) {
      throw new Error(`Current dialogue node '${session.currentNodeId}' is invalid.`);
    }

    const option: PretextDialogueOption | undefined = currentNode.options?.find(
      o => o.id === optionId
    );
    if (!option) {
      throw new Error(`Option '${optionId}' is not valid for node '${session.currentNodeId}'.`);
    }

    // 1. Calculate updated metrics with strict invariant bounds
    const updatedMetrics: HumanTrustMetrics = {
      trust: Math.max(-100, Math.min(100, session.metrics.trust + option.trustDelta)),
      credibility: Math.max(0, Math.min(100, session.metrics.credibility + option.credibilityDelta)),
      authority: Math.max(0, Math.min(100, session.metrics.authority + option.authorityDelta)),
      suspicion: Math.max(0, Math.min(100, session.metrics.suspicion + option.suspicionDelta)),
    };

    // 2. Audit logging
    const newAuditEvents = [...session.auditEvents];
    if (option.auditLogMessage) {
      newAuditEvents.push(`[${new Date().toISOString()}] ${option.auditLogMessage}`);
      this.auditTrail.push(option.auditLogMessage);
    }

    // 3. Move to next node
    const nextNode = scenario.nodes[option.nextNodeId];
    if (!nextNode) {
      throw new Error(`Target dialogue node '${option.nextNodeId}' does not exist.`);
    }

    const isCompleted = Boolean(nextNode.isTerminal);
    let finalOutcome: PretextEncounterOutcome | undefined;

    if (isCompleted && nextNode.terminalOutcome) {
      finalOutcome = nextNode.terminalOutcome;
      if (finalOutcome.evidenceGenerated) {
        this.generatedEvidenceItems.push(finalOutcome.evidenceGenerated);
        newAuditEvents.push(
          `[${new Date().toISOString()}] Evidence generated: ${finalOutcome.evidenceGenerated} [${finalOutcome.title}]`
        );
      }
    }

    const updatedSession: PretextSessionState = {
      ...session,
      currentNodeId: option.nextNodeId,
      metrics: updatedMetrics,
      history: [
        ...session.history,
        {
          nodeId: option.nextNodeId,
          chosenOptionId: option.id,
          timestamp: new Date().toISOString(),
        },
      ],
      isCompleted,
      finalOutcome,
      auditEvents: newAuditEvents,
    };

    this.activeSessions.set(encounterId, updatedSession);
    return updatedSession;
  }

  public getGlobalAuditTrail(): readonly string[] {
    return [...this.auditTrail];
  }

  public getGeneratedEvidenceList(): readonly string[] {
    return [...this.generatedEvidenceItems];
  }
}
