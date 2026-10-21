/**
 * Cyberlife — Milestone 19: Centralized Contract Authorization Gate & Scope Enforcer
 *
 * Enforces strict authorization policies inside the simulation domain layer.
 * All freelance security actions must pass through this gate:
 * - Unaccepted contracts cannot perform technical actions.
 * - Out-of-scope targets are strictly blocked and audited.
 * - Prohibited actions (e.g. destructive commands, unverified third-party probing) are rejected.
 * - Ambiguous scopes require explicit professional clarification before affected actions proceed.
 * - Expired contracts cannot perform new operations.
 *
 * STRICT SAFETY INVARIANT:
 * 100% in-memory verification. Never contacts external services or runs real host commands.
 */

import {
  ActiveContractState,
  BountyContract,
  ContractAuditEvent,
} from './types';

export interface ScopeEvaluationResult {
  readonly isAuthorized: boolean;
  readonly decision:
    | 'AUTHORIZED'
    | 'BLOCKED_OUT_OF_SCOPE'
    | 'BLOCKED_PROHIBITED'
    | 'BLOCKED_AMBIGUOUS_SCOPE'
    | 'BLOCKED_UNAUTHORIZED'
    | 'BLOCKED_EXPIRED';
  readonly reason: string;
  readonly auditEvent: ContractAuditEvent;
}

export class ContractAuthorizationGate {
  /**
   * Authoritatively evaluates whether an attempted action against a target complies
   * with the active contract scope, authorized asset inventory, and Rules of Engagement.
   */
  public static evaluateAction(
    contract: BountyContract,
    activeContract: ActiveContractState | undefined,
    targetAssetId: string,
    actionName: string,
    actionCategory: string = 'GENERIC_SECURITY_ACTION',
    currentSimTime: number = 0
  ): ScopeEvaluationResult {
    const eventId = `audit-${currentSimTime}-${Math.random().toString(36).substring(2, 8)}`;

    // 1. Must have an active contract
    if (!activeContract || activeContract.contractId !== contract.id) {
      const reason =
        'UNAUTHORIZED: No active contract acceptance found. Technical operations require a formally accepted contract agreement.';
      return {
        isAuthorized: false,
        decision: 'BLOCKED_UNAUTHORIZED',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: targetAssetId,
          decision: 'BLOCKED_OUT_OF_SCOPE',
          details: reason,
          violationRecorded: true,
        },
      };
    }

    // 2. Deadline check
    if (activeContract.deadlineSimTime && currentSimTime > activeContract.deadlineSimTime) {
      const reason = `CONTRACT EXPIRED: The agreed performance deadline for contract '${contract.title}' has expired. Technical actions are suspended.`;
      return {
        isAuthorized: false,
        decision: 'BLOCKED_EXPIRED',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: targetAssetId,
          decision: 'BLOCKED_OUT_OF_SCOPE',
          details: reason,
          violationRecorded: false,
        },
      };
    }

    // 3. Ambiguous scope check (e.g. Apex contract)
    if (contract.scope.hasScopeAmbiguity && !activeContract.scopeClarified) {
      // If the action is specifically to clarify scope, that is always authorized!
      if (actionName.toLowerCase().includes('clarify')) {
        return {
          isAuthorized: true,
          decision: 'AUTHORIZED',
          reason: 'Scope clarification review is authorized.',
          auditEvent: {
            id: eventId,
            timestampSimTime: currentSimTime,
            actionName,
            targetResource: targetAssetId,
            decision: 'AUTHORIZED',
            details: 'Operator opened formal scope clarification review.',
            violationRecorded: false,
          },
        };
      }

      // Any technical action attempted while scope ambiguity is unresolved is blocked
      const reason =
        'STRICT POLICY BLOCKED: Ambiguous contract scope detected. Client request contains conflicting instructions or unconfirmed tenant boundaries. You must formally clarify scope before proceeding with technical operations.';
      return {
        isAuthorized: false,
        decision: 'BLOCKED_AMBIGUOUS_SCOPE',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: targetAssetId,
          decision: 'BLOCKED_AMBIGUOUS_SCOPE',
          details: reason,
          violationRecorded: true,
        },
      };
    }

    // 4. Target Asset Scope Check
    const target = contract.scope.authorizedTargets.find(
      t => t.id.toLowerCase() === targetAssetId.toLowerCase()
    );

    if (!target) {
      // Check if it's explicitly in out-of-scope list
      const isExplicitlyOutOfScope = contract.scope.outOfScopeTargets.some(
        excluded => excluded.toLowerCase().includes(targetAssetId.toLowerCase())
      );

      const reason = isExplicitlyOutOfScope
        ? `STRICTLY OUT OF SCOPE: Fictional resource '${targetAssetId}' is explicitly listed as OUT OF SCOPE in contract Terms of Engagement. Operation prohibited.`
        : `TARGET UNLISTED: Fictional asset identifier '${targetAssetId}' is not registered in the authorized client target inventory. Operation rejected.`;

      return {
        isAuthorized: false,
        decision: 'BLOCKED_OUT_OF_SCOPE',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: targetAssetId,
          decision: 'BLOCKED_OUT_OF_SCOPE',
          details: reason,
          violationRecorded: true,
        },
      };
    }

    if (!target.inScope) {
      const reason = `OUT OF SCOPE: Asset '${target.hostname}' (${target.ipAddress}) is designated as OUT OF SCOPE (${target.scopeJustification}). Intrusive testing is strictly prohibited.`;
      return {
        isAuthorized: false,
        decision: 'BLOCKED_OUT_OF_SCOPE',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: target.id,
          decision: 'BLOCKED_OUT_OF_SCOPE',
          details: reason,
          violationRecorded: true,
        },
      };
    }

    // 5. Prohibited Actions Check
    const isProhibitedByContract = contract.scope.prohibitedActions.some(
      prohibited =>
        actionName.toLowerCase().includes(prohibited.toLowerCase()) ||
        actionCategory.toLowerCase().includes(prohibited.toLowerCase())
    );

    const isProhibitedByTarget = target.prohibitedActions.some(
      prohibited =>
        actionName.toLowerCase().includes(prohibited.toLowerCase()) ||
        actionCategory.toLowerCase().includes(prohibited.toLowerCase())
    );

    if (isProhibitedByContract || isProhibitedByTarget) {
      const reason = `PROHIBITED ACTION: Action '${actionName}' matches prohibited technique rules in contract Rules of Engagement. Action rejected to protect system stability.`;
      return {
        isAuthorized: false,
        decision: 'BLOCKED_PROHIBITED',
        reason,
        auditEvent: {
          id: eventId,
          timestampSimTime: currentSimTime,
          actionName,
          targetResource: target.id,
          decision: 'BLOCKED_PROHIBITED',
          details: reason,
          violationRecorded: true,
        },
      };
    }

    // 6. Action is fully authorized!
    return {
      isAuthorized: true,
      decision: 'AUTHORIZED',
      reason: `Action '${actionName}' against target '${target.hostname}' is explicitly authorized under active contract scope.`,
      auditEvent: {
        id: eventId,
        timestampSimTime: currentSimTime,
        actionName,
        targetResource: target.id,
        decision: 'AUTHORIZED',
        details: `Authorized execution against ${target.hostname}:${target.port} (${target.serviceName}).`,
        violationRecorded: false,
      },
    };
  }
}
