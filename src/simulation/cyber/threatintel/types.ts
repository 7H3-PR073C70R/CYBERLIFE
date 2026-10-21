/**
 * Cyberlife — Milestone 16: Threat Intelligence Domain Types
 *
 * Defines the authoritative domain types for fictional threat intelligence indicators (IOCs),
 * adversary campaigns, provenance feeds, correlation matches, and analyst verification.
 *
 * STRICT SAFETY INVARIANT:
 * Zero real-world threat feeds · Zero external network lookups · Purely synthetic IOC models.
 */

export type ThreatIndicatorType =
  | 'IPV4_ADDRESS'
  | 'DOMAIN_NAME'
  | 'SHA256_HASH'
  | 'URL'
  | 'JA3_FINGERPRINT'
  | 'REGEX_PATTERN'
  | 'CERTIFICATE_FINGERPRINT';

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IndicatorCategory =
  | 'C2_INFRASTRUCTURE'
  | 'EXFILTRATION_DROP'
  | 'BEACON_CONTROLLER'
  | 'MALICIOUS_DOWNLOAD'
  | 'DNS_TUNNEL_ENDPOINT'
  | 'CREDENTIAL_STAGING'
  | 'BENIGN_TELEMETRY_ALLOWLIST'
  | 'INTERNAL_SECURITY_SCANNER';

export type ThreatReviewStatus =
  | 'UNREVIEWED'
  | 'UNDER_INVESTIGATION'
  | 'CONFIRMED_THREAT'
  | 'FALSE_POSITIVE_BENIGN'
  | 'INCONCLUSIVE';

export interface ThreatProvenance {
  readonly feedName: string;
  readonly feedId: string;
  readonly publisher: string; // e.g. "NDSRC National Advisory", "Krest Incident Response Bulletin", "0xLagos Pastebin"
  readonly publishedDate: string;
  readonly reportReference: string;
  readonly fictionalContext: string;
}

export interface ThreatIndicatorRecord {
  readonly id: string;
  readonly type: ThreatIndicatorType;
  readonly value: string;
  readonly campaign: string;
  readonly threatActor: string;
  readonly category: IndicatorCategory;
  readonly severity: ThreatSeverity;
  readonly confidenceScore: number; // 0 to 100
  readonly description: string;
  readonly technicalContext: string;
  readonly provenance: ThreatProvenance;
  readonly firstSeenIso: string;
  readonly lastSeenIso: string;
  readonly mitreTechniques: readonly string[];
  readonly tags: readonly string[];
  readonly relatedHostIds: readonly string[];
  readonly relatedIndicatorIds: readonly string[];
  readonly isKnownBenignAllowlist: boolean;
  readonly analystStatus: ThreatReviewStatus;
  readonly analystNotes?: string;
  readonly reviewedAtSimTime?: number;
}

export type CorrelationMatchType =
  | 'EXACT_IP'
  | 'EXACT_DOMAIN'
  | 'SUBDOMAIN_REGEX'
  | 'JA3_TLS_FINGERPRINT'
  | 'HASH_SHA256'
  | 'URI_PATH'
  | 'CERTIFICATE_FINGERPRINT';

export type MatchStrength = 'DEFINITIVE' | 'STRONG' | 'INFERENTIAL' | 'HEURISTIC';

export interface ThreatCorrelationMatch {
  readonly id: string;
  readonly indicatorId: string;
  readonly indicatorValue: string;
  readonly indicatorType: ThreatIndicatorType;
  readonly campaign: string;
  readonly severity: ThreatSeverity;
  readonly confidenceScore: number;
  readonly matchType: CorrelationMatchType;
  readonly matchStrength: MatchStrength;
  readonly matchedEventId: string;
  readonly matchedHostId: string;
  readonly matchedValue: string;
  readonly observedTime: string;
  readonly reasonExplanation: string;
  readonly supportingEvidenceIds: readonly string[];
  readonly isFalsePositiveWarning: boolean;
}

export interface ThreatSearchQuery {
  readonly queryText?: string;
  readonly type?: ThreatIndicatorType | 'ALL';
  readonly severity?: ThreatSeverity | 'ALL';
  readonly category?: IndicatorCategory | 'ALL';
  readonly campaign?: string | 'ALL';
  readonly status?: ThreatReviewStatus | 'ALL';
  readonly minConfidence?: number;
}
