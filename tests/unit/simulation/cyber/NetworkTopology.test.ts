/**
 * Cyberlife — Milestone 16: Network Topology Unit Tests
 *
 * Verifies fictional network topology segments, simulated asset nodes,
 * listening service endpoints, and topology links.
 */

import { describe, it, expect } from 'vitest';
import {
  NETWORK_SEGMENTS,
  SIMULATED_NETWORK_NODES,
  NETWORK_TOPOLOGY_LINKS,
  getNodeById,
  getNodesBySegment,
} from '@/simulation/cyber/network/topologyFixtures';

describe('Network Topology & Asset Architecture (M16)', () => {
  it('defines 5 distinct fictional network segments with strict security boundaries', () => {
    expect(NETWORK_SEGMENTS.length).toBe(5);

    const segmentIds = NETWORK_SEGMENTS.map(s => s.id);
    expect(segmentIds).toContain('seg-corp-lan');
    expect(segmentIds).toContain('seg-dmz');
    expect(segmentIds).toContain('seg-mgmt-soc');
    expect(segmentIds).toContain('seg-isolated-lab');
    expect(segmentIds).toContain('seg-external-threat');

    // Verify all IP CIDRs are RFC 1918 private or RFC 5737 documentation-only
    for (const segment of NETWORK_SEGMENTS) {
      expect(segment.cidr).toBeDefined();
      expect(segment.securityZone).toBeDefined();
      expect(segment.gatewayIp).toBeDefined();
      const isRfc1918 = segment.cidr.startsWith('10.') || segment.cidr.startsWith('192.168.') || segment.cidr.startsWith('172.16.');
      const isRfc5737 = segment.cidr.startsWith('198.51.100.');
      expect(isRfc1918 || isRfc5737).toBe(true);
    }
  });

  it('defines realistic asset nodes with valid IP, MAC, services, and investigation relevance', () => {
    expect(SIMULATED_NETWORK_NODES.length).toBeGreaterThanOrEqual(10);

    const hostnames = new Set<string>();
    const ipAddresses = new Set<string>();

    for (const node of SIMULATED_NETWORK_NODES) {
      expect(node.id).toBeDefined();
      expect(node.hostname).toBeDefined();
      expect(node.fqdn).toBeDefined();
      expect(node.ipAddress).toBeDefined();
      expect(node.macAddress).toMatch(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/);
      expect(node.segmentId).toBeDefined();
      expect(node.roleLabel).toBeDefined();
      expect(['CRITICAL_TARGET', 'SUSPICIOUS', 'ROUTINE_BENIGN', 'MONITORING']).toContain(
        node.investigationRelevance
      );

      // Verify unique hostnames and IPs within simulation
      expect(hostnames.has(node.hostname)).toBe(false);
      expect(ipAddresses.has(node.ipAddress)).toBe(false);
      hostnames.add(node.hostname);
      ipAddresses.add(node.ipAddress);
    }
  });

  it('correctly maps DMZ application gateway app-portal-01 with Aster AI service', () => {
    const portal = getNodeById('app-portal-01');
    expect(portal).toBeDefined();
    expect(portal?.hostname).toBe('app-portal-01');
    expect(portal?.ipAddress).toBe('10.0.1.10');
    expect(portal?.segmentId).toBe('seg-dmz');
    expect(portal?.investigationRelevance).toBe('CRITICAL_TARGET');

    const httpService = portal?.services.find(s => s.port === 8080);
    expect(httpService).toBeDefined();
    expect(httpService?.description).toContain('Aster');
  });

  it('catalogues SIEM monitoring scanner mon-siem-01 for false-positive investigation', () => {
    const siem = getNodeById('mon-siem-01');
    expect(siem).toBeDefined();
    expect(siem?.ipAddress).toBe('10.0.99.5');
    expect(siem?.segmentId).toBe('seg-mgmt-soc');
    expect(siem?.investigationRelevance).toBe('MONITORING');
  });

  it('filters nodes by segment accurately', () => {
    const corpNodes = getNodesBySegment('seg-corp-lan');
    expect(corpNodes.length).toBeGreaterThan(0);
    for (const node of corpNodes) {
      expect(node.segmentId).toBe('seg-corp-lan');
    }

    const dmzNodes = getNodesBySegment('seg-dmz');
    expect(dmzNodes.length).toBeGreaterThan(0);
    for (const node of dmzNodes) {
      expect(node.segmentId).toBe('seg-dmz');
    }
  });

  it('defines valid topology links connecting existing nodes', () => {
    expect(NETWORK_TOPOLOGY_LINKS.length).toBeGreaterThanOrEqual(5);

    for (const link of NETWORK_TOPOLOGY_LINKS) {
      const source = getNodeById(link.sourceHostId);
      const target = getNodeById(link.targetHostId);

      expect(source).toBeDefined();
      expect(target).toBeDefined();
      expect(link.label).toBeDefined();
      expect(link.connectionType).toBeDefined();
    }

    // Verify suspicious lateral SMB and C2 egress links exist in topology
    const lateralLink = NETWORK_TOPOLOGY_LINKS.find(l => l.id === 'link-lateral-portal-file');
    expect(lateralLink).toBeDefined();
    expect(lateralLink?.sourceHostId).toBe('app-portal-01');
    expect(lateralLink?.targetHostId).toBe('filesrv-01');

    const c2Link = NETWORK_TOPOLOGY_LINKS.find(l => l.id === 'link-threat-c2-egress');
    expect(c2Link).toBeDefined();
    expect(c2Link?.connectionType).toBe('WAN_EGRESS');
  });
});
