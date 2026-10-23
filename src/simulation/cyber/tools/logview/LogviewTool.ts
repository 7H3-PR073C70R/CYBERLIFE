/**
 * Cyberlife — Simulated Log Analysis Tool (`logview`)
 *
 * Inspects and filters security and operational event logs from fictional systems.
 * Uses the authoritative simulation calendar clock to anchor relative times.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches players how to triage security logs:
 * 1. Distinguish high-volume operational events from indicators of concern.
 * 2. Understand severity levels (INFO, NOTICE, WARN, ERROR).
 * 3. Never label a single failed login or service error as an "attack" without correlation.
 */

import {
  CyberTool,
  CyberToolMetadata,
  ToolParseResult,
  AccessControlResult,
  FictionalLogEntry,
} from '../types';
import { getFictionalLogs, filterLogs, findLogById } from '../data/fictionalLogs';
import { TerminalCommandResult, TerminalExecutionContext } from '../../terminal/types';

export type LogviewAction = 'recent' | 'filter' | 'inspect';

export interface LogviewArgs {
  action: LogviewAction;
  source?: string;
  severity?: string;
  limit?: number;
  logId?: string;
}

export interface LogviewResult {
  mode: 'recent' | 'filter' | 'inspect';
  logs: readonly FictionalLogEntry[];
  singleLog?: FictionalLogEntry;
  appliedFilters: {
    source?: string;
    severity?: string;
    limit?: number;
  };
  notFoundLogId?: string;
}

export class LogviewTool implements CyberTool<LogviewArgs, LogviewResult> {
  public readonly metadata: CyberToolMetadata = {
    id: 'tool_logview',
    name: 'logview',
    displayName: 'Simulated Security & System Log Analyzer',
    description:
      'Queries structured event telemetry from authentication, firewall, application, and system logs.',
    learningObjective:
      'Learn how to filter event logs, evaluate severity ratings, and correlate operational events without jumping to false conclusions.',
    syntax:
      'logview recent [--limit=N] | logview filter --source=SRC [--severity=SEV] | logview inspect <log-id>',
    examples: [
      'logview recent',
      'logview recent --limit=5',
      'logview filter --source=auth',
      'logview filter --severity=WARN',
      'logview inspect LOG-2026-104',
    ],
    requiredTier: 1,
  };

  public parseArgs(args: readonly string[]): ToolParseResult<LogviewArgs> {
    if (!args || args.length === 0) {
      return {
        success: true,
        args: { action: 'recent', limit: 10 },
      };
    }

    const first = args[0]?.toLowerCase();

    if (first === 'inspect' || first === 'show') {
      const id = args[1]?.trim();
      if (!id) {
        return {
          success: false,
          error: "Missing log ID for 'logview inspect'.",
          hint: "Example: 'logview inspect LOG-2026-104'. Type 'logview recent' to see log IDs.",
        };
      }
      return {
        success: true,
        args: { action: 'inspect', logId: id },
      };
    }

    // Handle recent or filter with flag arguments (--source=, --severity=, --limit=)
    let action: LogviewAction = 'recent';
    let source: string | undefined;
    let severity: string | undefined;
    let limit = 10;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!;
      const lower = arg.toLowerCase();

      if (lower === 'recent') {
        action = 'recent';
      } else if (lower === 'filter') {
        action = 'filter';
      } else if (lower.startsWith('--source=')) {
        source = arg.slice(9).trim();
      } else if (lower === '--source' && args[i + 1]) {
        source = args[i + 1]!.trim();
        i++;
      } else if (lower.startsWith('--severity=')) {
        severity = arg.slice(11).trim().toUpperCase();
      } else if (lower === '--severity' && args[i + 1]) {
        severity = args[i + 1]!.trim().toUpperCase();
        i++;
      } else if (lower.startsWith('--limit=')) {
        const parsed = parseInt(arg.slice(8).trim(), 10);
        if (!isNaN(parsed) && parsed > 0) limit = parsed;
      } else if (lower === '--limit' && args[i + 1]) {
        const parsed = parseInt(args[i + 1]!.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) limit = parsed;
        i++;
      } else if (/^log-\d+/i.test(arg)) {
        return {
          success: true,
          args: { action: 'inspect', logId: arg },
        };
      }
    }

    if (severity && !['INFO', 'NOTICE', 'WARN', 'ERROR'].includes(severity)) {
      return {
        success: false,
        error: `Invalid severity level '${severity}'.`,
        hint: 'Permitted severities: INFO, NOTICE, WARN, ERROR.',
      };
    }

    if (
      source &&
      !['auth', 'system', 'firewall', 'app-portal', 'file-server', 'siem', 'sysmon'].includes(source.toLowerCase())
    ) {
      return {
        success: false,
        error: `Unknown log source '${source}'.`,
        hint: 'Permitted sources: auth, system, firewall, app-portal, file-server, siem, sysmon.',
      };
    }

    if (source || severity) {
      action = 'filter';
    }

