import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import { validateSimulationState } from '@/simulation/core/invariants';
import { validateSaveRecord, createSaveMetadata } from '@/application/persistence/schema';
import { calculateStateChecksum } from '@/application/persistence/checksum';

describe('Milestone 14 — Narrative Persistence & Save/Load Invariants', () => {
  it('validates simulation state invariants with active narrative domain model', () => {
    const engine = new SimulationEngine();
    const state = engine.getState();

    // Invariants must pass without throwing
    expect(() => validateSimulationState(state)).not.toThrow();
  });

  it('persists and cleanly restores narrative state across save game records', () => {
    const engine1 = new SimulationEngine();

    // 1. Mutate narrative state
    engine1.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_cedarline',
      delta: 25,
      reason: 'Assisted Lead Analyst Blessing with triage',
    });

    engine1.dispatch({
      type: 'RecordInvestigativeEvidence',
      evidenceId: 'EVD-2026-001',
      source: 'app-portal-01',
      title: 'Aster Core Configuration Snapshot',
      description: 'Over-privileged wildcard permissions',
      hash: 'sha256-abc123def456',
    });

    engine1.dispatch({
      type: 'AdvanceStoryChapter',
      chapterId: 'ch_infrastructure_dilemma',
    });

    const modifiedState = engine1.getState();

    // 2. Package into SaveGameRecord
    const metadata = createSaveMetadata(modifiedState, 'slot_test_save');
    const checksum = calculateStateChecksum(modifiedState);
    const saveRecord = {
      metadata,
      state: modifiedState,
      checksum,
    };

    // 3. Validate save record against persistence schema
    const validationResult = validateSaveRecord(saveRecord);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);

    // 4. Restore into a fresh SimulationEngine instance
    const engine2 = new SimulationEngine();
    engine2.loadState(saveRecord.state);

    const restoredState = engine2.getState();
    expect(restoredState.narrative).toBeDefined();

    // Verify faction standing and history restored
    const cedarline = restoredState.narrative!.factions['faction_cedarline']!;
    expect(cedarline.standing).toBe(35); // 10 initial + 25 delta
    expect(cedarline.band).toBe('FAVORED');
    expect(cedarline.history.length).toBe(1);
    expect(cedarline.history[0]?.reason).toContain('Assisted Lead Analyst Blessing');

    // Verify Evidence Vault restored
    const evidenceItem = restoredState.narrative!.evidenceVault['EVD-2026-001']!;
    expect(evidenceItem).toBeDefined();
    expect(evidenceItem.title).toBe('Aster Core Configuration Snapshot');
    expect(evidenceItem.hash).toBe('sha256-abc123def456');

    // Verify chapter progression restored
    expect(restoredState.narrative!.activeChapterId).toBe('ch_infrastructure_dilemma');
    expect(restoredState.narrative!.completedChapterIds).toContain('ch_triage_broad_street');
  });
});
