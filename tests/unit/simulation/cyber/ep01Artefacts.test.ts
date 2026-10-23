/**
 * Cyberlife — Episode 01 Cyber Telemetry Artefact Verification
 *
 * Validates:
 * 1. Monotonic timestamps, sequence numbering, IP addresses, and SMB2/TLS payload in EPISODE_01_TRAFFIC_EVENTS.
 * 2. Display filter evaluation: smb2.cmd == 5 && ip.addr == 10.0.4.15 isolates the Tree Connect anomaly frames.
 * 3. Synthetic PCAP binary generation validity (magic headers 0xa1b2c3d4, version 2.4, record frames).
 * 4. CEF SIEM alert schemas (noise, duplicates, suppressed alert, true alert).
 * 5. Sysmon Event ID 1 (Process Create) & Event ID 3 (Network Connect) correlation.
 */

import { describe, it, expect } from 'vitest';
import { EPISODE_01_TRAFFIC_EVENTS } from '../../../../src/simulation/cyber/network/ep01TrafficFixtures';
import { evaluateDisplayFilterExpression } from '../../../../src/simulation/cyber/network/trafficAnalyzer';
import { generateEp01Pcap } from '../../../../src/simulation/cyber/network/pcapBuilder';
import {
  formatCefAlert,
  formatSysmonEvent1,
  formatSysmonEvent3,
} from '../../../../src/simulation/cyber/tools/data/cefLogGenerator';
import { FICTIONAL_LOGS } from '../../../../src/simulation/cyber/tools/data/fictionalLogs';
import { FICTIONAL_HOSTS } from '../../../../src/simulation/cyber/tools/data/fictionalHosts';

