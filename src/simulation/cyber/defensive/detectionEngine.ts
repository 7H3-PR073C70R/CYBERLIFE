/**
 * Cyberlife — Milestone 18: Pure Domain Detection & Prioritization Engine
 *
 * Implements pure functions for:
 * 1. Rule evaluation against synthetic telemetry.
 * 2. Explainable derived priority calculation (Severity + Confidence + Asset Criticality).
 * 3. Alert deduplication and correlation.
 *
 * STRICT SAFETY INVARIANT:
 * Zero side effects · 100% pure domain functions · Deterministic outputs.
 */

import {
  DetectionRule,
  DetectionSeverity,
  DerivedPriority,
  PriorityLevel,
  SecurityAlert,
  TelemetryEvent,
} from './types';

/**
 * Calculates an explainable derived priority score (0-100) and assigns a PriorityLevel (P1-P4).
 * Keeps Severity, Confidence, and Asset Criticality conceptually distinct.
 */
export function calculateDerivedPriority(
  severity: DetectionSeverity,
  confidenceScore: number,
  affectedHostId: string
): DerivedPriority {
  // 1. Severity weight (0 to 40 pts)
  let severityPoints = 10;
  if (severity === 'CRITICAL') severityPoints = 40;
  else if (severity === 'HIGH') severityPoints = 30;
  else if (severity === 'MEDIUM') severityPoints = 20;

  // 2. Confidence weight (0 to 40 pts)
  const clampedConfidence = Math.max(0, Math.min(100, confidenceScore));
  const confidencePoints = Math.round((clampedConfidence / 100) * 40);

  // 3. Asset Criticality weight (0 to 20 pts)
  const tier1Assets = ['app-portal-01', 'dc-core-01', 'gateway-fw-01'];
  const tier2Assets = ['filesrv-01', 'db-cust-01', 'mon-siem-01'];

  let assetPoints = 5;
  let assetTierLabel = 'Standard Workstation (5 pts)';
  if (tier1Assets.some(h => affectedHostId.includes(h))) {
    assetPoints = 20;
    assetTierLabel = 'Perimeter / Core Asset (20 pts)';
  } else if (tier2Assets.some(h => affectedHostId.includes(h))) {
    assetPoints = 14;
    assetTierLabel = 'Departmental Server (14 pts)';
  }

  const totalScore = Math.min(100, severityPoints + confidencePoints + assetPoints);

  let level: PriorityLevel = 'P4_LOW';
  if (totalScore >= 80) {
    level = 'P1_CRITICAL';
  } else if (totalScore >= 60) {
    level = 'P2_HIGH';
  } else if (totalScore >= 40) {
    level = 'P3_MEDIUM';
  }

  const formulaRationale =
    `${level} (Score: ${totalScore}/100) = Severity ${severity} (${severityPoints} pts) + ` +
    `Confidence ${clampedConfidence}% (${confidencePoints} pts) + Asset Criticality [${affectedHostId}] (${assetTierLabel})`;

  return {
    level,
    score: totalScore,
    formulaRationale,
  };
}

/**
 * Evaluates active detection rules against a synthetic telemetry stream.
 * Emits deduplicated security alerts with explainable reasoning.
 */
export function evaluateDetectionRules(
  telemetryEvents: readonly TelemetryEvent[],
  rules: readonly DetectionRule[]
): readonly SecurityAlert[] {
  const alerts: SecurityAlert[] = [];
  const seenDeduplicationKeys = new Set<string>();

  const activeRules = rules.filter(r => r.isEnabled);

  for (const event of telemetryEvents) {
    for (const rule of activeRules) {
      if (rule.category === event.category && rule.evaluateMatch(event)) {
        // Construct stable deduplication key
        const targetKey = event.destinationIp ?? event.sourceHostId;
        const dedupKey = `${rule.id}:${event.sourceHostId}:${targetKey}`;

        if (seenDeduplicationKeys.has(dedupKey)) {
          // Deduplicate: Don't spawn duplicate alert for same rule, source, and target
          continue;
        }
        seenDeduplicationKeys.add(dedupKey);

        const reason = rule.matchExplanation(event) ?? 'Detection rule condition matched telemetry attributes.';
        const priority = calculateDerivedPriority(rule.severity, rule.confidenceScore, event.sourceHostId);

        const alert: SecurityAlert = {
          id: `alt-${String(alerts.length + 1).padStart(3, '0')}`,
          createdAtSimTime: event.simTimestampSeconds,
          formattedTime: event.formattedTime,
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          title: `[${rule.severity}] ${rule.name}`,
          summary: event.summary,
          severity: rule.severity,
          confidenceScore: rule.confidenceScore,
          priority,
          affectedHostId: event.sourceHostId,
          affectedUser: event.auth?.userPrincipal ?? event.process?.user ?? event.privilege?.userPrincipal,
          matchingTelemetryIds: [event.id],
          matchingReason: reason,
          mitreTechniques: rule.mitreTechniques,
          triageStatus: 'NEW',
          deduplicationKey: dedupKey,
          associatedEvidenceId: event.associatedEvidenceId,
        };

        alerts.push(alert);
      }
    }
  }

  return alerts;
}

/**
 * Filter and search helper for synthetic alerts.
 */
export function filterAlerts(
  alerts: readonly SecurityAlert[],
  filters: {
    status?: string | 'ALL';
    severity?: DetectionSeverity | 'ALL';
    priority?: PriorityLevel | 'ALL';
    searchQuery?: string;
  }
): readonly SecurityAlert[] {
  return alerts.filter(alert => {
    if (filters.status && filters.status !== 'ALL' && alert.triageStatus !== filters.status) {
      return false;
    }
    if (filters.severity && filters.severity !== 'ALL' && alert.severity !== filters.severity) {
      return false;
    }
    if (filters.priority && filters.priority !== 'ALL' && alert.priority.level !== filters.priority) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        alert.title.toLowerCase().includes(q) ||
        alert.summary.toLowerCase().includes(q) ||
        alert.affectedHostId.toLowerCase().includes(q) ||
        alert.ruleId.toLowerCase().includes(q) ||
        alert.mitreTechniques.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}
