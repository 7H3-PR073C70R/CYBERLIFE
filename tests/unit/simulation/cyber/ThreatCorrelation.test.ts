/**
 * Cyberlife — Milestone 16: Threat Intelligence & Correlation Engine Unit Tests
 *
 * Verifies local threat intelligence record search, exact/regex matching,
 * JA3 TLS correlation, benign scanner allowlisting, and false-positive distinction.
 */

import { describe, it, expect } from 'vitest';
import {
  correlateThreatIndicator,
  correlateAllTraffic,
  searchThreatRecords,
  findIndicatorById,
} from '@/simulation/cyber/threatintel/threatCorrelationEngine';
import {
  THREAT_INTEL_RECORDS,
  SIEM_ALLOWLIST_RECORD,
} from '@/simulation/cyber/threatintel/threatIntelFixtures';
import { SYNTHETIC_TRAFFIC_EVENTS } from '@/simulation/cyber/network/trafficFixtures';

describe('Threat Intelligence & Correlation Engine (M16)', () => {
  it('loads 7 local fictional threat intelligence records with distinct severity and confidence', () => {
    expect(THREAT_INTEL_RECORDS.length).toBe(7);

    for (const record of THREAT_INTEL_RECORDS) {
      expect(record.id).toBeDefined();
      expect(record.type).toBeDefined();
      expect(record.value).toBeDefined();
      expect(record.severity).toBeDefined();
      expect(record.confidenceScore).toBeGreaterThanOrEqual(50);
      expect(record.confidenceScore).toBeLessThanOrEqual(100);
      expect(record.provenance.publisher).toBeDefined();
      expect(record.provenance.reportReference).toBeDefined();
    }
  });

  it('searches threat intelligence records by text, type, and severity', () => {
    const phantom = searchThreatRecords(THREAT_INTEL_RECORDS, { queryText: 'Phantom Weaver' });
    expect(phantom.length).toBeGreaterThanOrEqual(4);

    const critical = searchThreatRecords(THREAT_INTEL_RECORDS, { severity: 'CRITICAL' });
    expect(critical.length).toBeGreaterThan(0);
    expect(critical.every(r => r.severity === 'CRITICAL')).toBe(true);

    const regexRecords = searchThreatRecords(THREAT_INTEL_RECORDS, { type: 'REGEX_PATTERN' });
    expect(regexRecords.length).toBe(1);
    expect(regexRecords[0]?.category).toBe('DNS_TUNNEL_ENDPOINT');
  });

  it('correlates C2 IP address 198.51.100.45 with traffic events and explains reasoning', () => {
    const c2Record = findIndicatorById(THREAT_INTEL_RECORDS, 'ioc-ip-c2-phantom');
    expect(c2Record).toBeDefined();

    const matches = correlateThreatIndicator(c2Record!, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBeGreaterThan(0);

    const match = matches[0]!;
    expect(match.matchType).toBe('EXACT_IP');
    expect(match.matchStrength).toBe('DEFINITIVE');
    expect(match.matchedValue).toBe('198.51.100.45');
    expect(match.severity).toBe('CRITICAL');
    expect(match.isFalsePositiveWarning).toBe(false);
    expect(match.reasonExplanation).toContain('Phantom Weaver');
  });

  it('correlates TLS SNI domain telemetry-sync.ekonexus-update.net with C2 beaconing', () => {
    const domainRecord = findIndicatorById(THREAT_INTEL_RECORDS, 'ioc-domain-c2-phantom');
    expect(domainRecord).toBeDefined();

    const matches = correlateThreatIndicator(domainRecord!, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBeGreaterThan(0);

    const match = matches[0]!;
    expect(match.matchType).toBe('EXACT_DOMAIN');
    expect(match.matchedValue).toBe('telemetry-sync.ekonexus-update.net');
    expect(match.campaign).toContain('Phantom Weaver');
  });

  it('correlates high-entropy DNS tunneling queries via regex pattern', () => {
    const regexRecord = findIndicatorById(THREAT_INTEL_RECORDS, 'ioc-regex-dns-tunnel');
    expect(regexRecord).toBeDefined();

    const matches = correlateThreatIndicator(regexRecord!, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBeGreaterThan(0);

    const match = matches[0]!;
    expect(match.matchType).toBe('SUBDOMAIN_REGEX');
    expect(match.matchStrength).toBe('DEFINITIVE');
    expect(match.reasonExplanation).toContain('DNS query');
  });

  it('correlates JA3 TLS client fingerprint to identify custom malware implant', () => {
    const ja3Record = findIndicatorById(THREAT_INTEL_RECORDS, 'ioc-ja3-c2-phantom');
    expect(ja3Record).toBeDefined();

    const matches = correlateThreatIndicator(ja3Record!, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBeGreaterThan(0);

    const match = matches[0]!;
    expect(match.matchType).toBe('JA3_TLS_FINGERPRINT');
    expect(match.matchedValue).toBe('72a589dc249d32b8529e8c46fb8869c9');
  });

  it('flags benign SIEM scanner 10.0.99.5 as an allowlisted false-positive warning', () => {
    const matches = correlateThreatIndicator(SIEM_ALLOWLIST_RECORD, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBeGreaterThan(0);

    const match = matches[0]!;
    expect(match.isFalsePositiveWarning).toBe(true);
    expect(match.reasonExplanation).toContain('BENIGN ALLOWLIST');
    expect(match.reasonExplanation).toContain('Internal OpenVAS / SIEM vulnerability scanner');
  });

  it('correctly reports ZERO traffic matches for uncorrelated distractor indicator', () => {
    const distractor = findIndicatorById(THREAT_INTEL_RECORDS, 'ioc-distractor-phish-ip');
    expect(distractor).toBeDefined();

    const matches = correlateThreatIndicator(distractor!, SYNTHETIC_TRAFFIC_EVENTS);
    expect(matches.length).toBe(0);
  });

  it('correlates all traffic stream events across all threat intelligence indicators', () => {
    const allMatches = correlateAllTraffic(SYNTHETIC_TRAFFIC_EVENTS, THREAT_INTEL_RECORDS);
    expect(allMatches.length).toBeGreaterThanOrEqual(4);

    // Verify both malicious matches and false positive scanner warning are present
    const hasMalicious = allMatches.some(m => !m.isFalsePositiveWarning && m.severity === 'CRITICAL');
    const hasAllowlistWarning = allMatches.some(m => m.isFalsePositiveWarning);

    expect(hasMalicious).toBe(true);
    expect(hasAllowlistWarning).toBe(true);
  });
});
