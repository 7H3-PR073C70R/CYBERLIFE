/**
 * Threat intelligence news and security advisory types for Cyberlife.
 */

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export type NewsCategory =
  'VULNERABILITY' | 'REGIONAL_ALERT' | 'CEDARLINE_INTERNAL' | 'DARK_WEB' | 'DEFENSE_TOOLING';

export interface ThreatNewsArticle {
  readonly id: string;
  readonly title: string;
  readonly category: NewsCategory;
  readonly severity: ThreatSeverity;
  readonly publishedDate: string; // e.g. "Monday, Oct 12, 2026"
  readonly author: string;
  readonly source: string;
  readonly summary: string;
  readonly content: readonly string[];
  readonly cve?: string;
  readonly affectedSystems?: readonly string[];
  readonly iocs?: readonly string[];
  readonly requiredFlag?: string; // Revealed when world flag is true
  readonly minMissionPhase?: string; // Revealed when mission phase reached
  readonly minDay?: number; // Revealed when simulation calendar day >= minDay
}
