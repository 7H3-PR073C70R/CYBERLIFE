/**
 * Cyberlife — Milestone 18: Simulated Defensive Response Engine
 *
 * Implements pure functions for executing and validating defensive response actions:
 * - Isolate / restore fictional endpoints.
 * - Lock accounts / restrict permissions.
 * - Block / unblock malicious network indicators at perimeter.
 * - Apply containment policies & formal escalations.
 *
 * STRICT SAFETY INVARIANT:
 * 100% in-game simulation state changes. Zero host modifications, zero real firewall calls.
 */

import {
  DefensiveActionType,
  DefensiveResponseAction,
  DefensiveOpsState,
} from './types';

export interface ResponseExecutionResult {
  readonly success: boolean;
  readonly message: string;
  readonly error?: string;
  readonly action?: DefensiveResponseAction;
  readonly nextState: DefensiveOpsState;
}

/**
 * Validates and executes a defensive response action against the in-memory simulation state.
 */
export function executeDefensiveAction(
  state: DefensiveOpsState,
  actionType: DefensiveActionType,
  targetEntityId: string,
  reason: string,
  simTimeSeconds: number,
  actor: string = 'Security Analyst (Player)'
): ResponseExecutionResult {
  const trimmedTarget = targetEntityId.trim();
  if (!trimmedTarget) {
    return {
      success: false,
      message: 'Target entity identifier cannot be empty.',
      error: 'INVALID_TARGET',
      nextState: state,
    };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length < 5) {
    return {
      success: false,
      message: 'A substantive justification reason (minimum 5 characters) is required for operational actions.',
      error: 'INSUFFICIENT_JUSTIFICATION',
      nextState: state,
    };
  }

  const actionId = `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let consequences: string[] = [];
  let auditLog = '';
  const affectedEntities: string[] = [trimmedTarget];
  let nextIsolated = [...state.isolatedHostIds];
  const nextLocked = [...state.lockedUserAccounts];
  let nextBlocked = [...state.blockedIndicators];

  switch (actionType) {
    case 'ISOLATE_ENDPOINT': {
      if (nextIsolated.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Endpoint "${trimmedTarget}" is already isolated from the network.`,
          error: 'ALREADY_ISOLATED',
          nextState: state,
        };
      }
      nextIsolated.push(trimmedTarget);
      consequences = [
        `Severed all ingress/egress network connections for ${trimmedTarget}.`,
        'Neutralized ongoing C2 beaconing and prevented potential lateral pivot.',
        `Warning: Legitimate corporate users may experience service disruption on ${trimmedTarget}.`,
      ];
      auditLog = `[${actor}] ISOLATE_ENDPOINT target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'RESTORE_ENDPOINT': {
      if (!nextIsolated.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Endpoint "${trimmedTarget}" is not currently isolated.`,
          error: 'NOT_ISOLATED',
          nextState: state,
        };
      }
      nextIsolated = nextIsolated.filter(id => id !== trimmedTarget);
      consequences = [
        `Restored network interface connectivity for ${trimmedTarget} to clean operational baseline.`,
        'Legitimate internal service access re-enabled.',
      ];
      auditLog = `[${actor}] RESTORE_ENDPOINT target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'DISABLE_ACCOUNT': {
      if (nextLocked.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Account "${trimmedTarget}" is already locked.`,
          error: 'ALREADY_LOCKED',
          nextState: state,
        };
      }
      nextLocked.push(trimmedTarget);
      consequences = [
        `Revoked active Kerberos tickets and invalidated LDAP session tokens for principal "${trimmedTarget}".`,
        'Halts unauthorized command execution via compromised credentials.',
        'Dependent automated batch tasks associated with this account are suspended.',
      ];
      auditLog = `[${actor}] DISABLE_ACCOUNT target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'RESTRICT_ACCOUNT_PERMISSIONS': {
      consequences = [
        `Applied least-privilege IAM profile to "${trimmedTarget}".`,
        'Revoked administrative wildcard privileges; restricted access to read-only knowledge base queries.',
        'SMB hidden share and administrative database access permanently revoked.',
      ];
      auditLog = `[${actor}] RESTRICT_ACCOUNT_PERMISSIONS target=${trimmedTarget} profile="kb-assistant" status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'BLOCK_INDICATOR': {
      // Safety validation: Prevent player from accidentally blocking core gateway or DC
      const protectedIps = ['10.0.4.1', '10.0.4.10', '127.0.0.1'];
      if (protectedIps.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Cannot block protected internal core infrastructure IP: ${trimmedTarget}`,
          error: 'PROTECTED_INFRASTRUCTURE',
          nextState: state,
        };
      }

      if (nextBlocked.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Indicator "${trimmedTarget}" is already blocked at the perimeter firewall.`,
          error: 'ALREADY_BLOCKED',
          nextState: state,
        };
      }

      nextBlocked.push(trimmedTarget);
      consequences = [
        `Installed drop rule on perimeter firewall for indicator "${trimmedTarget}".`,
        `Outbound connections targeting ${trimmedTarget} will be silently discarded (TCP RST / DROP).`,
        'Severed adversary command-and-control uplink without disrupting internal intranet services.',
      ];
      auditLog = `[${actor}] BLOCK_INDICATOR target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'UNBLOCK_INDICATOR': {
      if (!nextBlocked.includes(trimmedTarget)) {
        return {
          success: false,
          message: `Indicator "${trimmedTarget}" is not currently in the perimeter block list.`,
          error: 'NOT_BLOCKED',
          nextState: state,
        };
      }
      nextBlocked = nextBlocked.filter(ioc => ioc !== trimmedTarget);
      consequences = [
        `Removed perimeter drop rule for indicator "${trimmedTarget}".`,
        'Network routing restored.',
      ];
      auditLog = `[${actor}] UNBLOCK_INDICATOR target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'APPLY_CONTAINMENT_POLICY': {
      consequences = [
        `Applied strict micro-segmentation policy to network zone "${trimmedTarget}".`,
        'Restricted inter-VLAN lateral routing; blocked SMB and RPC queries from DMZ to Corporate LAN.',
      ];
      auditLog = `[${actor}] APPLY_CONTAINMENT_POLICY target=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    case 'ESCALATE_INCIDENT': {
      consequences = [
        `Dispatched formal regulatory notification to ${trimmedTarget} (NDSRC National Cyber Directorate).`,
        'Transmitted cryptographic forensic evidence hashes to Krest IR emergency retainer queue.',
      ];
      auditLog = `[${actor}] ESCALATE_INCIDENT destination=${trimmedTarget} status=SUCCESS reason="${trimmedReason}"`;
      break;
    }

    default: {
      return {
        success: false,
        message: `Unknown defensive response action type: ${String(actionType)}`,
        error: 'UNKNOWN_ACTION',
        nextState: state,
      };
    }
  }

  const responseAction: DefensiveResponseAction = {
    id: actionId,
    actionType,
    targetEntityId: trimmedTarget,
    targetLabel: trimmedTarget,
    executedAtSimTime: simTimeSeconds,
    actor,
    reason: trimmedReason,
    isSuccess: true,
    consequences,
    auditLogEntry: auditLog,
    affectedEntityIds: affectedEntities,
  };

  // Update objectives if applicable
  const updatedObjectives = state.objectives.map(obj => {
    if (obj.id === 'obj-m18-execute-response' && !obj.isCompleted) {
      return {
        ...obj,
        isCompleted: true,
        completedAtSimTime: simTimeSeconds,
      };
    }
    return obj;
  });

  const nextState: DefensiveOpsState = {
    ...state,
    executedResponses: [responseAction, ...state.executedResponses],
    isolatedHostIds: nextIsolated,
    lockedUserAccounts: nextLocked,
    blockedIndicators: nextBlocked,
    objectives: updatedObjectives,
  };

  return {
    success: true,
    message: `Defensive response executed successfully: ${actionType} on ${trimmedTarget}`,
    action: responseAction,
    nextState,
  };
}
