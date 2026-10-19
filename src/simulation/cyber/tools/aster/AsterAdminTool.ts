/**
 * Cyberlife — Aster Administrative & Incident Response Tool (`aster-admin`)
 *
 * Provides simulated administrative control and incident management for the
 * Aster Enterprise AI service.
 *
 * SUPPORTED COMMANDS:
 * - `aster-admin status`: Inspects active operational mode, IAM role, and scopes.
 * - `aster-admin policy`: Compares active policy vs least-privilege recommendation.
 * - `aster-admin contain`: Places Aster into CONTAINED mode to isolate storage shares.
 * - `aster-admin remediate --role=kb-assistant`: Applies least-privilege permissions.
 * - `aster-admin verify`: Executes automated recovery verification checks.
 *
 * STRICT SAFETY INVARIANT:
 * Purely simulated in-game commands. Zero external network requests or host commands.
 */

import { CyberTool, CyberToolMetadata, ToolParseResult, AccessControlResult } from '../types';
import { TerminalExecutionContext, TerminalCommandResult } from '../../terminal/types';
import { AsterPolicyRole } from '../../../missions/types';

export interface AsterAdminArgs {
  readonly action: 'status' | 'policy' | 'contain' | 'remediate' | 'verify' | 'help';
  readonly targetRole?: AsterPolicyRole;
}

export interface AsterAdminResult {
  readonly action: string;
  readonly message: string;
  readonly details?: readonly string[];
  readonly educationalGuidance?: string;
  readonly nextCommandRecommendation?: string;
  readonly isError?: boolean;
}

export class AsterAdminTool implements CyberTool<AsterAdminArgs, AsterAdminResult> {
  public readonly metadata: CyberToolMetadata = {
    id: 'aster-admin',
    name: 'aster-admin',
    displayName: 'Aster AI Service Administration & IR Console',
    description:
      'Inspects Aster operational state, manages service IAM policies, executes incident containment, and verifies least-privilege recovery.',
    learningObjective:
      'Teaches how incident responders contain over-privileged services, reconfigure IAM policies to least-privilege, and verify recovery without disrupting legitimate operations.',
    syntax: 'aster-admin <status | policy | contain | remediate --role=kb-assistant | verify>',
    examples: [
      'aster-admin status',
      'aster-admin policy',
      'aster-admin contain',
      'aster-admin remediate --role=kb-assistant',
      'aster-admin verify',
    ],
    requiredTier: 1,
  };

  public parseArgs(args: readonly string[]): ToolParseResult<AsterAdminArgs> {
    if (args.length === 0) {
      return {
        success: true,
        args: { action: 'status' },
      };
    }

    const sub = args[0]?.trim().toLowerCase();

    if (sub === 'status') {
      return { success: true, args: { action: 'status' } };
    }

    if (sub === 'policy') {
      return { success: true, args: { action: 'policy' } };
    }

    if (sub === 'contain') {
      return { success: true, args: { action: 'contain' } };
    }

    if (sub === 'verify') {
      return { success: true, args: { action: 'verify' } };
    }

    if (sub === 'remediate') {
      // Check for --role=... flag
      let targetRole: AsterPolicyRole = 'kb-assistant';
      for (const arg of args.slice(1)) {
        if (arg.startsWith('--role=')) {
          const roleVal = arg.slice(7).trim().toLowerCase();
          if (roleVal === 'kb-assistant' || roleVal === 'corporate-admin') {
            targetRole = roleVal as AsterPolicyRole;
          } else {
            return {
              success: false,
              error: `Invalid role parameter "${roleVal}". Valid options: "kb-assistant" (Least Privilege) or "corporate-admin".`,
            };
          }
        }
      }
      return { success: true, args: { action: 'remediate', targetRole } };
    }

    if (sub === 'help' || sub === '--help' || sub === '-h') {
      return { success: true, args: { action: 'help' } };
    }

    return {
      success: false,
      error: `Unknown aster-admin action "${sub}". Available actions: status, policy, contain, remediate, verify.`,
    };
  }

