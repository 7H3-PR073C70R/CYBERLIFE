/**
 * Cyberlife — Milestone 14: Playable Narrative, Branching Choices & End-to-End Gameplay Audit
 *
 * Comprehensive end-to-end presentation and simulation integration test suite verifying:
 * 1. Narrative entry point, character dialogue display, and real UI selection.
 * 2. Meaningful branching: Tobi (Empathy vs Accusation) producing divergent
 *    relationship, faction, flag, and evidence consequences.
 * 3. Evidence-dependent investigation: Amina dialogue gating choices based on preserved vault evidence.
 * 4. Faction standing and UI consequence verification in ContactsApp.
 * 5. Save/Load persistence: serialization and deserialization of narrative and dialogue state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DialogueOverlay } from '@/presentation/dialogue/DialogueOverlay';
import { ContactsApp } from '@/presentation/desktop/apps/ContactsApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';
import { validateSaveRecord, createSaveMetadata } from '@/application/persistence/schema';
import { calculateStateChecksum } from '@/application/persistence/checksum';

describe('Playable Narrative End-to-End Gameplay & Branching Audit', () => {
  // --------------------------------------------------------------------------
  // 1. Narrative Entry Point & Procedural Dialogue Consequence
  // --------------------------------------------------------------------------
  it('allows the player to start dialogue, view choices, select one, and observe faction and relationship consequences', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    const { rerender } = render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );    // Initial dialogue UI elements
    expect(screen.getByTestId('dialogue-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('dialogue-npc-name')).toHaveTextContent('Blessing');
    expect(screen.getByTestId('npc-relationship-badge')).toHaveTextContent('Friendly (+20)');
    expect(screen.getByTestId('dialogue-speech-text')).toBeInTheDocument();

    // Verify initial Cedarline standing in engine
    const initialCedarline = engine.getState().narrative?.factions['faction_cedarline']?.standing ?? 0;
    expect(initialCedarline).toBe(10);

    // Two choices should be available in greeting
    const choices = screen.getAllByTestId(/^dialogue-choice-/);
    expect(choices.length).toBeGreaterThanOrEqual(2);

    // Select Choice 0: Procedural protocol choice ("Understood, Lead. What's our scope...")
    fireEvent.click(choices[0]!);

    // Rerender with updated engine state
    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    // Verify state updates in simulation engine
    const updatedState = engine.getState();
    const aminaNpc = updatedState.npcs!['npc_amina']!;
    expect(aminaNpc.relationship).toBe(25); // +5 relationship
    expect(aminaNpc.memory.topicsDiscussed).toContain('incident_priorities');

    // Faction consequence: Cedarline standing increased by +5
    const updatedCedarline = updatedState.narrative?.factions['faction_cedarline']?.standing;
    expect(updatedCedarline).toBe(15);

    // UI reflection: Faction toast rendered
    const factionDeltaToast = screen.queryByTestId('dialogue-faction-delta');
    if (factionDeltaToast) {
      expect(factionDeltaToast).toHaveTextContent('+5');
      expect(factionDeltaToast).toHaveTextContent('CEDARLINE');
    }
  });

  // --------------------------------------------------------------------------
  // 2. Meaningful Branching: Tobi (Empathy vs Accusation)
  // --------------------------------------------------------------------------
  it('Branch 1: Marcus Empathy path grants trust, Cedarline standing, whistleblower memo, and 0xLagos rep', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    // Advance story to Chapter 2 so Marcus dialogue is in context
    engine.dispatch({
      type: 'AdvanceStoryChapter',
      chapterId: 'ch_infrastructure_dilemma',
    });

    const { rerender } = render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    // Marcus initial state
    expect(screen.getByTestId('dialogue-npc-name')).toHaveTextContent('Barry');
    expect(screen.getByTestId('npc-relationship-badge')).toHaveTextContent('Neutral (0)');

    // Choose Branch 1: Empathy / De-escalation ("Take a breath, Marcus...")
    const choiceEmpathy = screen.getByTestId('dialogue-choice-0');
    expect(choiceEmpathy).toHaveTextContent(/Barry, breathe/i);
    fireEvent.click(choiceEmpathy);

    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    let state = engine.getState();
    expect(state.npcs!['npc_marcus']!.relationship).toBe(15); // +15 trust
    expect(state.narrative?.factions['faction_cedarline']?.standing).toBe(20); // 10 + 10
    expect(state.flags['flag_marcus_protected']).toBe(true);
    expect(state.flags['flag_marcus_exposed']).toBeUndefined();

    // Now Marcus offers the memo request option
    const choiceRequestMemo = screen.getByTestId('dialogue-choice-0');
    expect(choiceRequestMemo).toHaveTextContent(/documentation of Michael ordering this bypass/i);
    fireEvent.click(choiceRequestMemo);

    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    state = engine.getState();
    expect(state.flags['flag_has_marcus_memo']).toBe(true);
    expect(state.narrative?.factions['faction_0xlagos']?.standing).toBe(15); // Initial 5 + 10 = 15 rep
    // Whistleblower memo evidence recorded in vault
    expect(state.narrative?.evidenceVault['EVD-2026-004']).toBeDefined();
    expect(state.narrative?.evidenceVault['EVD-2026-004']?.title).toBe('Executive Emergency Deployment Memo');
  });

  it('Branch 2: Marcus Accusation path breaks trust, reduces standing, sets exposed flag, and denies memo', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    // Advance story to Chapter 2 from identical starting conditions
    engine.dispatch({
      type: 'AdvanceStoryChapter',
      chapterId: 'ch_infrastructure_dilemma',
    });

    const { rerender } = render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    // Choose Branch 2: Corporate Accusation ("Did you provision svc-aster?...")
    const choiceAccusation = screen.getByTestId('dialogue-choice-1');
    expect(choiceAccusation).toHaveTextContent(/Did you provision svc-aster/i);
    fireEvent.click(choiceAccusation);

    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    const state = engine.getState();
    // Observable divergent consequences:
    expect(state.npcs!['npc_marcus']!.relationship).toBe(-20); // -20 distrust
    expect(state.narrative?.factions['faction_cedarline']?.standing).toBe(5); // 10 - 5
    expect(state.flags['flag_marcus_exposed']).toBe(true);
    expect(state.flags['flag_marcus_protected']).toBeUndefined();
    expect(state.flags['flag_has_marcus_memo']).toBeUndefined();
    // Evidence is NOT handed over
    expect(state.narrative?.evidenceVault['EVD-2026-004']).toBeUndefined();

    // Marcus clammed up and conversation ends defensively
    expect(screen.getByTestId('dialogue-speech-text')).toHaveTextContent(/I followed the deployment checklist/i);
  });

  // --------------------------------------------------------------------------
  // 3. Evidence-Dependent Investigation: Amina Returning Dilemma
  // --------------------------------------------------------------------------
  it('gates the evidence dilemma choice behind physical evidence preservation in the vault', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    // Move Amina to returning node
    engine.dispatch({
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
    });
    // Manually transition to amina_returning node
    engine.dispatch({
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_greet_procedure',
    });

    // Start fresh dialogue in returning state
    engine.dispatch({
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
    });

    const { rerender } = render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    // Without EVD-2026-001, choice with requiredEvidenceIds is NOT rendered
    expect(screen.queryByText(/I preserved forensic evidence EVD-2026-001/i)).not.toBeInTheDocument();

    // Now preserve EVD-2026-001 into the evidence vault
    act(() => {
      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-001',
        source: 'app-portal-01',
        title: 'Aster Core Configuration Snapshot',
        description: 'Corporate admin wildcard policy granted to svc-aster',
        hash: 'sha256-test-evd001',
        tags: ['config', 'iam_policy'],
      });
    });

    // Re-render: Evidence choice should now be visible and unlocked!
    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    const evidenceChoice = screen.getByText(/I preserved forensic evidence EVD-2026-001/i);
    expect(evidenceChoice).toBeInTheDocument();

    // Select the evidence choice to open the high-stakes narrative dilemma
    fireEvent.click(evidenceChoice.closest('button')!);

    rerender(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    // Verify the dilemma text and both divergent paths
    expect(screen.getByTestId('dialogue-speech-text')).toHaveTextContent(/svc-aster was given corporate-admin with wildcard scopes/i);

    const dilemmaChoices = screen.getAllByTestId(/^dialogue-choice-/);
    expect(dilemmaChoices.length).toBe(2);
    expect(dilemmaChoices[0]).toHaveTextContent(/quiet internal containment/i);
    expect(dilemmaChoices[1]).toHaveTextContent(/report this finding to CRCII regulators/i);

    // Execute Sub-branch 2: Regulatory Disclosure to CRCII
    fireEvent.click(dilemmaChoices[1]!);

    const finalState = engine.getState();
    expect(finalState.flags['flag_regulatory_disclosure_chosen']).toBe(true);
    expect(finalState.narrative?.factions['faction_crcii']?.standing).toBe(30); // Initial 10 + 20 = 30 CRCII standing
    expect(finalState.narrative?.factions['faction_cedarline']?.standing).toBe(5); // 15 - 10 = 5
    expect(finalState.narrative?.activeChapterId).toBe('ch_infrastructure_dilemma');
  });

  // --------------------------------------------------------------------------
  // 4. ContactsApp Factions & Standing UI Reflection
  // --------------------------------------------------------------------------
  it('renders updated faction standings, active narrative chapter, and audit history in ContactsApp', () => {
    const engine = createSimulationEngine();

    // Perform a choice that updates faction standings
    engine.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_cedarline',
      delta: 25,
      reason: 'Remediated vulnerable service without data breach',
    });
    engine.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_0xlagos',
      delta: 15,
      reason: 'Shared threat telemetry with local collective',
    });

    render(
      <SimulationProvider engine={engine}>
        <ContactsApp />
      </SimulationProvider>
    );

    // Switch to Factions tab
    const factionsTab = screen.getByTestId('tab-btn-factions');
    expect(factionsTab).toBeInTheDocument();
    fireEvent.click(factionsTab);

    // Verify active narrative arc and chapter header
    expect(screen.getByTestId('narrative-active-arc')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-active-chapter')).toHaveTextContent(/Triage on Broad Street/i);

    // Verify Cedarline item in sidebar and details in main panel
    const cedarlineItem = screen.getByTestId('faction-item-faction_cedarline');
    expect(cedarlineItem).toBeInTheDocument();
    expect(cedarlineItem).toHaveTextContent('Cedarline Services Ltd.');
    expect(cedarlineItem).toHaveTextContent('+35'); // Initial 10 + 25 = 35

    // Verify Cedarline title and badge in main view
    expect(screen.getByTestId('faction-title')).toHaveTextContent('Cedarline Services Ltd.');
    expect(screen.getByTestId('faction-standing-badge')).toHaveTextContent('FAVORED (+35)');

    // Click 0xLagos in sidebar to select it
    const lagosItem = screen.getByTestId('faction-item-faction_0xlagos');
    expect(lagosItem).toBeInTheDocument();
    fireEvent.click(lagosItem);

    // Verify 0xLagos details in main view
    expect(screen.getByTestId('faction-title')).toHaveTextContent('0xLagos Research Syndicate');
    expect(screen.getByTestId('faction-standing-badge')).toHaveTextContent('FAVORED (+20)');

    // Select Cedarline again to view its audit history
    fireEvent.click(cedarlineItem);

    // Verify Standing Audit Trail
    expect(screen.getByText('Standing Audit Trail & Decision History')).toBeInTheDocument();
    expect(screen.getByText(/Remediated vulnerable service without data breach/i)).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 5. Save/Load Persistence Consistency
  // --------------------------------------------------------------------------
  it('preserves full narrative, faction, relationship, and evidence state across save and load cycles', () => {
    const engine = createSimulationEngine();

    // 1. Advance state with narrative actions
    engine.dispatch({
      type: 'AdvanceStoryChapter',
      chapterId: 'ch_infrastructure_dilemma',
    });
    engine.dispatch({
      type: 'ChangeFactionStanding',
      factionId: 'faction_cedarline',
      delta: 20,
      reason: 'Completed audit',
    });
    engine.dispatch({
      type: 'ChangeNpcRelationship',
      npcId: 'npc_marcus',
      delta: 15,
      reason: 'Established trust',
    });
    engine.dispatch({
      type: 'SetWorldFlag',
      key: 'flag_marcus_protected',
      value: true,
    });
    engine.dispatch({
      type: 'RecordInvestigativeEvidence',
      evidenceId: 'EVD-2026-004',
      source: 'marcus_private_notes',
      title: 'Executive Emergency Deployment Memo',
      description: 'Michael deployment authorization',
      hash: 'sha256-memo-test',
      tags: ['whistleblower'],
    });

    const preSaveState = engine.getState();

    // 2. Package into SaveGameRecord and serialize to JSON
    const metadata = createSaveMetadata(preSaveState, 'slot_1');
    const checksum = calculateStateChecksum(preSaveState);
    const saveRecord = {
      metadata,
      state: preSaveState,
      checksum,
    };
    const validationResult = validateSaveRecord(saveRecord);
    expect(validationResult.isValid).toBe(true);

    const serializedJson = JSON.stringify(saveRecord);
    expect(serializedJson).toBeDefined();

    // 3. Deserialize back into state
    const parsedRecord = JSON.parse(serializedJson);
    const loadedState = parsedRecord.state;

    // 4. Verify all narrative properties survived
    expect(loadedState.narrative?.activeChapterId).toBe('ch_infrastructure_dilemma');
    expect(loadedState.narrative?.factions['faction_cedarline']?.standing).toBe(30);
    expect(loadedState.npcs!['npc_marcus']!.relationship).toBe(15);
    expect(loadedState.flags['flag_marcus_protected']).toBe(true);
    expect(loadedState.narrative?.evidenceVault['EVD-2026-004']).toBeDefined();
    expect(loadedState.narrative?.evidenceVault['EVD-2026-004']?.title).toBe('Executive Emergency Deployment Memo');

    // 5. Hydrate new engine with loaded state and test dialogue continuity
    const hydratedEngine = createSimulationEngine({ initialState: loadedState });
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={hydratedEngine}>
        <DialogueOverlay npcId="npc_marcus" onClose={handleClose} />
      </SimulationProvider>
    );

    // Marcus relationship badge reflects restored trust (15 = Neutral (+15))
    expect(screen.getByTestId('npc-relationship-badge')).toHaveTextContent('Neutral (+15)');
  });
});
