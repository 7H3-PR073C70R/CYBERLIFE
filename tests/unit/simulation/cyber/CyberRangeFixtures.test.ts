/**
 * Cyberlife — Shared Cyber Range Data Models & Fixtures Tests
 *
 * Validates entity relationships, IP address consistency, synthetic packet structures,
 * cryptographic evidence integrity, and deterministic accessor utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  SHARED_CYBER_RANGE,
  getRangeHost,
  getRangeServicesForHost,
  getRangeSubnet,
  getRangePackets,
  getRangeLogs,
  getRangeIdentities,
} from '@/simulation/cyber/range';

describe('Shared Fictional Cyber Range', () => {
  it('models Cedarline Services organization and business units', () => {
    const org = SHARED_CYBER_RANGE.organization;
    expect(org.id).toBe('org-cedarline');
    expect(org.name).toContain('Cedarline');
    expect(org.headquarters).toContain('Marina Tower');
    expect(org.businessUnits.length).toBeGreaterThanOrEqual(3);

    const buIds = org.businessUnits.map(b => b.id);
    expect(buIds).toContain('bu-secops');
    expect(buIds).toContain('bu-finance');
    expect(buIds).toContain('bu-tech');
  });

  it('defines structured subnets covering corporate LAN, DMZ, and management', () => {
    const subnets = SHARED_CYBER_RANGE.subnets;
    expect(subnets.length).toBeGreaterThanOrEqual(3);

    const corpLan = getRangeSubnet('subnet-corp-lan');
    expect(corpLan).toBeDefined();
    expect(corpLan?.cidr).toBe('10.0.4.0/24');
    expect(corpLan?.gatewayIp).toBe('10.0.4.1');
    expect(corpLan?.vlanId).toBe(40);

    const dmz = getRangeSubnet('subnet-dmz');
    expect(dmz?.cidr).toBe('10.0.1.0/24');

    const mgmt = getRangeSubnet('subnet-mgmt');
    expect(mgmt?.cidr).toBe('10.0.99.0/24');
  });

  it('guarantees referential integrity between hosts and services', () => {
    const hosts = SHARED_CYBER_RANGE.hosts;
    const services = SHARED_CYBER_RANGE.services;

    expect(hosts.length).toBeGreaterThanOrEqual(7);
    expect(services.length).toBeGreaterThanOrEqual(15);

    // Every service must point to a valid host in the range
    const hostIds = new Set(hosts.map(h => h.id));
    for (const svc of services) {
      expect(hostIds.has(svc.hostId)).toBe(true);
      expect(svc.port).toBeGreaterThan(0);
      expect(svc.port).toBeLessThanOrEqual(65535);
      expect(['tcp', 'udp']).toContain(svc.protocol);
    }
  });

  it('resolves hosts by ID, IP, or hostname through accessor', () => {
    const byId = getRangeHost('filesrv-01');
    expect(byId).toBeDefined();
    expect(byId?.ipAddress).toBe('10.0.4.50');

    const byIp = getRangeHost('10.0.4.15');
    expect(byIp?.id).toBe('ws-sec-04');

    const byHostname = getRangeHost('filesrv-01.corp.local');
    expect(byHostname?.id).toBe('filesrv-01');

    const nonExistent = getRangeHost('999.999.999.999');
    expect(nonExistent).toBeUndefined();
  });

  it('filters services accurately for a target host', () => {
    const fileServices = getRangeServicesForHost('filesrv-01');
    expect(fileServices.length).toBeGreaterThanOrEqual(2);
    expect(fileServices.some(s => s.port === 445 && s.product.includes('Samba'))).toBe(true);
    expect(fileServices.some(s => s.serviceName === 'ssh' && s.port === 22)).toBe(true);
  });

  it('contains structured identities with clearance tiers and assigned hosts', () => {
    const identities = getRangeIdentities();
    expect(identities.length).toBeGreaterThanOrEqual(5);

    const analyst = identities.find(i => i.username === 'analyst');
    expect(analyst).toBeDefined();
    expect(analyst?.clearanceTier).toBe(1);
    expect(analyst?.assignedHostId).toBe('ws-sec-04');

    const lead = identities.find(i => i.username === 'chidi.okafor');
    expect(lead?.clearanceTier).toBe(2);

    const serviceAcct = identities.find(i => i.username === 'svc-aster');
    expect(serviceAcct?.isServiceAccount).toBe(true);
  });

  it('provides synthetic packet frames with protocol layers and hex dumps', () => {
    const allPackets = getRangePackets();
    expect(allPackets.length).toBeGreaterThanOrEqual(5);

    // Frame 1 ARP probe
    const arp = allPackets[0]!;
    expect(arp.protocol).toBe('ARP');
    expect(arp.layers.length).toBeGreaterThanOrEqual(2);
    expect(arp.hexDump.length).toBeGreaterThan(0);

    // Frame 3 TCP SYN to port 445
    const tcpSyn = allPackets[2]!;
    expect(tcpSyn.protocol).toBe('TCP');
    expect(tcpSyn.destPort).toBe(445);

    // Filtering by protocol
    const onlySmb = getRangePackets('SMB2');
    expect(onlySmb.length).toBeGreaterThanOrEqual(1);
    expect(onlySmb.every(p => p.protocol === 'SMB2')).toBe(true);
  });

  it('provides structured log events filtered by subsystem and severity', () => {
    const allLogs = getRangeLogs();
    expect(allLogs.length).toBeGreaterThanOrEqual(14);

    const authLogs = getRangeLogs({ source: 'auth' });
    expect(authLogs.every(l => l.source === 'auth')).toBe(true);

    const warnLogs = getRangeLogs({ severity: 'WARN' });
    expect(warnLogs.every(l => l.severity === 'WARN')).toBe(true);
  });

  it('maintains digital evidence objects with verified SHA-256 digests', () => {
    const evidence = SHARED_CYBER_RANGE.evidenceItems;
    expect(evidence.length).toBeGreaterThanOrEqual(3);

    for (const item of evidence) {
      expect(item.id.startsWith('EVD-2026-')).toBe(true);
      expect(item.hashSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(['VERIFIED', 'UNVERIFIED', 'TAMPERED']).toContain(item.integrityStatus);
      expect(item.chainOfCustody.length).toBeGreaterThanOrEqual(1);
    }
  });
});
