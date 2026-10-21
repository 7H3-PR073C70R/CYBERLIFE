/**
 * Cyberlife — Milestone 16: Pure Threat Correlation Engine
 *
 * Correlates observed synthetic traffic events, host metadata, and DNS queries
 * against local fictional threat intelligence records with explainable reasoning.
 *
 * SAFETY INVARIANT:
 * Zero external API requests. Pure deterministic correlation logic.
 */

import { SyntheticTrafficEvent } from '../network/types';
import {
  ThreatIndicatorRecord,
  ThreatCorrelationMatch,
  ThreatSearchQuery,
  CorrelationMatchType,
  MatchStrength,
} from './types';

export function correlateTrafficEventWithThreatIntel(
  event: SyntheticTrafficEvent,
  threatRecords: readonly ThreatIndicatorRecord[]
): readonly ThreatCorrelationMatch[] {
  const matches: ThreatCorrelationMatch[] = [];

  for (const record of threatRecords) {
    let matched = false;
    let matchType: CorrelationMatchType = 'EXACT_IP';
    let matchStrength: MatchStrength = 'STRONG';
    let matchedValue = '';
    let reason = '';

    switch (record.type) {
      case 'IPV4_ADDRESS': {
        const targetIp = record.value.trim();
        if (event.destinationIp === targetIp) {
          matched = true;
          matchType = 'EXACT_IP';
          matchStrength = 'DEFINITIVE';
          matchedValue = event.destinationIp;
          reason = `Destination IP ${event.destinationIp} exactly matches ${record.campaign} indicator (${record.provenance.publisher}).`;
        } else if (event.sourceIp === targetIp) {
          matched = true;
          matchType = 'EXACT_IP';
          matchStrength = 'DEFINITIVE';
          matchedValue = event.sourceIp;
          reason = `Source IP ${event.sourceIp} exactly matches ${record.campaign} indicator (${record.provenance.publisher}).`;
        }
        break;
      }

      case 'DOMAIN_NAME': {
        const targetDomain = record.value.toLowerCase().trim();
        if (event.dns && event.dns.queryName.toLowerCase() === targetDomain) {
          matched = true;
          matchType = 'EXACT_DOMAIN';
          matchStrength = 'DEFINITIVE';
          matchedValue = event.dns.queryName;
          reason = `DNS query name "${event.dns.queryName}" matches known threat domain from ${record.provenance.publisher}.`;
        } else if (event.tls && event.tls.sni.toLowerCase() === targetDomain) {
          matched = true;
          matchType = 'EXACT_DOMAIN';
          matchStrength = 'DEFINITIVE';
          matchedValue = event.tls.sni;
          reason = `TLS Server Name Indication (SNI) "${event.tls.sni}" matches known threat domain.`;
        }
        break;
      }

      case 'REGEX_PATTERN': {
        try {
          const regex = new RegExp(record.value, 'i');
          if (event.dns && regex.test(event.dns.queryName)) {
            matched = true;
            matchType = 'SUBDOMAIN_REGEX';
            matchStrength = 'DEFINITIVE';
            matchedValue = event.dns.queryName;
            reason = `DNS query "${event.dns.queryName}" matches exfiltration regex pattern ${record.value} (${record.description}).`;
          }
        } catch {
          // Invalid regex in record - safely skip
        }
        break;
      }

      case 'JA3_FINGERPRINT': {
        if (event.tls && event.tls.ja3Fingerprint) {
          if (event.tls.ja3Fingerprint.toLowerCase() === record.value.toLowerCase()) {
            matched = true;
            matchType = 'JA3_TLS_FINGERPRINT';
            matchStrength = 'STRONG';
            matchedValue = event.tls.ja3Fingerprint;
            reason = `TLS Client Hello JA3 fingerprint ${event.tls.ja3Fingerprint} matches signature for compromised agent binary.`;
          }
        }
        break;
      }

      case 'SHA256_HASH': {
        if (event.tls && event.tls.certificateFingerprintSha256) {
          if (event.tls.certificateFingerprintSha256.toLowerCase() === record.value.toLowerCase()) {
            matched = true;
            matchType = 'CERTIFICATE_FINGERPRINT';
            matchStrength = 'DEFINITIVE';
            matchedValue = event.tls.certificateFingerprintSha256;
            reason = `TLS Server Certificate SHA-256 fingerprint matches adversary certificate in threat registry.`;
          }
        }
        break;
      }

      default:
        break;
    }

    if (matched) {
      if (record.isKnownBenignAllowlist) {
        reason = `[BENIGN ALLOWLIST] ${record.description} (Internal OpenVAS / SIEM vulnerability scanner). ${reason}`;
      }
      matches.push({
        id: `match-${record.id}-${event.id}`,
        indicatorId: record.id,
        indicatorValue: record.value,
        indicatorType: record.type,
        campaign: record.campaign,
        severity: record.severity,
        confidenceScore: record.confidenceScore,
        matchType,
        matchStrength,
        matchedEventId: event.id,
        matchedHostId: event.sourceHostId === record.relatedHostIds[0] ? event.sourceHostId : event.destinationHostId,
        matchedValue,
        observedTime: event.formattedTime,
        reasonExplanation: reason,
        supportingEvidenceIds: event.associatedEvidenceId ? [event.associatedEvidenceId] : [],
        isFalsePositiveWarning: record.isKnownBenignAllowlist,
      });
    }
  }

  return matches;
}

