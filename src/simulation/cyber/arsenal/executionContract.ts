/**
 * Cyberlife — Simulated Cybersecurity Tool Execution Contract
 *
 * Defines the safe, deterministic execution pipeline for simulated tools.
 * Enforces input schema validation, clearance boundaries, prerequisite checks,
 * structured evidence emission, and explicit reporting of unsupported features.
 *
 * SAFETY INVARIANT:
 * Zero access to host processes, real network sockets, or filesystem eval.
 * Pure deterministic execution over the shared fictional cyber range.
 */

import { CyberToolDefinition, SupportedWorkflow } from './types';
import { FictionalCyberRange, FictionalEvidenceItem } from '../range/types';
import { SHARED_CYBER_RANGE } from '../range/fixtures';
import { ExploitLabEngine } from '../offensive/ExploitLabEngine';
import { WebProxyEngine } from '../webproxy/WebProxyEngine';
import { SocialPretextEngine } from '../social/SocialPretextEngine';

export interface ToolExecutionUser {
  readonly username: string;
  readonly role: string;
  readonly clearanceTier: 1 | 2;
  readonly completedPrerequisites?: readonly string[];
}

export interface ToolExecutionContext {
  readonly currentUser: ToolExecutionUser;
  readonly range: FictionalCyberRange;
  readonly timestamp: string;
  readonly activeIncidentId?: string;
  readonly roeAccepted?: boolean;
}

export interface ToolExecutionError {
  readonly code:
    | 'INVALID_INPUT'
    | 'INSUFFICIENT_CLEARANCE'
    | 'UNMET_PREREQUISITE'
    | 'ROE_NOT_ACCEPTED'
    | 'TOOL_NOT_PLAYABLE'
    | 'WORKFLOW_NOT_FOUND'
    | 'EXECUTION_FAILED';
  readonly message: string;
  readonly hint?: string;
  readonly details?: unknown;
}

export interface ToolExecutionResult {
  readonly success: boolean;
  readonly toolId: string;
  readonly workflowId: string;
  readonly executionTime: string;
  readonly outputLines: readonly string[];
  readonly structuredData?: unknown;
  readonly educationalExplanation?: string;
  readonly emittedEvidence?: readonly FictionalEvidenceItem[];
  readonly error?: ToolExecutionError;
  readonly unsupportedFeatures?: readonly string[];
}

/**
 * Validates provided parameters against a tool's input schema.
 */
