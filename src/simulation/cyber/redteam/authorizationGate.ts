/**
 * Cyberlife — Milestone 17: Centralized Rules of Engagement & Scope Authorization Gate
 *
 * Enforces strict authorization policies inside the simulation domain layer.
 * All assessment actions (whether triggered via UI, Terminal CLI, or script)
 * must pass through this domain gate. Out-of-scope or prohibited actions
 * are rejected deterministically, generate audit logs, and leave protected state unchanged.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory verification. Never contacts external services or runs host commands.
 */

import {
  RedTeamAssessmentState,
  ScopeEvaluationResult,
  ActionCategory,
} from './types';

export class RedTeamAuthorizationGate {
  /**
   * Authoritatively evaluates whether an attempted assessment action against a target
   * complies with the active Rules of Engagement (RoE) and written scope boundaries.
   */
  public static evaluateScope(
    state: RedTeamAssessmentState,
    targetId: string,
    actionCategory: ActionCategory,
    specificActionName: string = actionCategory,
    currentSimTime: number = 0
  ): ScopeEvaluationResult {
    const { roe, isAcceptedByPlayer, targets } = state;

    // 1. Mandatory Operator Acceptance Invariant
    if (!isAcceptedByPlayer) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_UNAUTHORIZED',
        reason:
          'UNAUTHORIZED: The written Rules of Engagement (RoE) have not been formally accepted and signed by the assessor. All technical assessment actions are locked until scope acceptance.',
        targetedResource: targetId,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // 2. RoE Validity / Active Window Check
    if (!roe.isSignedAndActive) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_EXPIRED',
        reason: `AUTHORIZATION EXPIRED: The Rules of Engagement mandate for assessment ${roe.assessmentId} has expired or been revoked by ${roe.authorizingOfficial}.`,
        targetedResource: targetId,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // 3. Target Asset Inventory Resolution
    const target = targets.find(t => t.id.toLowerCase() === targetId.toLowerCase());
    if (!target) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_OUT_OF_SCOPE',
        reason: `TARGET OUT OF SCOPE: Fictional resource identifier '${targetId}' is not registered in the authorized client target inventory. Operation rejected.`,
        targetedResource: targetId,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // 4. In-Scope vs Out-of-Scope Enforcement
    if (!target.inScope) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_OUT_OF_SCOPE',
        reason: `STRICTLY OUT OF SCOPE: Asset '${target.hostname}' (${target.ipAddress}) is explicitly designated as OUT OF SCOPE (${target.scopeJustification}). Intrusive testing is strictly prohibited by authorization policy.`,
        targetedResource: target.id,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // 5. Explicit Prohibited Techniques Guard
    const isProhibitedByRoe = roe.prohibitedActions.some(
      prohibited =>
        specificActionName.toLowerCase().includes(prohibited.toLowerCase()) ||
        actionCategory.toLowerCase().includes(prohibited.toLowerCase())
    );

    const isProhibitedByTarget = target.prohibitedActions.some(
      prohibited =>
        specificActionName.toLowerCase().includes(prohibited.toLowerCase()) ||
        actionCategory.toLowerCase().includes(prohibited.toLowerCase())
    );

    if (isProhibitedByRoe || isProhibitedByTarget) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_PROHIBITED',
        reason: `PROHIBITED ACTION: Technique '${specificActionName}' violates the signed Rules of Engagement. Destructive testing, credential brute-forcing, and denial-of-service are explicitly forbidden under contract terms.`,
        targetedResource: target.id,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // 6. Action Category Permission Check
    const isCategoryPermittedByRoe = roe.allowedActionCategories.includes(actionCategory);
    const isCategoryPermittedByTarget = target.allowedActionCategories.includes(actionCategory);

    if (!isCategoryPermittedByRoe || !isCategoryPermittedByTarget) {
      return {
        isAuthorized: false,
        decision: 'BLOCKED_UNAUTHORIZED',
        reason: `UNPERMITTED ACTION CATEGORY: Action category '${actionCategory}' is not authorized for target asset '${target.hostname}'. Permitted categories: [${target.allowedActionCategories.join(', ')}].`,
        targetedResource: target.id,
        attemptedAction: specificActionName,
        actionCategory,
        timestampSimTime: currentSimTime,
      };
    }

    // All Authorization Gates Passed Cleanly
    return {
      isAuthorized: true,
      decision: 'AUTHORIZED',
      reason: `AUTHORIZED: Target '${target.hostname}' (${target.ipAddress}) is in active assessment scope. Technique '${specificActionName}' complies with signed Rules of Engagement.`,
      targetedResource: target.id,
      attemptedAction: specificActionName,
      actionCategory,
      timestampSimTime: currentSimTime,
    };
  }
}
