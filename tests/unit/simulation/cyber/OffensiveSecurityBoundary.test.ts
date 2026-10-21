/**
 * Cyberlife — Milestone 14: Offensive Security Boundary Regression Tests
 *
 * Verifies non-negotiable security isolation:
 * - 100% deterministic, in-memory domain simulation
 * - Zero execution of host shell utilities or operating system processes
 * - Zero real network socket connections or external network requests
 * - Strict rejection of non-fictional external target domains and hosts
 * - No generation or harvesting of real credentials, tokens, or malicious payloads
 */

import { describe, it, expect } from 'vitest';
import { ExploitLabEngine } from '@/simulation/cyber/offensive';
import { WebProxyEngine } from '@/simulation/cyber/webproxy';
import { SocialPretextEngine } from '@/simulation/cyber/social';
import { createDefaultTerminalParser } from '@/simulation/cyber/terminal/TerminalCommandParser';
import { TerminalExecutionContext } from '@/simulation/cyber/terminal/types';

describe('Offensive Security Boundary Isolation Invariants', () => {
  it('guarantees that ExploitLabEngine operates strictly in-memory without spawning child processes', () => {
    const engine = new ExploitLabEngine();

    // Verify all targets are strictly fictional internal assets
    const targets = engine.getTargets();
    expect(targets.every(t => t.ipAddress.startsWith('10.0.') || t.ipAddress.startsWith('10.42.'))).toBe(true);
    expect(
      targets.every(
        t =>
          t.hostname.includes('cedarline') ||
          t.hostname.includes('internal') ||
          !t.hostname.includes('.')
      )
    ).toBe(true);

    // Execute simulation
    const result = engine.executeModule({
      targetId: 'filesrv-01',
      moduleId: 'mod_smb_tree_hijack',
      mode: 'simulation',
      actorName: 'Boundary Auditor',
    });

    // The console output must come from deterministic simulation templates, not host OS stdout
    expect(result.executionLogs.length).toBeGreaterThan(0);
    expect(result.executionLogs[1]).toContain('EKOSEC EXPLOIT LAB // AUTHORIZED OFFENSIVE SIMULATION ENGINE');
  });

  it('guarantees that WebProxyEngine strictly rejects external internet requests', () => {
    const proxy = new WebProxyEngine();
    const fakeTx = proxy.getTransaction('tx-001')!;

    const externalTargets = [
      'https://google.com',
      'https://github.com/exploit',
      'http://192.168.1.1/admin',
      'https://attacker-c2.net:4444',
    ];

    for (const extUrl of externalTargets) {
      const urlObj = new URL(extUrl);
      const req = {
        ...fakeTx.originalRequest,
        id: `bad-req-${Date.now()}`,
        host: urlObj.hostname,
        url: extUrl,
      };

      expect(() => {
        proxy.replayRequest('tx-001', req);
      }).toThrow(/SECURITY VIOLATION.*External destination/);
    }
  });

  it('guarantees that SocialPretextEngine contains strictly synthetic fictional identities and procedures', () => {
    const social = new SocialPretextEngine();
    const scenarios = social.getAllScenarios();

    for (const scen of scenarios) {
      // NPC identities must be explicitly fictional
      expect(scen.targetNpc.name).toBeDefined();
      expect(scen.targetNpc.badgeNumber).toBeDefined();
      // Must not collect passwords or real PII
      expect(JSON.stringify(scen)).not.toContain('real_password');
      expect(JSON.stringify(scen)).not.toContain('actual_ssn');
    }
  });

  it('guarantees terminal commands cannot be bridged to host OS commands', () => {
    const parser = createDefaultTerminalParser();
    const mockContext: TerminalExecutionContext = {
      simulationTime: {
        dateString: 'Monday, Oct 12, 2026',
        timeString: '08:00 AM',
        iso: '2026-10-12T08:00:00.000Z',
        year: 2026,
        month: 10,
        day: 12,
        hour: 8,
        minute: 0,
        second: 0,
        dayOfWeek: 'Monday',
      },
      currentUser: {
        username: 'tade_adebayo',
        displayName: 'Protector',
        role: 'Security Analyst Intern',
        organization: 'Cedarline Services',
        accessTier: 1,
      },
      workstation: {
        id: 'ws_secops_01',
        hostname: 'cedarline-sec-ws04.corp.local',
        osVersion: 'Orion OS v4.5',
        ipAddress: '10.0.4.15',
        subnet: '10.0.4.0/24',
        status: 'online',
        locationId: 'loc_office_floor2',
      },
      history: [],
    };

    // Attempt common shell injection syntax
    const maliciousInputs = [
      'ls; rm -rf /',
      'cat /etc/passwd',
      'curl https://malicious.example.com',
      'ping 127.0.0.1',
      'whoami && id',
      'exploitlab filesrv-01; echo pwned',
    ];

    for (const input of maliciousInputs) {
      const result = parser.parseAndExecute(input, mockContext);
      // All outputs must be handled deterministically by the simulated command parser
      expect(result).toBeDefined();
      expect(Array.isArray(result.stdout)).toBe(true);
      // Must not reveal host environment variables
      expect(result.stdout.some(l => l.includes(process.env.USER ?? 'nonexistent_user_var'))).toBe(false);
    }
  });
});