describe('Episode 01 Cyber Telemetry Artefacts', () => {
  describe('1. Synthetic Traffic & Display Filter Evaluation', () => {
    it('verifies EPISODE_01_TRAFFIC_EVENTS contains baseline, red herrings, and true anomaly', () => {
      expect(EPISODE_01_TRAFFIC_EVENTS.length).toBeGreaterThanOrEqual(10);

      // Verify strictly ascending sequence numbers
      for (let i = 0; i < EPISODE_01_TRAFFIC_EVENTS.length; i++) {
        expect(EPISODE_01_TRAFFIC_EVENTS[i]!.sequenceNo).toBe(i + 1);
      }

      // Verify chronological timestamps
      for (let i = 1; i < EPISODE_01_TRAFFIC_EVENTS.length; i++) {
        const prevTime = EPISODE_01_TRAFFIC_EVENTS[i - 1]!.simTimestampSeconds;
        const currTime = EPISODE_01_TRAFFIC_EVENTS[i]!.simTimestampSeconds;
        expect(currTime >= prevTime).toBe(true);
      }
    });

    it('filters SMB2 Tree Connect request to \\\\filesrv-01.cedarline.internal\\confidential$', () => {
      const filter = 'smb2.cmd == 5 && ip.addr == 10.0.4.15';
      const matched = EPISODE_01_TRAFFIC_EVENTS.filter((evt) =>
        evaluateDisplayFilterExpression(evt, filter)
      );

      // Wireshark matches both Request and Response involving 10.0.4.15 with command 5
      expect(matched.length).toBe(2);

      const requestFrame = matched.find((f) => f.summaryInfo.includes('Tree Connect Request'));
      expect(requestFrame).toBeDefined();
      expect(requestFrame?.protocol).toBe('SMB2');
      expect(requestFrame?.sourceIp).toBe('10.0.4.15');
      expect(requestFrame?.destinationIp).toBe('10.0.4.20');
      expect(requestFrame?.smb2?.sharePath).toBe('\\\\filesrv-01.cedarline.internal\\confidential$');
      expect(requestFrame?.smb2?.command).toBe('TREE_CONNECT');
    });

    it('verifies embedded outbound TLS handshake to vault-core-01.transit.internal', () => {
      const tlsFrames = EPISODE_01_TRAFFIC_EVENTS.filter(
        (evt) => evt.protocol === 'TLS' || evt.tls?.sni === 'vault-core-01.transit.internal'
      );

      expect(tlsFrames.length).toBeGreaterThanOrEqual(1);
      const nexusFrame = tlsFrames.find(
        (f) => f.tls?.sni === 'vault-core-01.transit.internal'
      );
      expect(nexusFrame).toBeDefined();
      expect(nexusFrame?.destinationIp).toBe('196.220.10.5');
      expect(nexusFrame?.destinationPort).toBe(8443);
      expect(nexusFrame?.summaryInfo).toContain('vault-core-01.transit.internal');
    });

    it('generates a valid binary PCAP with PCAP_MAGIC (0xa1b2c3d4)', () => {
      const pcapBuffer = generateEp01Pcap();
      expect(pcapBuffer.byteLength).toBeGreaterThan(128);

      const view = new DataView(pcapBuffer.buffer, pcapBuffer.byteOffset, pcapBuffer.byteLength);
      // Wireshark microsecond pcap magic: 0xa1b2c3d4
      const magic = view.getUint32(0, false);
      expect(magic).toBe(0xa1b2c3d4);

      // Version 2.4
      const major = view.getUint16(4, false);
      const minor = view.getUint16(6, false);
      expect(major).toBe(2);
      expect(minor).toBe(4);

      // Network link type 1 (Ethernet)
      const network = view.getUint32(20, false);
      expect(network).toBe(1);
    });
  });

  describe('2. CEF SIEM Alerts & Sysmon Records', () => {
    it('generates valid ArcSight / RFC CEF alert strings', () => {
      const cefString = formatCefAlert({
        deviceVendor: 'CedarlineSec',
        deviceProduct: 'mon-siem-01',
        deviceVersion: '2026.4',
        signatureId: 'AUDIT_SMB_ANOMALY',
        name: 'Unauthorized IPC/Tree Connect',
        severity: 7,
        extension: {
          src: '10.0.4.20',
          spt: 51234,
          dst: '10.0.4.15',
          dpt: 445,
          msg: 'Tree connect to confidential$',
        },
      });

      expect(cefString).toContain('CEF:0|CedarlineSec|mon-siem-01|2026.4|AUDIT_SMB_ANOMALY|Unauthorized IPC/Tree Connect|7|');
      expect(cefString).toContain('src=10.0.4.20');
      expect(cefString).toContain('dst=10.0.4.15');
      expect(cefString).toContain('dpt=445');
    });

    it('includes required SIEM noise, duplicate, and suppressed alerts in fictional logs', () => {
      const cefLogs = FICTIONAL_LOGS.filter((log) => log.hostId === 'mon-siem-01');
      expect(cefLogs.length).toBeGreaterThanOrEqual(4);

      // Duplicate alert test
      const duplicateAlert = cefLogs.find((l) => l.id === 'LOG-2026-CEF-03');
      expect(duplicateAlert).toBeDefined();
      expect(duplicateAlert?.message).toContain('Duplicate alert');

      // Noise alert test
      const noiseAlert = cefLogs.find((l) => l.id === 'LOG-2026-CEF-04');
      expect(noiseAlert).toBeDefined();
      expect(noiseAlert?.severity).toBe('INFO');

      // Suppressed alert test
      const suppressedAlert = cefLogs.find((l) => l.id === 'LOG-2026-CEF-SUPPRESSED');
      expect(suppressedAlert).toBeDefined();
      expect(suppressedAlert?.message).toContain('Suppressed from Executive Digest');
    });

    it('correlates Sysmon Event ID 1 (Process Create) and Event ID 3 (Network Connect)', () => {
      const sysmon1 = formatSysmonEvent1({
        utcTime: '2026-10-23T08:14:02.100Z',
        processId: 4412,
        image: 'C:\\Services\\Aster\\aster-agent-worker.exe',
        commandLine: 'aster-agent-worker.exe --pipeline-stage=sync --target=\\\\filesrv-01\\confidential$',
        user: 'CEDARLINE\\svc-aster',
        parentImage: 'C:\\Windows\\System32\\services.exe',
        hashesSha256: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
      });

      expect(sysmon1).toContain('SYSMON EVENT ID: 1');
      expect(sysmon1).toContain('aster-agent-worker.exe');
      expect(sysmon1).toContain('CEDARLINE\\svc-aster');

      const sysmon3 = formatSysmonEvent3({
        utcTime: '2026-10-23T08:14:02.850Z',
        processId: 4412,
        image: 'C:\\Services\\Aster\\aster-agent-worker.exe',
        user: 'CEDARLINE\\svc-aster',
        protocol: 'tcp',
        initiated: true,
        sourceIp: '10.0.4.20',
        sourcePort: 51234,
        destinationIp: '10.0.4.15',
        destinationPort: 445,
        destinationHostname: 'filesrv-01.cedarline.internal',
      });

      expect(sysmon3).toContain('SYSMON EVENT ID: 3');
      expect(sysmon3).toContain('DestinationPort:     445');
      expect(sysmon3).toContain('ProcessId:           4412');
    });

    it('confirms fictional hosts resolve required internal subnets', () => {
      const filesrv = FICTIONAL_HOSTS.find((h) => h.ipAddress === '10.0.4.50' || h.id === 'filesrv-01');
      const wsSec = FICTIONAL_HOSTS.find((h) => h.ipAddress === '10.0.4.15' || h.id === 'ws-sec-04');

      expect(filesrv).toBeDefined();
      expect(wsSec).toBeDefined();
      expect(filesrv?.hostname).toContain('filesrv-01');
      expect(wsSec?.hostname).toContain('cedarline-sec-ws04');
    });
  });
});