export function correlateAllTraffic(
  events: readonly SyntheticTrafficEvent[],
  threatRecords: readonly ThreatIndicatorRecord[]
): readonly ThreatCorrelationMatch[] {
  const allMatches: ThreatCorrelationMatch[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    const eventMatches = correlateTrafficEventWithThreatIntel(event, threatRecords);
    for (const match of eventMatches) {
      const key = `${match.indicatorId}::${match.matchedEventId}`;
      if (!seen.has(key)) {
        seen.add(key);
        allMatches.push(match);
      }
    }
  }

  return allMatches;
}

export function searchThreatRecords(
  records: readonly ThreatIndicatorRecord[],
  query?: ThreatSearchQuery
): readonly ThreatIndicatorRecord[] {
  if (!query) return records;

  return records.filter(record => {
    if (query.type && query.type !== 'ALL' && record.type !== query.type) {
      return false;
    }
    if (query.severity && query.severity !== 'ALL' && record.severity !== query.severity) {
      return false;
    }
    if (query.category && query.category !== 'ALL' && record.category !== query.category) {
      return false;
    }
    if (query.status && query.status !== 'ALL' && record.analystStatus !== query.status) {
      return false;
    }
    if (query.minConfidence !== undefined && record.confidenceScore < query.minConfidence) {
      return false;
    }
    if (query.queryText && query.queryText.trim().length > 0) {
      const q = query.queryText.toLowerCase().trim();
      const matchVal = record.value.toLowerCase().includes(q);
      const matchCamp = record.campaign.toLowerCase().includes(q);
      const matchDesc = record.description.toLowerCase().includes(q);
      const matchProv = record.provenance.publisher.toLowerCase().includes(q);
      const matchTag = record.tags.some(t => t.toLowerCase().includes(q));

      if (!matchVal && !matchCamp && !matchDesc && !matchProv && !matchTag) {
        return false;
      }
    }
    return true;
  });
}

export function findIndicatorById(
  records: readonly ThreatIndicatorRecord[],
  id: string
): ThreatIndicatorRecord | undefined {
  return records.find(r => r.id === id);
}

export function correlateThreatIndicator(
  indicator: ThreatIndicatorRecord,
  events: readonly SyntheticTrafficEvent[]
): readonly ThreatCorrelationMatch[] {
  const matches: ThreatCorrelationMatch[] = [];
  for (const event of events) {
    const eventMatches = correlateTrafficEventWithThreatIntel(event, [indicator]);
    matches.push(...eventMatches);
  }
  return matches;
}

