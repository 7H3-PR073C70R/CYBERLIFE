import { DialogueGraph } from './dialogueTypes';

export interface DialogueValidationError {
  readonly graphId: string;
  readonly nodeId?: string;
  readonly choiceId?: string;
  readonly code:
    | 'MISSING_DEFAULT_NODE'
    | 'MISSING_NODE'
    | 'INVALID_SPEAKER'
    | 'MISSING_TARGET_NODE'
    | 'EMPTY_CHOICES_NON_TERMINAL'
    | 'DUPLICATE_CHOICE_ID'
    | 'INVALID_CONDITION'
    | 'SELF_LOOP_NO_ESCAPE';
  readonly message: string;
}

export interface DialogueValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly DialogueValidationError[];
}

/**
 * Validates the structural integrity and reachable transitions of a DialogueGraph.
 */
export function validateDialogueGraph(graph: DialogueGraph): DialogueValidationResult {
  const errors: DialogueValidationError[] = [];
  const graphId = graph.npcId;

  if (!graph.defaultNodeId || !graph.nodes[graph.defaultNodeId]) {
    errors.push({
      graphId,
      code: 'MISSING_DEFAULT_NODE',
      message: `Default node "${graph.defaultNodeId}" does not exist in graph "${graphId}".`,
    });
  }

  const allNodeIds = new Set(Object.keys(graph.nodes));

  for (const [nodeId, node] of Object.entries(graph.nodes)) {
    if (node.id !== nodeId) {
      errors.push({
        graphId,
        nodeId,
        code: 'MISSING_NODE',
        message: `Node key "${nodeId}" does not match internal node.id "${node.id}".`,
      });
    }

    if (!node.speakerId || typeof node.speakerId !== 'string') {
      errors.push({
        graphId,
        nodeId,
        code: 'INVALID_SPEAKER',
        message: `Node "${nodeId}" has invalid or missing speakerId.`,
      });
    }

    if (!node.text || typeof node.text !== 'string' || node.text.trim().length === 0) {
      errors.push({
        graphId,
        nodeId,
        code: 'MISSING_NODE',
        message: `Node "${nodeId}" has empty dialogue text.`,
      });
    }

    const isTerminal = Boolean(node.isTerminal || node.choices.length === 0);

    if (!isTerminal && node.choices.length === 0) {
      errors.push({
        graphId,
        nodeId,
        code: 'EMPTY_CHOICES_NON_TERMINAL',
        message: `Non-terminal node "${nodeId}" has zero response choices.`,
      });
    }

    const seenChoiceIds = new Set<string>();

    for (const choice of node.choices) {
      if (!choice.id) {
        errors.push({
          graphId,
          nodeId,
          code: 'DUPLICATE_CHOICE_ID',
          message: `Choice in node "${nodeId}" has missing ID.`,
        });
      } else if (seenChoiceIds.has(choice.id)) {
        errors.push({
          graphId,
          nodeId,
          choiceId: choice.id,
          code: 'DUPLICATE_CHOICE_ID',
          message: `Duplicate choice ID "${choice.id}" within node "${nodeId}".`,
        });
      }
      seenChoiceIds.add(choice.id);

      if (choice.nextNodeId !== undefined && !allNodeIds.has(choice.nextNodeId)) {
        errors.push({
          graphId,
          nodeId,
          choiceId: choice.id,
          code: 'MISSING_TARGET_NODE',
          message: `Choice "${choice.id}" points to non-existent target node "${choice.nextNodeId}".`,
        });
      }

      // Check self-loop without other choices
      if (choice.nextNodeId === nodeId && node.choices.length === 1) {
        errors.push({
          graphId,
          nodeId,
          choiceId: choice.id,
          code: 'SELF_LOOP_NO_ESCAPE',
          message: `Node "${nodeId}" has a single choice that loops back to itself with no exit.`,
        });
      }

      // Validate condition structure if present
      if (choice.condition) {
        const cond = choice.condition;
        if (
          cond.minRelationship !== undefined &&
          cond.maxRelationship !== undefined &&
          cond.minRelationship > cond.maxRelationship
        ) {
          errors.push({
            graphId,
            nodeId,
            choiceId: choice.id,
            code: 'INVALID_CONDITION',
            message: `minRelationship (${cond.minRelationship}) > maxRelationship (${cond.maxRelationship}) on choice "${choice.id}".`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
