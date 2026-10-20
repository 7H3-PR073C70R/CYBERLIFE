/**
 * Cyberlife — Central Cybersecurity Arsenal Registry Automated Tests
 *
 * Verifies registry deduplication, deterministic ordering, multi-axis search/filtering,
 * prerequisite resolution, missing cross-reference detection, and schema validation.
 */

import { describe, it, expect } from 'vitest';
import {
  CyberArsenalRegistry,
  GLOBAL_CYBER_ARSENAL_REGISTRY,
  CyberToolDefinition,
} from '@/simulation/cyber/arsenal';

describe('CyberArsenalRegistry', () => {
  it('instantiates global singleton with all target ecosystem definitions', () => {
    const allTools = GLOBAL_CYBER_ARSENAL_REGISTRY.getAllTools();
    expect(allTools.length).toBeGreaterThanOrEqual(20);

    const ids = allTools.map(t => t.id);
    expect(ids).toContain('tool_netmap');
    expect(ids).toContain('tool_svcscan');
    expect(ids).toContain('tool_packet_lens');
    expect(ids).toContain('tool_logview');
    expect(ids).toContain('tool_incident');
    expect(ids).toContain('tool_evidence');
    expect(ids).toContain('tool_recon_path');
    expect(ids).toContain('tool_rule_tuner');
    expect(ids).toContain('tool_rev_lens');
    expect(ids).toContain('tool_exploit_lab');
    expect(ids).toContain('tool_web_proxy');
    expect(ids).toContain('tool_network_detect');
    expect(ids).toContain('tool_endpoint_telem');
    expect(ids).toContain('tool_sigma_rules');
    expect(ids).toContain('tool_artifact_foren');
    expect(ids).toContain('tool_hash_audit');
    expect(ids).toContain('tool_field_guide');
    expect(ids).toContain('tool_terminal');
    expect(ids).toContain('tool_files');
    expect(ids).toContain('tool_career');
  });

  it('enforces unique tool IDs upon registration', () => {
    const reg = new CyberArsenalRegistry([]);
    const mockTool: CyberToolDefinition = {
      schemaVersion: '1.0.0',
      id: 'tool_test_custom',
      name: 'Test Tool',
      shortName: 'Test',
      icon: '🧪',
      description: 'Test description with sufficient length for validation.',
      extendedOverview: 'Extended overview describing the architecture.',
      category: 'network_discovery',
      categoryLabel: 'Network Discovery',
      primaryTeam: 'shared',
      supportedTeams: ['shared'],
      status: 'playable',
      targetMilestone: 'M13',
      interfaceMode: 'both',
      learningObjectives: [
        {
          id: 'obj_1',
          title: 'Learn Test',
          description: 'Description of test objective',
          bloomsLevel: 'understand',
        },
      ],
      prerequisites: [],
      requiredClearanceTier: 1,
      relatedLearningModules: [],
      relatedExerciseIds: [],
      supportedWorkflows: [],
      inputSchema: {},
      outputEvidenceTypes: ['network_scan_report'],
      syntheticDataSources: ['test'],
      safetyConstraints: ['synthetic_only'],
      relatedToolIds: [],
      realWorldInspiration: 'Mock tool',
      knownLimitations: [],
      completionEvidenceRequired: 'Test report',
    };

    reg.registerTool(mockTool);
    expect(reg.getTool('tool_test_custom')).toBeDefined();

    // Re-registration must throw duplicate ID error
    expect(() => reg.registerTool(mockTool)).toThrow(
      /Duplicate tool ID detected: 'tool_test_custom'/
    );
  });

  it('guarantees deterministic, stable ordering of tools', () => {
    const tools = GLOBAL_CYBER_ARSENAL_REGISTRY.getAllTools();
    const ids = tools.map(t => t.id);
    const sortedIds = [...ids].sort();
    expect(ids).toEqual(sortedIds);
  });

  it('correctly filters tools by team tracks', () => {
    const blueTools = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByTeam('blue');
    expect(blueTools.some(t => t.id === 'tool_logview')).toBe(true);
    expect(blueTools.some(t => t.id === 'tool_incident')).toBe(true);
    expect(blueTools.some(t => t.id === 'tool_evidence')).toBe(true);

    const redTools = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByTeam('red');
    expect(redTools.some(t => t.id === 'tool_recon_path')).toBe(true);
    expect(redTools.some(t => t.id === 'tool_exploit_lab')).toBe(true);

    const purpleTools = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByTeam('purple');
    expect(purpleTools.some(t => t.id === 'tool_rule_tuner')).toBe(true);
    expect(purpleTools.some(t => t.id === 'tool_sigma_rules')).toBe(true);
  });

  it('correctly filters tools by honest capability statuses', () => {
    const playable = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByStatus('playable');
    expect(playable.some(t => t.id === 'tool_netmap')).toBe(true);
    expect(playable.some(t => t.id === 'tool_svcscan')).toBe(true);
    expect(playable.some(t => t.id === 'tool_logview')).toBe(true);
    expect(playable.some(t => t.id === 'tool_evidence')).toBe(true);
    expect(playable.some(t => t.id === 'tool_incident')).toBe(true);
    expect(playable.some(t => t.id === 'tool_terminal')).toBe(true);

    const partial = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByStatus('partial');
    expect(partial.some(t => t.id === 'tool_packet_lens')).toBe(true);
    expect(partial.some(t => t.id === 'tool_rev_lens')).toBe(true);
    expect(partial.some(t => t.id === 'tool_rule_tuner')).toBe(true);

    const refOnly = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByStatus('reference_only');
    expect(refOnly.some(t => t.id === 'tool_osint_graph')).toBe(true);
    expect(refOnly.some(t => t.id === 'tool_attck_matrix')).toBe(true);

    const planned = GLOBAL_CYBER_ARSENAL_REGISTRY.getToolsByStatus('planned');
    expect(planned.some(t => t.id === 'tool_exploit_lab')).toBe(true);
    expect(planned.some(t => t.id === 'tool_web_proxy')).toBe(true);
    expect(planned.some(t => t.id === 'tool_network_detect')).toBe(true);
  });

  it('performs multi-axis search over name, command, inspiration, and objectives', () => {
    // Search by real-world inspiration "Wireshark"
    const wiresharkResults = GLOBAL_CYBER_ARSENAL_REGISTRY.searchTools({
      searchQuery: 'Wireshark',
    });
    expect(wiresharkResults.some(t => t.id === 'tool_packet_lens')).toBe(true);

    // Search by canonical command "netmap"
    const netmapResults = GLOBAL_CYBER_ARSENAL_REGISTRY.searchTools({
      searchQuery: 'netmap',
    });
    expect(netmapResults.some(t => t.id === 'tool_netmap')).toBe(true);

    // Search by category with team filter
    const redRecon = GLOBAL_CYBER_ARSENAL_REGISTRY.searchTools({
      team: 'red',
      category: 'attack_simulation',
    });
    expect(redRecon.some(t => t.id === 'tool_recon_path')).toBe(true);
  });

  it('finds unmet prerequisites for a tool given user completion state', () => {
    const svcscan = GLOBAL_CYBER_ARSENAL_REGISTRY.getTool('tool_svcscan');
    expect(svcscan).toBeDefined();

    // User has completed nothing
    const unmetAll = GLOBAL_CYBER_ARSENAL_REGISTRY.findUnmetPrerequisites('tool_svcscan', []);
    expect(unmetAll).toContain('mod_networking_fundamentals');
    expect(unmetAll).toContain('tool_netmap');

    // User completed networking fundamentals, still missing tool_netmap
    const unmetPartial = GLOBAL_CYBER_ARSENAL_REGISTRY.findUnmetPrerequisites('tool_svcscan', [
      'mod_networking_fundamentals',
    ]);
    expect(unmetPartial).toEqual(['tool_netmap']);

    // User completed both
    const unmetNone = GLOBAL_CYBER_ARSENAL_REGISTRY.findUnmetPrerequisites('tool_svcscan', [
      'mod_networking_fundamentals',
      'tool_netmap',
    ]);
    expect(unmetNone).toEqual([]);
  });

  it('resolves related tool cross-references correctly', () => {
    const relatedToNetmap = GLOBAL_CYBER_ARSENAL_REGISTRY.getRelatedTools('tool_netmap');
    expect(relatedToNetmap.length).toBeGreaterThan(0);
    const relatedIds = relatedToNetmap.map(t => t.id);
    expect(relatedIds).toContain('tool_svcscan');
  });

  it('passes comprehensive registry validation without errors', () => {
    const report = GLOBAL_CYBER_ARSENAL_REGISTRY.validateRegistry();
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.totalTools).toBeGreaterThanOrEqual(20);
  });
});
