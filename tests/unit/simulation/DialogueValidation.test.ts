import { describe, it, expect } from 'vitest';
import { validateDialogueGraph } from '@/simulation/narrative/dialogueValidator';
import { ALL_DIALOGUE_GRAPHS } from '@/content/dialogue/npcDialogueData';
import { DialogueGraph } from '@/simulation/narrative/dialogueTypes';

describe('Milestone 7: Dialogue Graph Validation', () => {
  it('validates that all 8 authored NPC dialogue graphs pass schema and integrity checks', () => {
    expect(ALL_DIALOGUE_GRAPHS.length).toBeGreaterThanOrEqual(8);

    for (const graph of ALL_DIALOGUE_GRAPHS) {
      const result = validateDialogueGraph(graph);
      expect(result.isValid, `Errors in graph ${graph.npcId}: ${result.errors.join(', ')}`).toBe(
        true
      );
      expect(result.errors).toEqual([]);
    }
  });

  it('detects missing default node in a graph', () => {
    const invalidGraph: DialogueGraph = {
      npcId: 'npc_test',
      defaultNodeId: 'nonexistent_root',
      nodes: {
        node_1: {
          id: 'node_1',
          speakerId: 'Tester',
          text: 'Hello world',
          choices: [],
        },
      },
    };

    const result = validateDialogueGraph(invalidGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_DEFAULT_NODE')).toBe(true);
  });

  it('detects invalid nextNodeId target in choices', () => {
    const invalidGraph: DialogueGraph = {
      npcId: 'npc_test',
      defaultNodeId: 'root',
      nodes: {
        root: {
          id: 'root',
          speakerId: 'Tester',
          text: 'Root message',
          choices: [
            {
              id: 'choice_1',
              text: 'Go nowhere',
              nextNodeId: 'missing_destination',
            },
          ],
        },
      },
    };

    const result = validateDialogueGraph(invalidGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_TARGET_NODE')).toBe(true);
  });

  it('detects duplicate choice IDs within a single node', () => {
    const invalidGraph: DialogueGraph = {
      npcId: 'npc_test',
      defaultNodeId: 'root',
      nodes: {
        root: {
          id: 'root',
          speakerId: 'Tester',
          text: 'Root message',
          choices: [
            {
              id: 'dup_choice',
              text: 'Option A',
              nextNodeId: 'root',
            },
            {
              id: 'dup_choice',
              text: 'Option B',
              nextNodeId: 'root',
            },
          ],
        },
      },
    };

    const result = validateDialogueGraph(invalidGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_CHOICE_ID')).toBe(true);
  });

  it('flags self-loops that have no terminal exit option', () => {
    const loopingGraph: DialogueGraph = {
      npcId: 'npc_test',
      defaultNodeId: 'loop_forever',
      nodes: {
        loop_forever: {
          id: 'loop_forever',
          speakerId: 'Tester',
          text: 'Trapped forever!',
          choices: [
            {
              id: 'stay',
              text: 'Repeat',
              nextNodeId: 'loop_forever',
            },
          ],
        },
      },
    };

    const result = validateDialogueGraph(loopingGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'SELF_LOOP_NO_ESCAPE')).toBe(true);
  });

  it('permits intentional conversational return choices when an exit option exists', () => {
    const branchingGraph: DialogueGraph = {
      npcId: 'npc_test',
      defaultNodeId: 'hub',
      nodes: {
        hub: {
          id: 'hub',
          speakerId: 'Tester',
          text: 'Ask me anything.',
          choices: [
            { id: 'ask_a', text: 'Ask about Topic A', nextNodeId: 'topic_a' },
            { id: 'exit', text: 'Goodbye', nextNodeId: 'hub' },
          ],
        },
        topic_a: {
          id: 'topic_a',
          speakerId: 'Tester',
          text: 'Here is info about Topic A.',
          choices: [{ id: 'back', text: 'Ask something else', nextNodeId: 'hub' }],
        },
      },
    };

    const result = validateDialogueGraph(branchingGraph);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
