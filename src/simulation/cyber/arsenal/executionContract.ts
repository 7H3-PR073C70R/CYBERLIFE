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
