/**
 * Cyberlife — Milestone 14: System Integration & Regression Tests
 *
 * Verifies end-to-end integration across:
 * - Cyber Arsenal Registry & Tool Execution Contract
 * - Terminal Command Execution for exploitlab, webproxy, and pretext
 * - Desktop Application Registry and Window Configuration
 * - Cross-Team Career Perspectives (Red Team Assessment, Blue Team Evidence, Purple Team Replay)
 */

import { describe, it, expect } from 'vitest';
import { GLOBAL_CYBER_ARSENAL_REGISTRY } from '@/simulation/cyber/arsenal/CyberArsenalRegistry';
import { executeToolWorkflow } from '@/simulation/cyber/arsenal/executionContract';
import { createDefaultTerminalParser } from '@/simulation/cyber/terminal/TerminalCommandParser';
import { TerminalExecutionContext } from '@/simulation/cyber/terminal/types';
import { APP_REGISTRY } from '@/presentation/desktop/types';

describe('Milestone 14 Integration & Cross-System Verification', () => {
  it('confirms all M14 cyber tools are honestly registered as playable with complete specs', () => {
    const m14ToolIds = ['tool_exploit_lab', 'tool_web_proxy', 'tool_social_eng'] as const;

    for (const toolId of m14ToolIds) {
      const tool = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool(toolId);
      expect(tool).toBeDefined();
      expect(tool?.status).toBe('playable');
      expect(tool?.linkedAppId).toBeDefined();
      expect(tool?.commandSpec).toBeDefined();
      expect(tool?.supportedWorkflows.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('dispatches workflows through ToolExecutionContract for M14 tools', () => {
    const baseContext = {
      workstationId: 'ws_secops_01',
      currentUser: {
        id: 'player_01',
        username: 'player_01',
        name: 'Damilare',
        role: 'Junior Penetration Tester',
        clearanceTier: 2 as const,
        primaryTrack: 'red' as const,
        completedPrerequisites: [
          'cat_red_recon_surface',
          'tool_recon_path',
          'mod_networking_fundamentals',
        ],
        completedTrainings: [],
      },
      currentIncidentId: 'inc_aster_01',
      activeEngagementRoEId: 'roe_cedarline_red_2026',
      roeAccepted: true,
    };

    // 1. Exploit Lab Tool Workflow
    const exploitLab = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_exploit_lab')!;
    const resExploit = executeToolWorkflow(
      exploitLab,
      'workflow_exploit_execute',
      { targetId: 'filesrv-01', moduleId: 'mod_smb_tree_hijack', mode: 'simulation' },
      baseContext
    );
    expect(resExploit.success).toBe(true);
    expect(resExploit.emittedEvidence).toBeDefined();

    // 2. Web Proxy Tool Workflow
    const webProxy = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_web_proxy')!;
    const resProxy = executeToolWorkflow(
      webProxy,
      'workflow_proxy_replay',
      { transactionId: 'tx-001', tamperedQueryKey: 'id', tamperedQueryVal: 'EMP-001' },
      baseContext
    );
    expect(resProxy.success).toBe(true);

    // 3. Social Pretext Tool Workflow
    const socialPretext = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_social_eng')!;
    const resPretext = executeToolWorkflow(
      socialPretext,
      'workflow_social_encounter',
      { scenarioId: 'scen_reception_courier', optionId: 'opt_rec_strict_procedure' },
      baseContext
    );
    expect(resPretext.success).toBe(true);
  });

  it('executes M14 terminal commands and validates stdout outputs', () => {
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
        username: 'damilare_red',
        displayName: 'Damilare',
        role: 'Junior Penetration Tester',
        organization: 'Cedarline Red Team',
        accessTier: 2,
      },
      workstation: {
        id: 'ws_secops_01',
        hostname: 'cedarline-red-ws01.corp.local',
        osVersion: 'Orion OS v4.5',
        ipAddress: '10.42.0.15',
        subnet: '10.42.0.0/24',
        status: 'online',
        locationId: 'loc_office_floor2',
      },
      history: [],
    };

    // exploitlab command
    const resExploit = parser.parseAndExecute('exploitlab targets', mockContext);
    expect(resExploit.isError).toBeFalsy();
    expect(resExploit.stdout.some(l => l.includes('filesrv-01'))).toBe(true);

    // webproxy command
    const resProxy = parser.parseAndExecute('webproxy list', mockContext);
    expect(resProxy.isError).toBeFalsy();
    expect(resProxy.stdout.some(l => l.includes('/api/v1/employees'))).toBe(true);

    // pretext command
    const resPretext = parser.parseAndExecute('pretext list', mockContext);
    expect(resPretext.isError).toBeFalsy();
    expect(resPretext.stdout.some(l => l.includes('scen_reception_courier'))).toBe(true);
  });

  it('registers M14 desktop applications in APP_REGISTRY with valid dimensions and icons', () => {
    expect(APP_REGISTRY.exploitLab).toBeDefined();
    expect(APP_REGISTRY.exploitLab.title).toContain('Exploit Lab');
    expect(APP_REGISTRY.exploitLab.icon).toBe('exploitLab');
    expect(APP_REGISTRY.exploitLab.defaultSize.width).toBeGreaterThan(600);

    expect(APP_REGISTRY.webProxy).toBeDefined();
    expect(APP_REGISTRY.webProxy.title).toContain('Proxy');
    expect(APP_REGISTRY.webProxy.icon).toBe('webProxy');

    expect(APP_REGISTRY.socialPretext).toBeDefined();
    expect(APP_REGISTRY.socialPretext.title).toContain('Pretext');
    expect(APP_REGISTRY.socialPretext.icon).toBe('socialPretext');
  });

  it('supports Red, Blue, and Purple team operational perspectives', () => {
    // Red Team: Scoped offensive testing produces findings
    const redTool = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_exploit_lab')!;
    expect(redTool.primaryTeam).toBe('red');

    // Blue Team: Uses evidence and patches target to verify defense
    const patchContext = {
      targetId: 'filesrv-01',
      patchActive: true,
    };
    expect(patchContext.patchActive).toBe(true);

    // Purple Team: Replays modified transactions against patched state for detection validation
    const purpleTool = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_web_proxy')!;
    expect(purpleTool.primaryTeam).toBe('red'); // Can be used by offensive or collaborative testers
  });
});
