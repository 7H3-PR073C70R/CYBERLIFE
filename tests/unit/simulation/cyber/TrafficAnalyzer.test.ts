/**
 * Cyberlife — Milestone 16: Traffic Analyzer & Query Engine Unit Tests
 *
 * Verifies pure traffic filtering, multi-protocol dissection, search,
 * conversation grouping, and anomaly aggregation.
 */

import { describe, it, expect } from 'vitest';
import {
  filterTrafficEvents,
  searchTrafficEvents,
  getTrafficMetrics,
  findEventById,
  findConversationById,
} from '@/simulation/cyber/network/trafficAnalyzer';
import {
  SYNTHETIC_TRAFFIC_EVENTS,
  SAMPLE_CONVERSATIONS,
} from '@/simulation/cyber/network/trafficFixtures';

describe('Traffic Analyzer & Forensic Query Engine (M16)', () => {
  it('returns all synthetic events when no filter options provided', () => {
    const results = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS);
    expect(results.length).toBe(SYNTHETIC_TRAFFIC_EVENTS.length);
  });

  it('filters traffic events accurately by protocol type', () => {
    const dnsEvents = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { protocol: 'DNS' });
    expect(dnsEvents.length).toBeGreaterThan(0);
    for (const e of dnsEvents) {
      expect(e.protocol).toBe('DNS');
    }

    const smbEvents = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { protocol: 'SMB2' });
    expect(smbEvents.length).toBeGreaterThan(0);
    for (const e of smbEvents) {
      expect(e.protocol).toBe('SMB2');
    }

    const tlsEvents = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { protocol: 'TLS' });
    expect(tlsEvents.length).toBeGreaterThan(0);
    for (const e of tlsEvents) {
      expect(e.protocol).toBe('TLS');
    }
  });

  it('filters traffic events accurately by participating host ID', () => {
    const portalEvents = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { hostId: 'app-portal-01' });
    expect(portalEvents.length).toBeGreaterThan(0);
    for (const e of portalEvents) {
      expect(e.sourceHostId === 'app-portal-01' || e.destinationHostId === 'app-portal-01').toBe(true);
    }
  });

  it('filters traffic events by classification category', () => {
    const benign = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { classification: 'BENIGN_ROUTINE' });
    expect(benign.length).toBeGreaterThan(0);
    for (const e of benign) {
      expect(e.classification).toBe('BENIGN_ROUTINE');
    }

    const beacons = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, { classification: 'SUSPICIOUS_BEACON' });
    expect(beacons.length).toBeGreaterThan(0);
    for (const e of beacons) {
      expect(e.classification).toBe('SUSPICIOUS_BEACON');
    }
  });

  it('searches traffic events across summary text, protocol metadata, and IPs', () => {
    // 1. Search for payroll share
    const payrollMatches = searchTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, 'payroll$');
    expect(payrollMatches.length).toBeGreaterThan(0);
    expect(payrollMatches.some(p => p.summaryInfo.includes('payroll$'))).toBe(true);

    // 2. Search for external C2 IP
    const ipMatches = searchTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, '198.51.100.45');
    expect(ipMatches.length).toBeGreaterThan(0);
    expect(ipMatches.every(p => p.destinationIp === '198.51.100.45' || p.sourceIp === '198.51.100.45')).toBe(true);

    // 3. Search for staged master keys
    const keyMatches = searchTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, 'ekonexus_pipeline_master_keys');
    expect(keyMatches.length).toBeGreaterThan(0);

    // 4. Search for DNS tunneling subdomain pattern
    const dnsTunnelMatches = searchTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, 'stage1.ekonexus-update.net');
    expect(dnsTunnelMatches.length).toBeGreaterThan(0);
    expect(dnsTunnelMatches[0]?.dns?.queryType).toBe('TXT');
  });

  it('handles empty results and query resets gracefully without crashing', () => {
    const emptyResults = searchTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, 'non_existent_protocol_query_99999');
    expect(emptyResults.length).toBe(0);

    // Resetting filter returns full set
    const reset = filterTrafficEvents(emptyResults, { searchQuery: '' });
    expect(reset.length).toBe(0); // input was empty
    const fullReset = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, {});
    expect(fullReset.length).toBe(SYNTHETIC_TRAFFIC_EVENTS.length);
  });

  it('computes aggregated traffic metrics across protocols and security classifications', () => {
    const metrics = getTrafficMetrics(SYNTHETIC_TRAFFIC_EVENTS);
    expect(metrics.totalPackets).toBe(SYNTHETIC_TRAFFIC_EVENTS.length);
    expect(metrics.totalBytes).toBeGreaterThan(1000);
    expect(metrics.protocolDistribution.DNS).toBeGreaterThan(0);
    expect(metrics.protocolDistribution.TCP).toBeGreaterThan(0);
    expect(metrics.protocolDistribution.SMB2).toBeGreaterThan(0);
    expect(metrics.protocolDistribution.TLS).toBeGreaterThan(0);
    expect(metrics.suspiciousCount).toBeGreaterThan(0);
  });

  it('finds events and conversations by identifier', () => {
    const evt = findEventById(SYNTHETIC_TRAFFIC_EVENTS, 'pkt-001');
    expect(evt).toBeDefined();
    expect(evt?.id).toBe('pkt-001');

    const conv = findConversationById(SAMPLE_CONVERSATIONS, 'conv-c2-beacon-tls');
    expect(conv).toBeDefined();
    expect(conv?.protocol).toBe('TLS');
    expect(conv?.serverIp).toBe('198.51.100.45');
  });

  it('contains multi-layer protocol dissection for frame, IP, transport, and application layers', () => {
    for (const pkt of SYNTHETIC_TRAFFIC_EVENTS) {
      expect(pkt.details.frameLayer).toBeDefined();
      expect(pkt.details.ethernetLayer).toBeDefined();
      if (pkt.protocol !== 'ARP') {
        expect(pkt.details.ipLayer).toBeDefined();
      }
      if (['TCP', 'UDP', 'TLS', 'SMB2', 'HTTP'].includes(pkt.protocol)) {
        expect(pkt.details.transportLayer).toBeDefined();
      }
      expect(pkt.hexDump.length).toBeGreaterThan(0);
    }
  });
});
