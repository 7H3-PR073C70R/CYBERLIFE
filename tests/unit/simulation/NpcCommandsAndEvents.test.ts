import { describe, it, expect, beforeEach } from 'vitest';
import { handleCommand } from '@/simulation/commands/commandHandler';
import { createInitialSimulationState } from '@/simulation';
import { validateSimulationState } from '@/simulation/core/invariants';
import { SimulationState } from '@/simulation/core/types';

describe('Milestone 7: NPC Commands, Events & State Transitions', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  describe('StartNpcDialogue & EndDialogue', () => {
    it('starts dialogue, marks NPC as met, and sets active dialogue', () => {
      expect(state.npcs!.npc_amina!.memory.met).toBe(false);
      expect(state.activeDialogue).toBeUndefined();

      const result = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_amina',
      });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);
      expect(result.events[0]?.type).toBe('NPC_DIALOGUE_STARTED');
      expect(result.state.activeDialogue).toBeDefined();
      expect(result.state.activeDialogue?.npcId).toBe('npc_amina');
      expect(result.state.activeDialogue?.currentNodeId).toBe('amina_greeting');
      expect(result.state.npcs!.npc_amina!.memory.met).toBe(true);

      expect(() => validateSimulationState(result.state)).not.toThrow();
    });

    it('ends active dialogue, clears state, and increments conversation count', () => {
      // Start dialogue first
      const started = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_marcus',
      }).state;

      const result = handleCommand(started, { type: 'EndDialogue' });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);
      expect(result.events[0]?.type).toBe('NPC_DIALOGUE_ENDED');
      expect(result.state.activeDialogue).toBeUndefined();
    });
  });

  describe('SelectDialogueChoice', () => {
    it('applies authored relationship delta, records choice, and updates current node', () => {
      const started = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_marcus',
      }).state;

      const initialRel = started.npcs!.npc_marcus!.relationship;

      // Select 'marcus_empathy' choice on root node
      const result = handleCommand(started, {
        type: 'SelectDialogueChoice',
        npcId: 'npc_marcus',
        choiceId: 'marcus_empathy',
      });

      expect(result.success).toBe(true);
      // Verify relationship increased
      expect(result.state.npcs!.npc_marcus!.relationship).toBeGreaterThan(initialRel);

      // Verify choice recorded in memory
      expect(result.state.npcs!.npc_marcus!.memory.choicesMade).toContain('marcus_empathy');

      // Verify dialogue advanced to next node
      expect(result.state.activeDialogue?.currentNodeId).toBe('marcus_relief');

      // Events emitted
      const eventTypes = result.events.map(e => e.type);
      expect(eventTypes).toContain('NPC_DIALOGUE_CHOICE_SELECTED');
      expect(eventTypes).toContain('NPC_RELATIONSHIP_CHANGED');
    });

    it('terminates dialogue when terminal exit choice is chosen', () => {
      const started = handleCommand(state, {
        type: 'StartNpcDialogue',
        npcId: 'npc_amina',
      }).state;

      // amina_greet_workstation choice transitions to terminal amina_exit_workstation node
      const result = handleCommand(started, {
        type: 'SelectDialogueChoice',
        npcId: 'npc_amina',
        choiceId: 'amina_greet_workstation',
      });

      expect(result.success).toBe(true);
      expect(result.state.activeDialogue).toBeUndefined();
      const eventTypes = result.events.map(e => e.type);
      expect(eventTypes).toContain('NPC_DIALOGUE_CHOICE_SELECTED');
      expect(eventTypes).toContain('NPC_DIALOGUE_ENDED');
    });
  });

  describe('ChangeNpcRelationship & Clamping', () => {
    it('clamps relationship delta within bounds [-100, 100]', () => {
      // Starting from initial relationship, add +200
      const result = handleCommand(state, {
        type: 'ChangeNpcRelationship',
        npcId: 'npc_amina',
        delta: 200,
        reason: 'Massive achievement',
      });

      expect(result.state.npcs!.npc_amina!.relationship).toBe(100);

      // Subtract -300
      const subResult = handleCommand(result.state, {
        type: 'ChangeNpcRelationship',
        npcId: 'npc_amina',
        delta: -300,
        reason: 'Severe betrayal',
      });

      expect(subResult.state.npcs!.npc_amina!.relationship).toBe(-100);
    });

    it('treats 0 delta as a clean no-op without emitting redundant events', () => {
      const result = handleCommand(state, {
        type: 'ChangeNpcRelationship',
        npcId: 'npc_amina',
        delta: 0,
        reason: 'Nothing changed',
      });

      expect(result.isNoOp).toBe(true);
      expect(result.events.length).toBe(0);
      expect(result.state.npcs!.npc_amina!.relationship).toBe(state.npcs!.npc_amina!.relationship);
    });
  });

  describe('RecordNpcMemory', () => {
    it('stores unique facts and choices idempotently', () => {
      const result1 = handleCommand(state, {
        type: 'RecordNpcMemory',
        npcId: 'npc_elena',
        fact: 'aster_tool_loop_details',
        choice: 'asked_technical_architecture',
      });

      expect(result1.state.npcs!.npc_elena!.memory.sharedFacts).toContain(
        'aster_tool_loop_details'
      );
      expect(result1.state.npcs!.npc_elena!.memory.choicesMade).toContain(
        'asked_technical_architecture'
      );

      // Dispatching duplicate shouldn't create duplicate entries in arrays
      const result2 = handleCommand(result1.state, {
        type: 'RecordNpcMemory',
        npcId: 'npc_elena',
        fact: 'aster_tool_loop_details',
        choice: 'asked_technical_architecture',
      });

      expect(result2.isNoOp).toBe(true);
      expect(
        result2.state.npcs!.npc_elena!.memory.sharedFacts.filter(
          f => f === 'aster_tool_loop_details'
        ).length
      ).toBe(1);
    });
  });

  describe('Simulation Invariants', () => {
    it('passes invariant validation for all initialized NPCs', () => {
      expect(() => validateSimulationState(state)).not.toThrow();
    });

    it('catches invalid relationship bounds if state is corrupted', () => {
      const amina = state.npcs!.npc_amina!;
      const corruptedState: SimulationState = {
        ...state,
        npcs: {
          ...state.npcs!,
          npc_amina: {
            ...amina,
            relationship: 150, // Out of bounds
          },
        },
      };

      expect(() => validateSimulationState(corruptedState)).toThrow();
    });
  });
});
