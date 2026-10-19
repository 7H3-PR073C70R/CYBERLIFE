/**
 * Cyberlife — Cyber Tool Command Adapter & Registry
 *
 * Bridges CyberTool implementations into the TerminalCommandHandler contract.
 * Enforces input boundaries, access control, error reporting, and simulation safety.
 */

import { CyberTool } from './types';
import {
  TerminalCommandHandler,
  TerminalCommandResult,
  TerminalExecutionContext,
} from '../terminal/types';
import { NetmapTool } from './netmap/NetmapTool';
import { SvcscanTool } from './svcscan/SvcscanTool';
import { LogviewTool } from './logview/LogviewTool';
import { EvidenceTool } from './evidence/EvidenceTool';

const MAX_INPUT_ARGS = 20;

/**
 * Creates a TerminalCommandHandler adapter for a typed CyberTool.
 */
export function createToolCommandHandler<TArgs, TResult>(
  tool: CyberTool<TArgs, TResult>
): TerminalCommandHandler {
  return {
    name: tool.metadata.name,
    description: tool.metadata.description,
    usage: tool.metadata.syntax,
    execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
      // 1. Boundary guard: excessive argument count
      if (args.length > MAX_INPUT_ARGS) {
        return {
          isError: true,
          stdout: [
            `Error: Too many arguments supplied to '${tool.metadata.name}' (${args.length} arguments).`,
            `Input limit is ${MAX_INPUT_ARGS} arguments. Type 'help ${tool.metadata.name}' for syntax.`,
          ],
        };
      }

      // 2. Argument parsing and validation
      const parseResult = tool.parseArgs(args);
      if (!parseResult.success) {
        const lines = [`Syntax error: ${parseResult.error}`];
        if (parseResult.hint) {
          lines.push(parseResult.hint);
        }
        lines.push(`Usage: ${tool.metadata.syntax}`);
        return {
          isError: true,
          stdout: lines,
        };
      }

      // 3. Simulated Access-Control Check
      const accessResult = tool.checkAccess(context, parseResult.args);
      if (!accessResult.allowed) {
        return {
          isError: true,
          stdout: [
            '==============================================================',
            '  ACCESS RESTRICTION // ACCESS CONTROL DENIED',
            '==============================================================',
            `  Operation:          ${tool.metadata.name.toUpperCase()} ${args.join(' ')}`,
            `  Current User:       ${context.currentUser.username} (${context.currentUser.role})`,
            `  Required Clearance: Tier ${accessResult.requiredTier ?? 2}`,
            '--------------------------------------------------------------',
            `  Reason:             ${accessResult.reason ?? 'Insufficient privilege level for this in-game resource.'}`,
            '--------------------------------------------------------------',
            '  Guidance: Review the Field Guide under "Security Concepts -> IAM"',
            '  for information regarding role-based access control (RBAC).',
            '==============================================================',
          ],
        };
      }

      // 4. Deterministic execution
      try {
        const result = tool.execute(parseResult.args, context);
        return tool.formatOutput(result, parseResult.args, context);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          stdout: [
            `Tool execution error in '${tool.metadata.name}': ${message}`,
            "Please check command syntax with 'help " + tool.metadata.name + "'.",
          ],
        };
      }
    },
  };
}

/**
 * Returns instantiated instances of all 4 milestone 5 cybersecurity tools.
 */
export function createDefaultCyberTools(): readonly CyberTool[] {
  return [new NetmapTool(), new SvcscanTool(), new LogviewTool(), new EvidenceTool()];
}
