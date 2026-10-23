import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';

describe('Milestone 14 — Playable Narrative Story Slice: The Aster Anomaly', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('executes a cohesive, verifiable end-to-end story slice connecting technical artifacts, dialogue, and faction consequences', () => {
    // ------------------------------------------------------------------------
    // Step 1: Initial Narrative State Verification
    // ------------------------------------------------------------------------
    let state = engine.getState();
    expect(state.narrative).toBeDefined();
    expect(state.narrative!.activeArcId).toBe('arc_aster_incident');
    expect(state.narrative!.activeChapterId).toBe('ch_triage_broad_street');
    expect(state.narrative!.factions['faction_cedarline']?.standing).toBe(10);
    expect(state.narrative!.factions['faction_cedarline']?.band).toBe('NEUTRAL');

    const initialMoney = state.player.moneyKobo;

    // ------------------------------------------------------------------------
    // Step 2: Dialogue with Mentor Blessing
    // ------------------------------------------------------------------------
    const startAminaDiag = engine.dispatch({
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
    });
    expect(startAminaDiag.success).toBe(true);
    expect(engine.getState().activeDialogue?.currentNodeId).toBe('amina_greeting');

    // Select procedural priority choice
    const chooseAminaPriority = engine.dispatch({
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_greet_procedure',
    });
    expect(chooseAminaPriority.success).toBe(true);
    state = engine.getState();

    // Blessing's relationship increases, memory is recorded
    const aminaNpc = state.npcs!['npc_amina']!;
    expect(aminaNpc.relationship).toBe(25); // Initial 20 + 5
    expect(aminaNpc.memory.topicsDiscussed).toContain('incident_priorities');

    // ------------------------------------------------------------------------
    // Step 3: Technical Triage & Evidence Preservation in Evidence Vault
    // ------------------------------------------------------------------------
    // Discover subnet hosts
    engine.dispatch({
      type: 'RecordMissionFinding',
      findingType: 'host',
      targetId: 'app-portal-01',
      summary: 'Aster AI Core Host',
    });

    engine.dispatch({
      type: 'RecordMissionFinding',
      findingType: 'log',
      targetId: 'LOG-2026-103B',
      summary: 'Anomalous SMB query from svc-aster',
    });

    // Preserve first forensic evidence in Vault
    const preserveEv1 = engine.dispatch({
      type: 'RecordInvestigativeEvidence',
      evidenceId: 'EVD-2026-001',
      source: 'app-portal-01',
      title: 'Aster Core Configuration Snapshot',
      description: 'Corporate admin wildcard policy granted to svc-aster',
      hash: 'sha256-evd001-e3b0c44298fc1c149afbf4c8996fb924',
      tags: ['config', 'iam_policy'],
    });
    expect(preserveEv1.success).toBe(true);

    const preserveEv2 = engine.dispatch({
      type: 'RecordInvestigativeEvidence',
      evidenceId: 'EVD-2026-002',
      source: 'filesrv-01',
      title: 'Payroll File Share Access Audit',
      description: 'Audit trace of unauthorized query for payroll_q3_confidential.xlsx',
      hash: 'sha256-evd002-8f4b23a109fc',
      tags: ['smb_log', 'access_audit'],
    });
    expect(preserveEv2.success).toBe(true);

    // Complete triage mission
    const completeTriage = engine.dispatch({
      type: 'CompleteNarrativeMission',
      missionId: 'miss_triage_alert',
    });
    expect(completeTriage.success).toBe(true);
    state = engine.getState();

    // Money credited: ₦1,000.00 (100,000 kobo)
    expect(state.player.moneyKobo).toBe(initialMoney + 100_000);

    // Cedarline standing increases from 10 + 5 (Blessing dialog) + 5 (Triage mission) = 20 -> Band shifts to FAVORED!
    const cedarlineFaction = state.narrative!.factions['faction_cedarline']!;
    expect(cedarlineFaction.standing).toBe(20);
    expect(cedarlineFaction.band).toBe('FAVORED');

    // ------------------------------------------------------------------------
    // Step 4: Advance to Chapter 2 (The Infrastructure Dilemma)
    // ------------------------------------------------------------------------
    const advanceChapter = engine.dispatch({
      type: 'AdvanceStoryChapter',
      chapterId: 'ch_infrastructure_dilemma',
    });
    expect(advanceChapter.success).toBe(true);
    state = engine.getState();
    expect(state.narrative!.activeChapterId).toBe('ch_infrastructure_dilemma');
    expect(state.narrative!.completedChapterIds).toContain('ch_triage_broad_street');

    // ------------------------------------------------------------------------
    // Step 5: Interpersonal Consequence: Protecting Barry
    // ------------------------------------------------------------------------
    // Player meets Barry and collaborates quietly, setting narrative flag
    engine.dispatch({
      type: 'SetWorldFlag',
      key: 'flag_marcus_protected',
      value: true,
    });

    engine.dispatch({
      type: 'ChangeNpcRelationship',
      npcId: 'npc_marcus',
      delta: 30,
      reason: 'Promised to remediate credentials without corporate scapegoating',
    });

    state = engine.getState();
    expect(state.flags['flag_marcus_protected']).toBe(true);
    expect(state.npcs!['npc_marcus']!.relationship).toBe(30);

    // Barry secretly hands over the executive deployment order trace
    const preserveEv4 = engine.dispatch({
      type: 'RecordInvestigativeEvidence',
      evidenceId: 'EVD-2026-004',
      source: 'marcus_private_notes',
      title: 'Executive Emergency Deployment Memo',
      description: 'Chat log proving VP Gabriel ordered bypass of security testing',
      hash: 'sha256-evd004-9a8b7c6d5e4f',
      tags: ['whistleblower', 'executive_memo'],
    });
    expect(preserveEv4.success).toBe(true);

    // ------------------------------------------------------------------------
    // Step 6: Service Containment & Remediation
    // ------------------------------------------------------------------------
    engine.dispatch({
      type: 'ExecuteContainment',
      action: 'isolate_service',
      reason: 'Authorized containment of svc-aster',
    });

    engine.dispatch({
      type: 'RemediatePermissions',
      targetPolicyRole: 'kb-assistant',
      removeSmbAccess: true,
      removeDatabaseAccess: true,
      grantedScopes: ['docs:read', 'kb:search'],
    });

    const completeRemediation = engine.dispatch({
      type: 'CompleteNarrativeMission',
      missionId: 'miss_contain_remediate',
    });
    expect(completeRemediation.success).toBe(true);

    state = engine.getState();
    // Money credited: ₦2,500.00 (250,000 kobo)
    expect(state.player.moneyKobo).toBe(initialMoney + 100_000 + 250_000);
    expect(state.narrative!.factions['faction_cedarline']!.standing).toBe(35); // 20 + 15

    // ------------------------------------------------------------------------
    // Step 7: Formulate Investigative Conclusion (Theory A: Executive Cover-Up)
    // ------------------------------------------------------------------------
    // With EVD-2026-001, EVD-2026-002, and EVD-2026-004 in vault, formulation succeeds
    const formulateConclusion = engine.dispatch({
      type: 'FormulateConclusion',
      conclusionId: 'conc_marcus_scapegoat',
    });
    expect(formulateConclusion.success).toBe(true);
    expect(formulateConclusion.message).toContain('confidence score');

    state = engine.getState();
    expect(state.narrative!.discoveredConclusions).toContain('conc_marcus_scapegoat');

    // ------------------------------------------------------------------------
    // Step 8: Consequence: Submit Finding to The Lagos Inquirer
    // ------------------------------------------------------------------------
    const submitToPress = engine.dispatch({
      type: 'SubmitInvestigativeConclusion',
      conclusionId: 'conc_marcus_scapegoat',
      recipientFactionId: 'faction_inquirer',
    });
    expect(submitToPress.success).toBe(true);

    // Shift standing with The Lagos Inquirer and 0xLagos Syndicate
    engine.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_inquirer',
      delta: 40,
      reason: 'Delivered substantiated executive cover-up dossier with cryptographic proof',
    });

    engine.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_0xlagos',
      delta: 20,
      reason: 'Shared responsible disclosure notes with white-hat community',
    });

    state = engine.getState();
    expect(state.narrative!.submittedConclusions).toContain('conc_marcus_scapegoat');
    expect(state.narrative!.factions['faction_inquirer']!.standing).toBe(40);
    expect(state.narrative!.factions['faction_inquirer']!.band).toBe('FAVORED');
    expect(state.narrative!.factions['faction_0xlagos']!.standing).toBe(25);
    expect(state.narrative!.factions['faction_0xlagos']!.band).toBe('FAVORED');
  });
});
