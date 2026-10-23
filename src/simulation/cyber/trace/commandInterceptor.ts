/**
 * Cyberlife — Terminal Command Trace & Scope Interceptor
 *
 * Inspects commands executed within the terminal, determines target and action profile,
 * enforces Scope/RoE boundaries with in-world warnings, and emits deterministic
 * ActionNoise events into the TraceSystemState.
 */

import { isActionInScope } from './traceEngine';
import { TerminalExecutionContext } from '../terminal/types';

export interface CommandInterceptionResult {
  shouldBlock: boolean;
  blockingLines?: string[];
  target?: string;
  actionId?: string;
  cleanedCommand?: string;
}

/**
 * Checks whether a command touches a simulated target, checks RoE boundaries,
 * and emits ActionNoise via dispatch.
 */
export function interceptTerminalCommand(
  rawCommand: string,
  context: TerminalExecutionContext
): CommandInterceptionResult {
  const trimmed = rawCommand.trim();
  if (!trimmed) {
    return { shouldBlock: false };
  }

  // Parse flags like --force-out-of-scope
  const hasForceFlag = trimmed.includes('--force-out-of-scope');
  const sanitizedCommand = trimmed.replace('--force-out-of-scope', '').trim();
  const parts = sanitizedCommand.split(/\s+/);
  const cmd = parts[0]?.toLowerCase() ?? '';
  const sub = parts[1]?.toLowerCase() ?? '';
  const remaining = parts.slice(2);

  let target: string | undefined;
  let actionId: string | undefined;

  // 1. Identify Target and Action profile from known commands
  if (cmd === 'svcscan') {
    if (sub === 'inspect') {
      target = remaining[0] ?? 'app-portal-01';
      actionId = 'portscan_aggressive';
    } else {
      target = sub || 'app-portal-01';
      actionId = 'portscan_slow';
    }
  } else if (cmd === 'nmap') {
    target = sub || 'app-portal-01';
    actionId = 'portscan_aggressive';
  } else if (cmd === 'threatintel') {
    target = remaining[0] || sub || 'app-portal-01';
    actionId = 'passive_osint';
  } else if (cmd === 'packetview') {
    target = sub || 'app-portal-01';
    actionId = 'passive_osint';
  } else if (cmd === 'webproxy') {
    if (sub === 'fuzz') {
      target = remaining[0] || 'app-portal-01';
      actionId = 'web_dir_bruteforce';
    } else {
      target = remaining[0] || sub || 'app-portal-01';
      actionId = 'web_probe';
    }
  } else if (cmd === 'exploitlab') {
    target = remaining[0] || sub || 'app-portal-01';
    actionId = 'exploit_attempt';
  } else if (cmd === 'netmap') {
    target = sub || 'cedarline-dc-01';
    actionId = 'portscan_slow';
  }

  // If this command doesn't touch an external network target, let it run normally
  if (!target || !actionId) {
    return { shouldBlock: false, cleanedCommand: sanitizedCommand };
  }

  const traceState = context.traceState;
  const dispatch = context.dispatchCommand;

  // 2. RoE Scope Boundary Check
  if (traceState && traceState.activeScope) {
    const scopeCheck = isActionInScope(traceState, actionId, target);
    if (!scopeCheck.inScope && !hasForceFlag) {
      // Raise Scope Warning modal in presentation layer
      if (dispatch) {
        dispatch({
          type: 'RaiseScopeWarning',
          target,
          actionId,
          attemptedCommand: sanitizedCommand,
        });
      }

      const warningLines = [
        '==============================================================',
        '  [!] RULES OF ENGAGEMENT // SCOPE BREACH DETECTED',
        '==============================================================',
        `  Target '${target}' is NOT in your authorised RoE scope!`,
        `  Active Mission: ${traceState.activeScope.missionName ?? traceState.activeScope.clientName}`,
        `  Authorised Targets: ${traceState.activeScope.authorizedHosts.join(', ')}`,
        '--------------------------------------------------------------',
        '  "This host is not in your authorised scope. Proceed?"',
        '--------------------------------------------------------------',
        '  [!] WARNING: Proceeding with unauthorized probes will register',
        '      LEGAL EXPOSURE and flag any acquired evidence as TAINTED.',
        '',
        '  To proceed regardless:',
        '    1. Re-run with flag: --force-out-of-scope',
        '    2. Confirm in the Workstation Scope Warning dialog',
        '    3. Type: trace ack proceed',
        '==============================================================',
      ];

      return {
        shouldBlock: true,
        blockingLines: warningLines,
        target,
        actionId,
      };
    }
  }

  // 3. Emit deterministic ActionNoise event
  if (dispatch) {
    dispatch({
      type: 'RecordActionNoise',
      actionId,
      target,
    });
  }

  return {
    shouldBlock: false,
    target,
    actionId,
    cleanedCommand: sanitizedCommand,
  };
}
