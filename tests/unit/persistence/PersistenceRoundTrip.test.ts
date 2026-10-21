import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../../src/simulation/SimulationEngine';
import { SaveManager } from '../../../src/application/persistence/SaveManager';
import { MemoryStorageAdapter } from '../../../src/application/persistence/adapters/MemoryStorageAdapter';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import { calculateCalendarTime } from '../../../src/simulation/time/calendar';
import type { SimulationState } from '../../../src/simulation/core/types';

describe('Persistence Full Simulation Round-Trip & Reconciliation', () => {
  let storage: MemoryStorageAdapter;

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    await storage.init();
  });

  it('saves and reloads a rich, representative gameplay state with 100% fidelity', async () => {
    // 1. Construct initial rich gameplay state
    const base = createInitialSimulationState();
    const simTimeSeconds = 7200; // 2 hours into simulation
    const calendar = calculateCalendarTime(simTimeSeconds);

    const richState: SimulationState = {
      ...base,
      metadata: {
        ...base.metadata,
        revision: 42,
      },
      time: {
        simulationTimeSeconds: simTimeSeconds,
        calendar,
      },
      player: {
        id: 'player_01',
        name: 'Babatunde Vance',
        health: 85,
        energy: 70,
        moneyKobo: 1_540_000, // ₦15,400.00
        locationId: 'cedarline_interior',
      },
      inventory: {
        slots: [
          { itemId: 'item_access_badge', quantity: 1 },
          { itemId: 'item_cedarline_notebook', quantity: 1 },
          { itemId: 'item_ram_upgrade_16gb', quantity: 1 },
          { itemId: 'item_cyber_study_guide', quantity: 1 },
        ],
      },
      flags: {
        apartment_door_unlocked: true,
        has_read_community_noticeboard: true,
        mission_aster_active: true,
        mission_aster_phase: 'containment',
        cyber_last_tool: 'cyber-policy',
        cyber_tool_executed_cyber_scan: true,
        cyber_tool_executed_cyber_log: true,
        cyber_tool_executed_cyber_evidence: true,
        cyber_tool_executed_cyber_policy: true,
      },
      timers: [
        // One future timer (valid)
        {
          id: 'future_timer_1',
          label: 'Pending network poll',
          dueSimulationTime: simTimeSeconds + 300,
          durationSeconds: 300,
          sequence: 1,
        },
        // One expired one-shot timer (should be pruned on restore)
        {
          id: 'expired_timer_1',
          label: 'Completed background scan',
          dueSimulationTime: simTimeSeconds - 50,
          durationSeconds: 100,
          sequence: 2,
        },
      ],
      nextTimerSequence: 3,
      mission: {
        ...base.mission!,
        phase: 'containment',
        discoveredHosts: ['10.0.4.10', '10.0.4.15', '10.0.4.20'],
        inspectedServices: ['svc-aster', 'svc-smb', 'svc-database'],
        analyzedLogIds: ['log-401', 'log-402', 'log-403'],
        preservedEvidenceIds: ['ev-audit-01', 'ev-token-dump'],
        isContained: true,
        containmentTimestamp: simTimeSeconds - 200,
        asterService: {
          ...base.mission!.asterService,
          operationalMode: 'CONTAINED',
          activePolicyRole: 'kb-assistant',
          grantedScopes: ['read:knowledgebase'],
          allowedSubnets: ['10.0.4.0/24'],
          smbAccessAllowed: false,
          databaseAccessAllowed: false,
          lastPolicyUpdateAt: simTimeSeconds - 180,
        },
        rootCauseAssessment: {
          suspectedRootCause: 'Over-privileged service account with unconstrained delegation',
          affectedComponent: 'svc-aster knowledge-base ingestion agent',
          observedImpact: 'Unauthorized traversal into SMB shared documents and database tables',
          supportingEvidenceIds: ['ev-audit-01', 'ev-token-dump'],
          isAccurate: true,
          feedback: 'Accurately identified credential delegation vulnerability.',
        },
      },
      npcs: {
        ...base.npcs,
        npc_amina: {
          id: 'npc_amina',
          relationship: 45, // Friendly
          memory: {
            met: true,
            metAtSimulationTime: 1200,
            conversationCount: 3,
            topicsDiscussed: ['aster_incident', 'cedarline_policy'],
            choicesMade: ['offer_assistance', 'share_forensic_evidence'],
            sharedFacts: ['aster_service_compromise'],
            commitments: ['investigate_root_cause'],
            lastInteractionTime: simTimeSeconds - 400,
          },
        },
      },
      career: {
        currentPathId: 'career_sec_analyst',
        currentLevel: 2,
        roleTitle: 'Junior SOC Analyst',
        employer: 'Cedarline Solutions (Marina Tower)',
        xp: 150,
        promotionsEarned: 1,
        promotionEligible: false,
      },
      jobs: {
        availableJobIds: ['job_broadstreet_containment'],
        activeJobs: [
          {
            listingId: 'job_eko_forensics',
            acceptedAtSimulationSeconds: simTimeSeconds - 600,
            objectives: [
              {
                id: 'obj_preserve_evidence',
                type: 'PRESERVE_EVIDENCE',
                description: 'Preserve evidence hash with documented cryptographic checksum.',
                target: 'database_dump_hash',
                isCompleted: true,
              },
              {
                id: 'obj_verify_custody',
                type: 'VERIFY_SERVICE',
                description: 'Confirm forensic integrity record in workstation evidence ledger.',
                target: 'forensic_integrity',
                isCompleted: false,
              },
            ],
          },
        ],
        completedJobHistory: [
          {
            jobId: 'job_cedarline_triage',
            title: 'Cedarline Services: Inbound Alert Triage',
            employer: 'Cedarline Solutions',
            completedAtSimulationSeconds: simTimeSeconds - 1200,
            payoutKobo: 120_000,
            careerXpEarned: 50,
            performanceRating: 'EXEMPLARY',
            feedbackNotes: 'Triage performed with zero false positives.',
          },
        ],
      },
      skills: {
        ...base.skills!,
        log_analysis: { id: 'log_analysis', level: 3, xp: 40, totalXp: 240 },
        network_fundamentals: { id: 'network_fundamentals', level: 2, xp: 30, totalXp: 130 },
        incident_response: { id: 'incident_response', level: 2, xp: 50, totalXp: 150 },
      },
      economy: {
        transactions: [
          {
            id: 'tx_initial_balance',
            type: 'INITIAL_BALANCE',
            amountKobo: 250_000,
            direction: 'CREDIT',
            balanceAfterKobo: 250_000,
            timestamp: 0,
            description: 'Starting stipend',
          },
          {
            id: 'tx_job_cedarline_triage',
            type: 'JOB_PAYOUT',
            amountKobo: 120_000,
            direction: 'CREDIT',
            balanceAfterKobo: 370_000,
            timestamp: simTimeSeconds - 1200,
            description: 'Payout: Cedarline Alert Triage',
            relatedEntityId: 'job_cedarline_triage',
          },
        ],
        recurringExpenses: base.economy!.recurringExpenses,
      },
    };

    // 2. Load into an active engine and save via SaveManager
    const sourceEngine = new SimulationEngine({ initialState: richState });
    const sourceSaveManager = new SaveManager({ engine: sourceEngine, storage });
    await sourceSaveManager.init();

    const saveResult = await sourceSaveManager.saveGame('slot_1', 'Checkpoint before containment');
    expect(saveResult.success).toBe(true);
    expect(saveResult.metadata?.completedJobsCount).toBe(1);
    expect(saveResult.metadata?.careerLevel).toBe(2);
    expect(saveResult.metadata?.playerRole).toBe('Junior SOC Analyst');

    // 3. Create a fresh target engine with default new game state
    const targetEngine = new SimulationEngine();
    expect(targetEngine.getState().player.moneyKobo).toBe(250_000);
    expect(targetEngine.getState().career?.currentLevel).toBe(1);

    const targetSaveManager = new SaveManager({ engine: targetEngine, storage });
    await targetSaveManager.init();

    // 4. Load saved game into target engine
    const loadResult = await targetSaveManager.loadGame('slot_1');
    expect(loadResult.success).toBe(true);
    expect(loadResult.record).toBeDefined();

    const restored = targetEngine.getState();

    // 5. Verify authoritative simulation fields match with 100% fidelity
    expect(restored.player.name).toBe('Babatunde Vance');
    expect(restored.player.health).toBe(85);
    expect(restored.player.energy).toBe(70);
    expect(restored.player.moneyKobo).toBe(1_540_000);
    expect(restored.player.locationId).toBe('cedarline_interior');

    // Time & Calendar
    expect(restored.time.simulationTimeSeconds).toBe(simTimeSeconds);
    expect(restored.time.calendar.timeString).toBe(calendar.timeString);

    // Inventory
    expect(restored.inventory.slots).toHaveLength(4);
    expect(restored.inventory.slots.some(s => s.itemId === 'item_ram_upgrade_16gb')).toBe(true);

    // Flags
    expect(restored.flags['mission_aster_phase']).toBe('containment');
    expect(restored.flags['cyber_tool_executed_cyber_policy']).toBe(true);

    // Mission State
    expect(restored.mission?.phase).toBe('containment');
    expect(restored.mission?.isContained).toBe(true);
    expect(restored.mission?.asterService.operationalMode).toBe('CONTAINED');
    expect(restored.mission?.rootCauseAssessment?.isAccurate).toBe(true);

    // NPC State
    expect(restored.npcs?.npc_amina?.relationship).toBe(45);
    expect(restored.npcs?.npc_amina?.memory.conversationCount).toBe(3);
    expect(restored.npcs?.npc_amina?.memory.choicesMade).toContain('share_forensic_evidence');

    // Career State
    expect(restored.career?.currentLevel).toBe(2);
    expect(restored.career?.roleTitle).toBe('Junior SOC Analyst');

    // Jobs State
    expect(restored.jobs?.activeJobs).toHaveLength(1);
    expect(restored.jobs?.activeJobs[0]?.listingId).toBe('job_eko_forensics');
    expect(restored.jobs?.completedJobHistory).toHaveLength(1);

    // Skills State
    expect(restored.skills?.log_analysis.level).toBe(3);
    expect(restored.skills?.incident_response.level).toBe(2);

    // Economy State
    expect(restored.economy?.transactions).toHaveLength(2);

    // Timers Reconciliation: expired one-shot timer must have been pruned!
    expect(restored.timers).toHaveLength(1);
    expect(restored.timers[0]?.id).toBe('future_timer_1');
    expect(restored.timers.some(t => t.id === 'expired_timer_1')).toBe(false);

    // Red Team Assessment State Fidelity
    expect(restored.redTeamAssessment).toBeDefined();
    expect(restored.redTeamAssessment?.scenarioId).toBe('scen_m17_cedarline_redteam');
  });

  it('saves and restores modified redTeamAssessment state across persistence round-trip', async () => {
    const engine = new SimulationEngine();
    const saveManager = new SaveManager({ engine, storage });
    await saveManager.init();

    // Accept RoE and validate a finding
    engine.dispatch({
      type: 'AcceptRulesOfEngagement',
      assessmentId: 'ROE-2026-CEDAR-RED-01',
      assessorSignature: 'Lead PenTester',
    });
    engine.dispatch({
      type: 'ValidateVulnerabilityFinding',
      findingId: 'VULN-CEDAR-001',
      decision: 'VALIDATE',
      rationale: 'Confirmed BOLA flaw',
    });

    const saveResult = await saveManager.saveGame('slot_redteam_test');
    expect(saveResult.success).toBe(true);

    const loadResult = await saveManager.loadGame('slot_redteam_test');
    expect(loadResult.success).toBe(true);
    const restored = engine.getState();
    expect(restored.redTeamAssessment?.isAcceptedByPlayer).toBe(true);
    expect(
      restored.redTeamAssessment?.findings.find(f => f.id === 'VULN-CEDAR-001')?.status
    ).toBe('VALIDATED');
  });

  it('saves and restores modified bountyHub state across persistence round-trip', async () => {
    const engine = new SimulationEngine();
    const saveManager = new SaveManager({ engine, storage });
    await saveManager.init();

    // Accept contract and verify active state
    const acceptRes = engine.dispatch({
      type: 'AcceptContract',
      contractId: 'ct-balogun-pos-audit',
    });
    expect(acceptRes.success).toBe(true);

    const saveResult = await saveManager.saveGame('slot_bounty_test');
    expect(saveResult.success).toBe(true);

    const loadResult = await saveManager.loadGame('slot_bounty_test');
    expect(loadResult.success).toBe(true);
    const restored = engine.getState();
    expect(restored.bountyHub).toBeDefined();
    expect(restored.bountyHub?.activeContract?.contractId).toBe('ct-balogun-pos-audit');
    expect(restored.bountyHub?.activeContract?.status).toBe('ACTIVE');
  });
});
