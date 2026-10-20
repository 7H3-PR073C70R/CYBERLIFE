import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '@/simulation';
import { handleCommand } from '@/simulation/commands/commandHandler';
import { SimulationState } from '@/simulation/core/types';
import { getDialogueGraph } from '@/content/dialogue/npcDialogueData';
import { getNpcProfile } from '@/simulation/actors/npcProfiles';

describe('Milestone 7: NPC Integration with The Aster Incident (M6)', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('ensures mission state remains authoritative and separate from NPC dialogue', () => {
    // Mission starts in briefing phase
    expect(state.mission!.phase).toBe('briefing');
    expect(state.mission!.preservedEvidenceIds).toHaveLength(0);

    // Speaking to an NPC does NOT automatically inject technical evidence or solve the mission
    const startResult = handleCommand(state, {
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
    });

    // Evidence count remains 0 — player must use simulated cyber tools (tshark, grep, curl, etc.)
    expect(startResult.state.mission!.preservedEvidenceIds).toHaveLength(0);
  });

  describe('Temitope Blessing (Lead Security Analyst & SOC Mentor)', () => {
    it('provides SOC briefing context without revealing root cause prematurely', () => {
      const graph = getDialogueGraph('npc_amina');
      expect(graph).toBeDefined();

      const rootNode = graph?.nodes['amina_greeting'];
      expect(rootNode?.text).toContain('svc-aster');
      expect(rootNode?.text).toContain('filesrv-01');

      // Amina knows SOC procedures and alert details, but does NOT know the exact root cause yet
      const aminaProfile = getNpcProfile('npc_amina');
      expect(aminaProfile?.knowledgeBoundaries.knownFacts).toContain(
        'Cedarline security policy mandates strict evidence preservation before any remediation.'
      );
      expect(aminaProfile?.knowledgeBoundaries.unknownFacts).toContain(
        'Does not know who authorized the wildcard policy role on svc-aster.'
      );
    });
  });

  describe('Marcus Adebayo (Junior Systems Administrator)', () => {
    it('provides emotional and operational context regarding svc-aster', () => {
      const graph = getDialogueGraph('npc_marcus');
      expect(graph).toBeDefined();

      const marcusProfile = getNpcProfile('npc_marcus');
      expect(marcusProfile?.role).toContain('Administrator');
      expect(marcusProfile?.knowledgeBoundaries.knownFacts).toContain(
        'Personally configured the svc-aster system credentials three weeks ago.'
      );

      // Empathy choice improves rapport and unlocks operational details
      const rootChoices = graph?.nodes['marcus_greeting']?.choices ?? [];
      const empathyChoice = rootChoices.find(c => c.id === 'marcus_empathy');
      const accusatoryChoice = rootChoices.find(c => c.id === 'marcus_accusation');

      expect(empathyChoice).toBeDefined();
      expect(
        empathyChoice?.actions?.some(a => a.type === 'CHANGE_RELATIONSHIP' && a.delta > 0)
      ).toBe(true);

      expect(accusatoryChoice).toBeDefined();
      expect(
        accusatoryChoice?.actions?.some(a => a.type === 'CHANGE_RELATIONSHIP' && a.delta < 0)
      ).toBe(true);
    });

    it('demonstrates consequence: accusatory branch damages relationship while empathetic branch builds trust', () => {
      // 1. Empathetic branch
      const empState = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_marcus',
      }).state;

      const empResult = handleCommand(empState, {
        type: 'SelectDialogueChoice',
        npcId: 'npc_marcus',
        choiceId: 'marcus_empathy',
      });

      expect(empResult.state.npcs!.npc_marcus!.relationship).toBeGreaterThan(
        state.npcs!.npc_marcus!.relationship
      );
      expect(empResult.state.npcs!.npc_marcus!.memory.choicesMade).toContain('marcus_empathy');

      // 2. Accusatory branch
      const accState = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_marcus',
      }).state;

      const accResult = handleCommand(accState, {
        type: 'SelectDialogueChoice',
        npcId: 'npc_marcus',
        choiceId: 'marcus_accusation',
      });

      expect(accResult.state.npcs!.npc_marcus!.relationship).toBeLessThan(
        state.npcs!.npc_marcus!.relationship
      );
    });
  });

  describe('Dr. Elena Chen (Lead AI Engineer)', () => {
    it('explains Aster autonomous tool-calling architecture without fabricating evidence', () => {
      const graph = getDialogueGraph('npc_elena');
      expect(graph).toBeDefined();

      const elenaProfile = getNpcProfile('npc_elena');
      expect(elenaProfile?.knowledgeBoundaries.knownFacts).toContain(
        'Aster was designed to answer internal queries by autonomously calling search and document tools.'
      );
      expect(elenaProfile?.knowledgeBoundaries.unknownFacts).toContain(
        'Did not know svc-aster was provisioned with corporate-admin wildcard access on the OS level.'
      );

      const rootNode = graph?.nodes['elena_greeting'];
      expect(rootNode?.text).toContain('tool calls');
    });
  });

  describe('Femi Martins (VP of Technology)', () => {
    it('reflects high-level business concerns and stakeholder pressure', () => {
      const graph = getDialogueGraph('npc_femi');
      expect(graph).toBeDefined();

      const femiProfile = getNpcProfile('npc_femi');
      expect(femiProfile?.knowledgeBoundaries.knownFacts).toContain(
        'Cedarline faces heavy contractual SLA penalties if services are down or customer data is leaked.'
      );
      expect(femiProfile?.knowledgeBoundaries.unknownFacts).toContain(
        'Does not know low-level networking or specific tool syntax.'
      );
    });
  });

  it('guarantees investigation mechanics cannot be soft-locked by skipping or failing NPC dialogue', () => {
    // Player can proceed through M6 Aster Incident independently of whether they spoke to NPCs:
    // 1. Advance to initial_assessment
    const s1 = handleCommand(state, {
      type: 'AdvanceAsterMissionPhase',
      targetPhase: 'initial_assessment',
    }).state;
    expect(s1.mission!.phase).toBe('initial_assessment');

    // 2. Advance to investigation
    const s2 = handleCommand(s1, {
      type: 'AdvanceAsterMissionPhase',
      targetPhase: 'investigation',
    }).state;
    expect(s2.mission!.phase).toBe('investigation');

    // 3. Advance to evidence_preservation
    const s3 = handleCommand(s2, {
      type: 'AdvanceAsterMissionPhase',
      targetPhase: 'evidence_preservation',
    }).state;
    expect(s3.mission!.phase).toBe('evidence_preservation');

    // 4. Preserve evidence with technical forensic command
    const s4 = handleCommand(s3, {
      type: 'PreserveMissionEvidence',
      evidenceId: 'EVD-2026-004',
      source: 'app-portal-01',
      description: 'IAM Policy snapshot',
      reason: 'Chain of custody',
    }).state;
    expect(s4.mission!.preservedEvidenceIds).toContain('EVD-2026-004');
  });
});