  public checkAccess(context: TerminalExecutionContext): AccessControlResult {
    const tier = (context.currentUser.accessTier ?? 1) as 1 | 2;
    if (tier < this.metadata.requiredTier) {
      return {
        allowed: false,
        requiredTier: this.metadata.requiredTier,
        reason: 'Requires Tier 1 Security Analyst authorization.',
      };
    }
    return {
      allowed: true,
      requiredTier: this.metadata.requiredTier,
    };
  }

  public execute(args: AsterAdminArgs): AsterAdminResult {
    switch (args.action) {
      case 'status': {
        return {
          action: 'status',
          message: 'ASTER AI CORE SERVICE STATUS (app-portal-01:5050)',
          details: [
            'Daemon Host:         app-portal-01.corp.local (10.0.4.80)',
            'Service Account:     svc-aster@CORP.LOCAL',
            'Service Version:     v1.2.0-cedarline',
            'Operational Mode:    NORMAL (Online)',
            'Assigned IAM Role:   role:corporate-admin [CRITICAL: Over-Privileged]',
            'Granted Scopes:      ["*"] (Unrestricted Wildcard)',
            'SMB Share Mounts:    ENABLED (Mounted: //filesrv-01/dept_shares/finance)',
            'Database Access:     ENABLED (Direct SQL read permissions active)',
            'Health Status:       HEALTHY (HTTP 200 OK)',
          ],
          educationalGuidance:
            'SECURITY FINDING: Aster was designed solely for employee documentation search, yet it holds wildcard admin permissions and active SMB mounts to the finance file server.',
          nextCommandRecommendation:
            "Use 'aster-admin policy' to inspect the policy discrepancy or 'aster-admin contain' to isolate the service.",
        };
      }

      case 'policy': {
        return {
          action: 'policy',
          message: 'ASTER IAM POLICY COMPARISON & LEAST-PRIVILEGE AUDIT',
          details: [
            '--- CURRENT CONFIGURATION (VIOLATION) ---',
            'Role Name:       role:corporate-admin',
            'Scopes:          ["*"] (Wildcard access to all Cedarline internal APIs)',
            'Storage Target:  Unrestricted (Access to filesrv-01, backup shares, payroll)',
            'Database Target: Unrestricted read access',
            '',
            '--- RECOMMENDED LEAST-PRIVILEGE CONFIGURATION ---',
            'Role Name:       role:kb-assistant',
            'Scopes:          ["docs:read", "kb:search"]',
            'Storage Target:  Local knowledge repository only (/var/www/docs)',
            'Database Target: NONE (Database access revoked)',
            'Network Policy:  Inbound port 5050 from internal subnet; egress restricted',
          ],
          educationalGuidance:
            'LEAST PRIVILEGE PRINCIPLE: Applications must only receive the minimum permissions necessary to complete their job. Over-scoped tokens allow simple prompt queries to pivot into file server exfiltration.',
          nextCommandRecommendation:
            "Preserve forensic evidence with 'evidence list', then execute 'aster-admin contain'.",
        };
      }

      case 'contain': {
        return {
          action: 'contain',
          message: 'CONTAINMENT PROCEDURE INITIATED: ASTER AI SERVICE',
          details: [
            'Target Host:         app-portal-01 (10.0.4.80)',
            'Action:              Temporary Network & Storage Isolation',
            'Status:              CONTAINED (Isolated from internal SMB & Database shares)',
            'SMB Shares:          DISMOUNTED (//filesrv-01/dept_shares disconnected)',
            'Database Pool:       CLOSED (All active connection handles terminated)',
            'Diagnostic Port:     Port 5050 bound to localhost for administrative triage',
            'Mitigation Impact:   Active data exfiltration path to filesrv-01 is severed.',
          ],
          educationalGuidance:
            'CONTAINMENT BEST PRACTICE: Containment limits blast radius while preserving system state for analysis. It does NOT fix the root cause. You must still remediate the IAM permissions.',
          nextCommandRecommendation:
            "Apply least-privilege remediation with 'aster-admin remediate --role=kb-assistant'.",
        };
      }

      case 'remediate': {
        if (args.targetRole === 'corporate-admin') {
          return {
            action: 'remediate',
            isError: true,
            message: 'REMEDIATION REJECTED: INVALID LEAST-PRIVILEGE POLICY',
            details: [
              'Attempted Role:  role:corporate-admin',
              'Evaluation:      REJECTED by Cedarline IAM Policy Validator',
              'Reason:          role:corporate-admin grants wildcard scopes [*], which caused the incident.',
            ],
            educationalGuidance:
              'Remediation requires fixing the vulnerability. Reapplying the same admin role maintains the security flaw.',
            nextCommandRecommendation:
              "Run 'aster-admin remediate --role=kb-assistant' to apply the correct least-privilege role.",
          };
        }

        return {
          action: 'remediate',
          message: 'REMEDIATION COMPLETED: LEAST-PRIVILEGE IAM POLICY APPLIED',
          details: [
            'Target Service:      svc-aster on app-portal-01',
            'Previous Role:       role:corporate-admin (Scopes: [*])',
            'New Role:            role:kb-assistant',
            'Enforced Scopes:     ["docs:read", "kb:search"]',
            'SMB Share Mounts:    DISABLED (Unmapped permanently)',
            'Database Scopes:     REVOKED (No SQL query permissions)',
            'Token Rotation:      Compromised token revoked; new scoped token generated',
            'Audit Log:           Policy change recorded on mon-siem-01',
          ],
          educationalGuidance:
            'PROPER REMEDIATION: The service account now possesses only the exact permissions needed for employee document search. It can no longer query filesrv-01 or databases even if prompted.',
          nextCommandRecommendation:
            "Run 'aster-admin verify' to execute the automated verification test suite.",
        };
      }

      case 'verify': {
        return {
          action: 'verify',
          message: 'ASTER RECOVERY & ACCESS VERIFICATION SUITE',
          details: [
            '[TEST 1] Legitimate Knowledge-Base Search (docs:read):      PASS (HTTP 200)',
            '[TEST 2] Departmental File Server SMB Access (filesrv-01):   PASS (HTTP 403 FORBIDDEN)',
            '[TEST 3] Executive Database SQL Query Access:               PASS (ACCESS_DENIED)',
            '[TEST 4] Least-Privilege IAM Conformance (kb-assistant):    PASS (Verified on SIEM)',
            '',
            'OVERALL RECOVERY STATUS: ALL 4 SECURITY CONTROLS VERIFIED',
          ],
          educationalGuidance:
            'VERIFICATION PRINCIPLE: Always test that (1) legitimate functionality works, and (2) unauthorized actions are blocked. Never assume remediation worked without testing both sides.',
          nextCommandRecommendation:
            'Open the Incident Portal or Notes app to compile your final Incident Response Report.',
        };
      }

      case 'help':
      default: {
        return {
          action: 'help',
          message: 'ASTER AI SERVICE ADMINISTRATION COMMANDS',
          details: [
            'aster-admin status                      Inspect current operational mode and IAM role',
            'aster-admin policy                      Compare active policy vs least-privilege baseline',
            'aster-admin contain                     Execute temporary service and network containment',
            'aster-admin remediate --role=kb-assistant  Enforce least-privilege IAM policy',
            'aster-admin verify                      Run recovery verification test suite',
          ],
        };
      }
    }
  }

  public formatOutput(
    result: AsterAdminResult,
    _args: AsterAdminArgs,
    context: TerminalExecutionContext
  ): TerminalCommandResult {
    const lines: string[] = [];
    const banner = result.isError
      ? '================================================================================\n  [!] ' +
        result.message +
        '\n================================================================================'
      : '================================================================================\n  [*] ' +
        result.message +
        '\n================================================================================';

    lines.push(banner);

    if (result.details && result.details.length > 0) {
      lines.push(...result.details);
    }

    if (result.educationalGuidance) {
      lines.push('');
      lines.push('--- [ EDUCATIONAL GUIDANCE ] -------------------------------------------');
      lines.push(result.educationalGuidance);
    }

    if (result.nextCommandRecommendation) {
      lines.push('');
      lines.push(`>> SUGGESTED NEXT STEP: ${result.nextCommandRecommendation}`);
    }

    lines.push('');
    lines.push(
      `Console: ${context.currentUser.username}@${context.workstation.hostname} // Time: ${context.simulationTime.timeString}`
    );

    return {
      stdout: lines,
      isError: Boolean(result.isError),
    };
  }
}
