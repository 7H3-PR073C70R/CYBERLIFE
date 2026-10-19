import { describe, it, expect } from 'vitest';
import {
  SIMULATED_TOOLS,
  getToolsByCategory,
  getToolsByTrack,
  getToolsByStatus,
  findToolByCommandOrAlias,
  findToolByLinkedAppId,
} from '@/simulation/cyber/tools/SimulatedToolRegistry';

describe('SimulatedToolRegistry (EkoSec Cybersecurity Arsenal)', () => {
  it('contains comprehensive suite of 14 categorized security tools', () => {
    expect(SIMULATED_TOOLS.length).toBe(14);

    const ids = SIMULATED_TOOLS.map(t => t.id);
    expect(ids).toContain('tool_netmap');
    expect(ids).toContain('tool_svcscan');
    expect(ids).toContain('tool_packet_lens');
    expect(ids).toContain('tool_logview');
    expect(ids).toContain('tool_incident_portal');
    expect(ids).toContain('tool_recon_path');
    expect(ids).toContain('tool_rule_tuner');
    expect(ids).toContain('tool_rev_lens');
    expect(ids).toContain('tool_evidence');
    expect(ids).toContain('tool_file_manager');
    expect(ids).toContain('tool_terminal');
    expect(ids).toContain('tool_career');
  });

  it('enforces honest implementation status badges across all entries', () => {
    const validStatuses = ['playable', 'partial', 'reference_only', 'planned'];
    for (const tool of SIMULATED_TOOLS) {
      expect(validStatuses).toContain(tool.status);
      expect(typeof tool.statusBadge).toBe('string');
      expect(tool.statusBadge.length).toBeGreaterThan(0);
      expect(tool.beginnerExplanation.length).toBeGreaterThan(15);
      expect(tool.description.length).toBeGreaterThan(15);
    }

    const playable = getToolsByStatus('playable');
    expect(playable.length).toBeGreaterThanOrEqual(8);
  });

  it('supports Blue, Red, Purple, and Shared team tracks', () => {
    const blueTools = getToolsByTrack('blue');
    expect(blueTools.some(t => t.id === 'tool_logview')).toBe(true);
    expect(blueTools.some(t => t.id === 'tool_packet_lens')).toBe(true);

    const redTools = getToolsByTrack('red');
    expect(redTools.some(t => t.id === 'tool_recon_path')).toBe(true);
    expect(redTools.some(t => t.id === 'tool_svcscan')).toBe(true);

    const purpleTools = getToolsByTrack('purple');
    expect(purpleTools.some(t => t.id === 'tool_rule_tuner')).toBe(true);

    const sharedTools = getToolsByTrack('shared');
    expect(sharedTools.some(t => t.id === 'tool_terminal')).toBe(true);
    expect(sharedTools.some(t => t.id === 'tool_file_manager')).toBe(true);
  });

  it('filters tools by category correctly', () => {
    const infoGathering = getToolsByCategory('info_gathering');
    expect(infoGathering.some(t => t.id === 'tool_netmap')).toBe(true);

    const forensics = getToolsByCategory('digital_forensics');
    expect(forensics.some(t => t.id === 'tool_evidence')).toBe(true);

    const rev = getToolsByCategory('reverse_engineering');
    expect(rev.some(t => t.id === 'tool_rev_lens')).toBe(true);
  });

  it('resolves tools by canonical commands and aliases', () => {
    const netmap = findToolByCommandOrAlias('netmap');
    expect(netmap?.id).toBe('tool_netmap');

    const nmapAlias = findToolByCommandOrAlias('nmap');
    expect(nmapAlias?.id).toBe('tool_netmap');

    const wiresharkAlias = findToolByCommandOrAlias('wireshark');
    expect(wiresharkAlias?.id).toBe('tool_packet_lens');

    const ghidraAlias = findToolByCommandOrAlias('ghidra');
    expect(ghidraAlias?.id).toBe('tool_rev_lens');
  });

  it('resolves tools by linked desktop AppId', () => {
    const packetApp = findToolByLinkedAppId('packetLens');
    expect(packetApp?.shortName).toBe('Packet Lens');

    const filesApp = findToolByLinkedAppId('files');
    expect(filesApp?.shortName).toBe('Files');

    const tunerApp = findToolByLinkedAppId('ruleTuner');
    expect(tunerApp?.shortName).toBe('SIEM Tuner');
  });
});