export function validateToolInput(
  tool: CyberToolDefinition,
  params: Record<string, unknown>
): { valid: boolean; error?: ToolExecutionError } {
  const schema = tool.inputSchema;

  // 1. Argument count checks
  const paramKeys = Object.keys(params);
  if (schema.minArgs !== undefined && paramKeys.length < schema.minArgs) {
    return {
      valid: false,
      error: {
        code: 'INVALID_INPUT',
        message: `Tool '${tool.shortName}' requires at least ${schema.minArgs} argument(s), but received ${paramKeys.length}.`,
        hint: `Check command syntax with: ${tool.commandSpec?.syntax ?? 'help'}`,
      },
    };
  }

  if (schema.maxArgs !== undefined && paramKeys.length > schema.maxArgs) {
    return {
      valid: false,
      error: {
        code: 'INVALID_INPUT',
        message: `Too many arguments provided to '${tool.shortName}' (${paramKeys.length} > ${schema.maxArgs}).`,
        hint: `Max allowed arguments is ${schema.maxArgs}.`,
      },
    };
  }

  // 2. Positional & argument rule validation
  if (schema.positional) {
    for (const rule of schema.positional) {
      const val = params[rule.name];
      if (rule.required && (val === undefined || val === null || val === '')) {
        return {
          valid: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Missing required parameter '${rule.name}'.`,
            hint: rule.description,
          },
        };
      }

      if (val !== undefined && val !== null) {
        if (rule.type === 'number' && typeof val !== 'number') {
          return {
            valid: false,
            error: {
              code: 'INVALID_INPUT',
              message: `Parameter '${rule.name}' must be a number, received ${typeof val}.`,
            },
          };
        }

        if (rule.type === 'choice' && rule.choices && !rule.choices.includes(String(val))) {
          return {
            valid: false,
            error: {
              code: 'INVALID_INPUT',
              message: `Invalid value '${val}' for '${rule.name}'.`,
              hint: `Allowed choices: ${rule.choices.join(', ')}`,
            },
          };
        }

        if (rule.type === 'port') {
          const num = Number(val);
          if (isNaN(num) || num < 1 || num > 65535) {
            return {
              valid: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Port '${val}' is out of range. Must be between 1 and 65535.`,
              },
            };
          }
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Validates security constraints, clearance tiers, and prerequisite dependencies.
 */
export function checkToolPrerequisites(
  tool: CyberToolDefinition,
  context: ToolExecutionContext
): { allowed: boolean; error?: ToolExecutionError } {
  // 1. Capability status check — only 'playable' tools can execute workflows
  if (tool.status !== 'playable') {
    return {
      allowed: false,
      error: {
        code: 'TOOL_NOT_PLAYABLE',
        message: `Tool '${tool.name}' is currently marked as '${tool.status}'.`,
        hint:
          tool.status === 'partial'
            ? 'This tool is partially implemented. Review the Cyber Catalogue or Field Guide for available features.'
            : 'This capability is on the project roadmap. Live execution is not yet implemented.',
      },
    };
  }

  // 2. Clearance tier enforcement
  if (context.currentUser.clearanceTier < tool.requiredClearanceTier) {
    return {
      allowed: false,
      error: {
        code: 'INSUFFICIENT_CLEARANCE',
        message: `Access Denied: Tool requires Clearance Tier ${tool.requiredClearanceTier}, but user '${context.currentUser.username}' has Tier ${context.currentUser.clearanceTier}.`,
        hint: 'Complete junior analyst assignments in the Career Hub to advance your clearance tier.',
      },
    };
  }

  // 3. Rules of Engagement check for attack simulation tools
  if (tool.safetyConstraints.includes('roe_enforced') && !context.roeAccepted) {
    return {
      allowed: false,
      error: {
        code: 'ROE_NOT_ACCEPTED',
        message:
          'Rules of Engagement (#ROE-2026-AST) must be accepted before launching offensive simulations.',
        hint: 'Review and accept the Rules of Engagement inside the Cyber Catalogue Red Team lab.',
      },
    };
  }

  // 4. Missing prerequisite modules or tools
  if (tool.prerequisites.length > 0 && context.currentUser.completedPrerequisites) {
    const unmet = tool.prerequisites.filter(
      p => !context.currentUser.completedPrerequisites?.includes(p)
    );
    if (unmet.length > 0) {
      return {
        allowed: false,
        error: {
          code: 'UNMET_PREREQUISITE',
          message: `Unmet prerequisite(s) for '${tool.shortName}': ${unmet.join(', ')}.`,
          hint: 'Complete prerequisite learning modules in the Cyber Catalogue.',
          details: { unmetPrerequisites: unmet },
        },
      };
    }
  }

  return { allowed: true };
}

/**
 * Standardized execution entry point for any tool workflow.
 * Guaranteed to never throw; errors are captured in the structured result.
 */
export function executeToolWorkflow(
  tool: CyberToolDefinition,
  workflowId: string,
  params: Record<string, unknown>,
  context?: Partial<ToolExecutionContext>
): ToolExecutionResult {
  const fullContext: ToolExecutionContext = {
    currentUser: context?.currentUser ?? {
      username: 'analyst',
      role: 'Tier 1 Analyst',
      clearanceTier: 1,
    },
    range: context?.range ?? SHARED_CYBER_RANGE,
    timestamp: context?.timestamp ?? new Date().toISOString(),
    activeIncidentId: context?.activeIncidentId,
    roeAccepted: context?.roeAccepted ?? false,
  };

  // 1. Find workflow
  const workflow: SupportedWorkflow | undefined = tool.supportedWorkflows.find(
    w => w.id === workflowId
  );
  if (!workflow) {
    return {
      success: false,
      toolId: tool.id,
      workflowId,
      executionTime: fullContext.timestamp,
      outputLines: [`Error: Workflow '${workflowId}' not recognized for tool '${tool.id}'.`],
      error: {
        code: 'WORKFLOW_NOT_FOUND',
        message: `Workflow '${workflowId}' is not defined in '${tool.name}'.`,
        hint: `Available workflows: ${tool.supportedWorkflows.map(w => w.id).join(', ')}`,
      },
    };
  }

  // 2. Prerequisite & status check
  const prereqCheck = checkToolPrerequisites(tool, fullContext);
  if (!prereqCheck.allowed) {
    return {
      success: false,
      toolId: tool.id,
      workflowId,
      executionTime: fullContext.timestamp,
      outputLines: [`Execution blocked: ${prereqCheck.error?.message}`],
      error: prereqCheck.error,
    };
  }

  // 3. Input validation
  const inputCheck = validateToolInput(tool, params);
  if (!inputCheck.valid) {
    return {
      success: false,
      toolId: tool.id,
      workflowId,
      executionTime: fullContext.timestamp,
      outputLines: [`Input validation failed: ${inputCheck.error?.message}`],
      error: inputCheck.error,
    };
  }

  // 4. Deterministic workflow execution based on tool category and workflow action
  try {
    return dispatchWorkflowToRange(tool, workflow, params, fullContext);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      toolId: tool.id,
      workflowId,
      executionTime: fullContext.timestamp,
      outputLines: [`Internal simulation error executing workflow '${workflowId}': ${errorMsg}`],
      error: {
        code: 'EXECUTION_FAILED',
        message: errorMsg,
      },
    };
  }
}

/**
 * Dispatches the validated workflow against the fictional cyber range.
 */
function dispatchWorkflowToRange(
  tool: CyberToolDefinition,
  workflow: SupportedWorkflow,
  params: Record<string, unknown>,
  context: ToolExecutionContext
): ToolExecutionResult {
  const outLines: string[] = [];
  let structuredData: unknown = null;
  let emittedEvidence: FictionalEvidenceItem[] | undefined;
  const unsupportedFeatures: string[] = [];

  switch (tool.id) {
    case 'tool_netmap': {
      const subnetTarget = (params.target as string) || '10.0.4.0/24';
      const hosts = context.range.hosts.filter(h => h.status === 'UP');
      outLines.push(`[+] EkoSec Netmap v4.5 // Subnet discovery: ${subnetTarget}`);
      outLines.push(
        `[+] Probed 256 addresses on ${subnetTarget}. Discovered ${hosts.length} live nodes.`
      );
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      outLines.push('IP ADDRESS      MAC ADDRESS         ROLE                   HOSTNAME');
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      for (const h of hosts) {
        outLines.push(
          `${h.ipAddress.padEnd(16)}${h.macAddress.padEnd(20)}${h.role.padEnd(23)}${h.hostname}`
        );
      }
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      structuredData = hosts;
      break;
    }

    case 'tool_svcscan': {
      const target = (params.target as string) || '10.0.4.50';
      const host = context.range.hosts.find(
        h => h.ipAddress === target || h.id === target || h.hostname === target
      );
      if (!host) {
        return {
          success: false,
          toolId: tool.id,
          workflowId: workflow.id,
          executionTime: context.timestamp,
          outputLines: [`Host discovery failed: target '${target}' is unreachable or down.`],
          error: {
            code: 'EXECUTION_FAILED',
            message: `Target '${target}' was not found in active subnet inventory.`,
          },
        };
      }
      const services = context.range.services.filter(s => s.hostId === host.id);
      outLines.push(`[+] EkoSec SvcScan // Target: ${host.hostname} (${host.ipAddress})`);
      outLines.push(`[+] ${services.length} open listener service(s) detected.`);
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      outLines.push('PORT/PROTO   SERVICE       PRODUCT & VERSION                 STATUS');
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      for (const s of services) {
        const portProto = `${s.port}/${s.protocol}`.padEnd(13);
        const name = s.serviceName.padEnd(14);
        const prodVer = `${s.product} ${s.version}`.padEnd(34);
        const status = s.approved ? 'APPROVED' : 'UNAPPROVED/FLAGGED';
        outLines.push(`${portProto}${name}${prodVer}${status}`);
      }
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      structuredData = services;
      break;
    }

    case 'tool_evidence': {
      const evidenceList = context.range.evidenceItems;
      outLines.push(
        `[+] EkoSec Evidence Vault // Ledger status: ${evidenceList.length} items catalogued.`
      );
      outLines.push(
        '--------------------------------------------------------------------------------'
      );
      for (const ev of evidenceList) {
        outLines.push(`[${ev.id}] ${ev.title}`);
        outLines.push(`    SHA-256: ${ev.hashSha256}`);
        outLines.push(`    Integrity: ${ev.integrityStatus} | Acquired: ${ev.collectionTime}`);
      }
      structuredData = evidenceList;
      emittedEvidence = [...evidenceList];
      break;
    }

    case 'tool_exploit_lab': {
      const engine = new ExploitLabEngine();
      const targetId = (params.target as string) || 'filesrv-01';
      const moduleId = (params.module as string) || 'mod_smb_tree_hijack';
      const mode =
        (params.mode as 'dry_run' | 'simulation') ||
        (workflow.id.includes('dryrun') ? 'dry_run' : 'simulation');

      if (workflow.id === 'workflow_exploit_scope_review') {
        const roe = engine.getActiveEngagement();
        const targets = engine.getTargets();
        outLines.push(
          `[+] Exploit Lab // Engagement Scope: ${roe.engagementId} (${roe.clientName})`
        );
        outLines.push(
          `[+] Assessor: ${roe.authorizedAssessorName} | Status: ${roe.isSignedAndActive ? 'ACTIVE / AUTHORIZED' : 'EXPIRED'}`
        );
        outLines.push('Authorized In-Scope Targets:');
        for (const t of targets) {
          outLines.push(
            `  - ${t.id.padEnd(14)} (${t.ipAddress}) [${t.primaryService}] - Vulnerable: ${t.isVulnerable ? 'YES' : 'NO'}`
          );
        }
        structuredData = { roe, targets };
        break;
      }

      if (workflow.id === 'workflow_exploit_retest') {
        const retestResult = engine.retestTarget(targetId, moduleId, context.currentUser.username);
        outLines.push(...retestResult.executionLogs);
        structuredData = retestResult;
        if (retestResult.evidenceItem) {
          emittedEvidence = [retestResult.evidenceItem];
        }
        break;
      }

      const execResult = engine.executeModule({
        targetId,
        moduleId,
        mode,
        actorName: context.currentUser.username,
      });
      outLines.push(...execResult.executionLogs);
      structuredData = execResult;
      if (execResult.evidenceItem) {
        emittedEvidence = [execResult.evidenceItem];
      }
      break;
    }

    case 'tool_web_proxy': {
      const engine = new WebProxyEngine();
      const txId = (params.transactionId as string) || 'tx-001';

      if (workflow.id === 'workflow_proxy_browse') {
        const txs = engine.getTransactions();
        outLines.push(
          `[+] Web Application Security Proxy // Synthetic Transaction History (${txs.length} captured)`
        );
        outLines.push(
          '--------------------------------------------------------------------------------'
        );
        outLines.push('ID      METHOD   STATUS   PATH                             TAGS');
        outLines.push(
          '--------------------------------------------------------------------------------'
        );
        for (const tx of txs) {
          outLines.push(
            `${tx.id.padEnd(8)}${tx.originalRequest.method.padEnd(9)}${String(tx.originalResponse.statusCode).padEnd(9)}${tx.originalRequest.path.padEnd(33)}${tx.tags.join(', ')}`
          );
        }
        structuredData = txs;
        break;
      }

      const tx = engine.getTransaction(txId);
      if (!tx) {
        outLines.push(`[-] Error: Transaction '${txId}' not found in proxy buffer.`);
        break;
      }

      outLines.push(
        `[+] Web Proxy Inspector // Transaction: ${tx.id} [${tx.originalRequest.method} ${tx.originalRequest.path}]`
      );
      outLines.push(`Target: ${tx.targetHost}:${tx.targetPort} (${tx.appId})`);
      outLines.push(`Request Headers:`);
      for (const [k, v] of Object.entries(tx.originalRequest.headers)) {
        outLines.push(`  ${k}: ${v}`);
      }
      outLines.push(
        `Response: ${tx.originalResponse.statusCode} ${tx.originalResponse.statusText}`
      );
      outLines.push(`Response Body:`);
      outLines.push(tx.originalResponse.body);
      structuredData = tx;
      if (tx.evidenceItem) {
        emittedEvidence = [tx.evidenceItem];
      }
      break;
    }

    case 'tool_social_eng': {
      const engine = new SocialPretextEngine();
      const scenarioId = (params.scenario as string) || 'scen_reception_courier';

      if (workflow.id === 'workflow_social_scenarios') {
        const scenarios = engine.getAllScenarios();
        outLines.push(`[+] Social Pretexting Lab // 6 Authored Scenarios`);
        outLines.push(
          '--------------------------------------------------------------------------------'
        );
        for (const s of scenarios) {
          outLines.push(`[${s.id}] ${s.title}`);
          outLines.push(
            `  Venue: ${s.venueLabel} | Target: ${s.targetNpc.name} (${s.targetNpc.title})`
          );
        }
        structuredData = scenarios;
        break;
      }

      const session = engine.startEncounter(scenarioId);
      const scenario = engine.getScenario(scenarioId);
      outLines.push(`[+] Starting Pretext Encounter: ${scenario?.title ?? scenarioId}`);
      outLines.push(`Briefing: ${scenario?.situationBriefing}`);
      outLines.push(
        `Initial Trust Metrics: Trust=${session.metrics.trust}, Credibility=${session.metrics.credibility}, Authority=${session.metrics.authority}, Suspicion=${session.metrics.suspicion}`
      );
      structuredData = session;
      break;
    }

    default: {
      outLines.push(
        `[+] Workflow '${workflow.name}' executed on simulated tool '${tool.shortName}'.`
      );
      outLines.push(`[i] Educational simulation response for target parameters.`);
      structuredData = { toolId: tool.id, workflow: workflow.id, params };
      break;
    }
  }

  return {
    success: true,
    toolId: tool.id,
    workflowId: workflow.id,
    executionTime: context.timestamp,
    outputLines: outLines,
    structuredData,
    educationalExplanation: tool.learningObjectives[0]?.description,
    emittedEvidence,
    unsupportedFeatures: unsupportedFeatures.length > 0 ? unsupportedFeatures : undefined,
  };
}
