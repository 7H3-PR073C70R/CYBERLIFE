/**
 * Cyberlife — Tool Execution Contract Automated Tests
 *
 * Verifies safe, deterministic execution of simulated tools against the shared cyber range:
 * - Input schema validation & argument bounds
 * - Clearance tier & Rules of Engagement enforcement
 * - Pure deterministic outputs without host or network side effects
 * - Error handling & non-throwing exception safety
 * - Evidence artifact emission
 */

import { describe, it, expect } from 'vitest';
import {
  GLOBAL_CYBER_ARSENAL_REGISTRY,
  executeToolWorkflow,
  validateToolInput,
  checkToolPrerequisites,
  ToolExecutionContext,
} from '@/simulation/cyber/arsenal';
import { SHARED_CYBER_RANGE } from '@/simulation/cyber/range';

describe('Tool Execution Contract', () => {
  const baseContext: ToolExecutionContext = {
    currentUser: {
      username: 'analyst',
      role: 'Tier 1 Analyst',
      clearanceTier: 1,
      completedPrerequisites: ['mod_networking_fundamentals', 'tool_netmap'],
    },
    range: SHARED_CYBER_RANGE,
    timestamp: '2026-10-12T08:00:00Z',
    roeAccepted: true,
  };

  it('rejects execution when required input arguments are missing', () => {
    const netmap = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_netmap')!;
    const validation = validateToolInput(netmap, {});
    expect(validation.valid).toBe(false);
    expect(validation.error?.code).toBe('INVALID_INPUT');
    expect(validation.error?.message).toMatch(
      /requires at least 1 argument|Missing required parameter/
    );
  });

  it('rejects execution when arguments exceed maxArgs threshold', () => {
    const netmap = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_netmap')!;
    const excessiveParams = {
      target: '10.0.4.0/24',
      p1: 'a',
      p2: 'b',
      p3: 'c',
      p4: 'd',
    };
    const validation = validateToolInput(netmap, excessiveParams);
    expect(validation.valid).toBe(false);
    expect(validation.error?.code).toBe('INVALID_INPUT');
    expect(validation.error?.message).toContain('Too many arguments');
  });

  it('blocks execution when user clearance tier is insufficient', () => {
    const asterAdmin = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_aster_admin')!;
    expect(asterAdmin.requiredClearanceTier).toBe(2);

    const tier1Context: ToolExecutionContext = {
      ...baseContext,
      currentUser: { ...baseContext.currentUser, clearanceTier: 1 },
    };

    const check = checkToolPrerequisites(asterAdmin, tier1Context);
    expect(check.allowed).toBe(false);
    expect(check.error?.code).toBe('INSUFFICIENT_CLEARANCE');
  });

  it('blocks execution when tool is marked partial, reference_only, or planned', () => {
    const packetLens = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_packet_lens')!;
    expect(packetLens.status).toBe('partial');

    const result = executeToolWorkflow(packetLens, 'wf_inspect_pcap', {}, baseContext);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('TOOL_NOT_PLAYABLE');
    expect(result.error?.message).toContain('partial');

    const plannedTool = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_network_detect')!;
    expect(plannedTool.status).toBe('planned');
    const plannedResult = executeToolWorkflow(plannedTool, 'any', {}, baseContext);
    expect(plannedResult.success).toBe(false);
    expect(plannedResult.error?.code).toBe('WORKFLOW_NOT_FOUND');
  });

  it('enforces Rules of Engagement acceptance for offensive simulation tools', () => {
    const reconPath = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_recon_path')!;
    expect(reconPath.safetyConstraints).toContain('roe_enforced');

    const noRoeContext: ToolExecutionContext = {
      ...baseContext,
      roeAccepted: false,
    };

    const check = checkToolPrerequisites(reconPath, noRoeContext);
    expect(check.allowed).toBe(false);
    expect(check.error?.code).toBe('ROE_NOT_ACCEPTED');
  });

  it('executes Netmap ping sweep deterministically over synthetic cyber range', () => {
    const netmap = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_netmap')!;
    const result = executeToolWorkflow(
      netmap,
      'wf_netmap_ping_sweep',
      { target: '10.0.4.0/24' },
      baseContext
    );

    expect(result.success).toBe(true);
    expect(result.toolId).toBe('tool_netmap');
    expect(result.outputLines.some(l => l.includes('10.0.4.15'))).toBe(true);
    expect(result.outputLines.some(l => l.includes('10.0.4.50'))).toBe(true);
    expect(result.structuredData).toBeDefined();

    // Rerunning produces identical deterministic output
    const rerun = executeToolWorkflow(
      netmap,
      'wf_netmap_ping_sweep',
      { target: '10.0.4.0/24' },
      baseContext
    );
    expect(rerun.outputLines).toEqual(result.outputLines);
  });

  it('executes SvcScan service enumeration and identifies open ports', () => {
    const svcscan = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_svcscan')!;
    const result = executeToolWorkflow(
      svcscan,
      'wf_svcscan_host',
      { target: '10.0.4.50' },
      baseContext
    );

    expect(result.success).toBe(true);
    expect(result.outputLines.some(l => l.includes('445/tcp'))).toBe(true);
    expect(result.outputLines.some(l => l.includes('Samba'))).toBe(true);
  });

  it('emits structured evidence items from Evidence Vault tool workflow', () => {
    const evidenceTool = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_evidence')!;
    const evidenceContext: ToolExecutionContext = {
      ...baseContext,
      currentUser: {
        ...baseContext.currentUser,
        completedPrerequisites: [
          'mod_networking_fundamentals',
          'tool_netmap',
          'cat_blue_ir_forensics',
        ],
      },
    };
    const result = executeToolWorkflow(
      evidenceTool,
      'wf_evidence_list',
      { subcommand: 'list' },
      evidenceContext
    );

    expect(result.success).toBe(true);
    expect(result.emittedEvidence).toBeDefined();
    expect(result.emittedEvidence!.length).toBeGreaterThan(0);
    expect(result.emittedEvidence![0]!.id).toBe('EVD-2026-001');
    expect(result.emittedEvidence![0]!.integrityStatus).toBe('VERIFIED');
  });

  it('safely handles unknown workflows without throwing exceptions', () => {
    const netmap = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_netmap')!;
    const result = executeToolWorkflow(netmap, 'non_existent_workflow', {}, baseContext);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('WORKFLOW_NOT_FOUND');
    expect(result.outputLines.length).toBeGreaterThan(0);
  });
});