    return {
      success: true,
      args: { action, source, severity, limit },
    };
  }

  public checkAccess(_context: TerminalExecutionContext, _args?: LogviewArgs): AccessControlResult {
    return { allowed: true };
  }

  public execute(args: LogviewArgs, _context: TerminalExecutionContext): LogviewResult {
    if (args.action === 'inspect') {
      const found = findLogById(args.logId!);
      return {
        mode: 'inspect',
        logs: found ? [found] : [],
        singleLog: found,
        appliedFilters: {},
        notFoundLogId: found ? undefined : args.logId,
      };
    }

    if (args.action === 'filter') {
      const filtered = filterLogs({
        source: args.source,
        severity: args.severity,
        limit: args.limit,
      });
      return {
        mode: 'filter',
        logs: filtered,
        appliedFilters: {
          source: args.source,
          severity: args.severity,
          limit: args.limit,
        },
      };
    }

    const recent = filterLogs({ limit: args.limit ?? 10 });
    return {
      mode: 'recent',
      logs: recent,
      appliedFilters: { limit: args.limit ?? 10 },
    };
  }

  public formatOutput(
    result: LogviewResult,
    _args: LogviewArgs,
    context: TerminalExecutionContext
  ): TerminalCommandResult {
    const lines: string[] = [];

    if (result.mode === 'inspect') {
      if (!result.singleLog) {
        return {
          isError: true,
          stdout: [
            `logview: Log event '${result.notFoundLogId}' not found.`,
            "Type 'logview recent' to review existing simulated log identifiers.",
          ],
        };
      }

      const l = result.singleLog;
      lines.push(
        '================================================================================'
      );
      lines.push(`  LOGVIEW // EVENT INSPECTION: ${l.id}`);
      lines.push(
        '================================================================================'
      );
      lines.push(`  Timestamp:   ${l.timestamp} WAT (Simulation Civil Time)`);
      lines.push(`  Source:      ${l.source.toUpperCase()}`);
      lines.push(`  Severity:    [${l.severity}]`);
      lines.push(`  Event Type:  ${l.eventType}`);
      lines.push(`  Host ID:     ${l.hostId}`);
      if (l.user) lines.push(`  User:        ${l.user}`);
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Message:');
      lines.push(`    ${l.message}`);
      if (l.rawCef) {
        lines.push('  Raw CEF Record:');
        lines.push(`    ${l.rawCef}`);
      }
      if (l.sysmon) {
        lines.push('  Sysmon Fields:');
        lines.push(`    Event ID:     ${l.sysmon.eventId}`);
        if (l.sysmon.image) lines.push(`    Image:        ${l.sysmon.image}`);
        if (l.sysmon.commandLine) lines.push(`    CommandLine:  ${l.sysmon.commandLine}`);
        if (l.sysmon.destinationIp) lines.push(`    Destination:  ${l.sysmon.destinationIp}:${l.sysmon.destinationPort}`);
        if (l.sysmon.destinationHostname) lines.push(`    Dest Host:    ${l.sysmon.destinationHostname}`);
      }
      if (l.details) {
        lines.push('  Technical Context:');
        lines.push(`    ${l.details}`);
      }
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('🎓 ANALYST INTERPRETATION:');
      if (l.severity === 'ERROR') {
        lines.push('  • [ERROR] Indicates software failure or resource starvation.');
        lines.push('  • Note: Check preceding logs to see if normal service recovery occurred.');
      } else if (l.severity === 'WARN') {
        lines.push(
          '  • [WARN] An unexpected condition occurred (e.g. bad password retry or rejected bind).'
        );
        lines.push(
          '  • In digital security, a single failed password followed by success is typical user typo.'
        );
      } else {
        lines.push(
          '  • [INFO/NOTICE] Standard operational telemetry confirming expected behavior.'
        );
      }
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    const titleSuffix =
      result.mode === 'filter'
        ? `FILTERED LOGS (${result.appliedFilters.source ? `Source: ${result.appliedFilters.source}` : ''}${result.appliedFilters.severity ? ` | Severity: ${result.appliedFilters.severity}` : ''})`
        : `RECENT EVENTS (Limit: ${result.appliedFilters.limit ?? 10})`;

    lines.push('================================================================================');
    lines.push(`  LOGVIEW // ${titleSuffix}`);
    lines.push(
      `  Simulation Clock: ${context.simulationTime.dateString} ${context.simulationTime.timeString} WAT`
    );
    lines.push('================================================================================');
    lines.push(
      `${'LOG ID'.padEnd(14)} ${'TIME'.padEnd(12)} ${'SEV'.padEnd(8)} ${'SOURCE'.padEnd(12)} ${'EVENT TYPE'.padEnd(18)} ${'MESSAGE'}`
    );
    lines.push('--------------------------------------------------------------------------------');

    if (result.logs.length === 0) {
      lines.push('  No logs matched the specified filter criteria.');
    } else {
      for (const l of result.logs) {
        const truncMsg = l.message.length > 36 ? `${l.message.slice(0, 33)}...` : l.message;
        lines.push(
          `${l.id.padEnd(14)} ${l.timestamp.padEnd(12)} ${l.severity.padEnd(8)} ${l.source.padEnd(12)} ${l.eventType.padEnd(18)} ${truncMsg}`
        );
      }
    }

    lines.push('--------------------------------------------------------------------------------');
    lines.push(
      `Showing ${result.logs.length} of ${getFictionalLogs().length} total simulated logs.`
    );
    lines.push('');
    lines.push('🎓 EDUCATIONAL GUIDANCE:');
    lines.push(
      '  • Type "logview inspect <LOG-ID>" (e.g. "logview inspect LOG-2026-104") for details.'
    );
    lines.push(
      '  • Filter by source using "--source=auth", "--source=firewall", or "--source=app-portal".'
    );
    lines.push('  • Filter by severity using "--severity=WARN" or "--severity=ERROR".');
    lines.push('================================================================================');

    return { stdout: lines };
  }
}
