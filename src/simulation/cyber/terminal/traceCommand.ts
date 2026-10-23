/**
 * Cyberlife — Terminal Trace & RoE Management Command
 *
 * Provides in-terminal monitoring of short-term Trace meter, long-term Legal Exposure,
 * active Rules of Engagement scope, OPSEC countermeasures (Tor, VPN, log wipe),
 * and purple-team Defender View debrief inspection.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';

export const traceCommand: TerminalCommandHandler = {
  name: 'trace',
  description: 'Inspects real-time trace telemetry, legal exposure, rules of engagement, and OPSEC modifiers.',
  usage: 'trace [status | scope | roe | tor <on|off> | vpn <on|off> | wipe | ack <proceed|cancel> | debrief]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const sub = (args[0] ?? 'status').toLowerCase();
    const trace = context.traceState;
    const dispatch = context.dispatchCommand;

    if (!trace) {
      return {
        isError: true,
        stdout: [
          '[-] TRACE SUBSYSTEM OFFLINE',
          'Telemetry daemon is not running on this workstation session.',
        ],
      };
    }

    if (sub === 'status' || sub === 'stat') {
      const traceBar = renderMeterBar(trace.traceMeter);
      const legalBar = renderMeterBar(trace.legalExposureMeter);
      const opsec = trace.opsecModifiers;

      const output = [
        '====================================================================',
        '  OPERATIONAL SECURITY & TELEMETRY MONITOR // TRACE & ROE',
        '====================================================================',
        `  Short-Term Trace:    ${traceBar} ${trace.traceMeter}% ${getTraceLevelLabel(trace.traceMeter)}`,
        `  Legal Exposure:      ${legalBar} ${trace.legalExposureMeter}% ${getLegalLevelLabel(trace.legalExposureMeter)}`,
        '--------------------------------------------------------------------',
        `  Session Mode:        ${trace.isNightJobActive ? 'NIGHT OPERATION (UNOFFICIAL / GRAY-ZONE)' : 'STANDARD DAY CONTRACT'}`,
        `  Active Job ID:       ${trace.activeJobId ?? 'NONE'}`,
        `  Active Scope:        ${trace.activeScope ? (trace.activeScope.missionName ?? trace.activeScope.clientName) : 'NO FORMAL ROE REGISTERED'}`,
        '--------------------------------------------------------------------',
        '  OPSEC COUNTERMEASURES:',
        `    Tor Anonymization: [${opsec.useTor ? 'ACTIVE  -35% NOISE' : 'DISABLED'}]`,
        `    VPN Chain Relay:   [${opsec.useVpn ? 'ACTIVE  -15% NOISE' : 'DISABLED'}]`,
        `    Off-Hours Timing:  [${opsec.isOffHours ? 'ACTIVE  -15% NOISE' : 'DISABLED'}]`,
        `    Artefact Cleaned:  [${opsec.cleanedLogs ? 'YES (RECENT HISTORY WIPED)' : 'NO (TRACES UNTOUCHED)'}]`,
      ];

      if (trace.activeDefenderResponses.length > 0) {
        output.push('--------------------------------------------------------------------');
        output.push('  ACTIVE DEFENDER RESPONSES DETECTED:');
        for (const resp of trace.activeDefenderResponses) {
          output.push(`    [${resp.type}] on ${resp.target}: ${resp.message}`);
        }
      }

      if (trace.actionHistory.length > 0) {
        output.push('--------------------------------------------------------------------');
        output.push('  RECENT NOISE EMISSIONS (LAST 5 EVENTS):');
        const recent = trace.actionHistory.slice(-5);
        for (const evt of recent) {
          const scopeLabel = evt.inScope ? 'IN-SCOPE' : 'OUT-OF-SCOPE (TAINT RISK)';
          output.push(
            `    [+${evt.noiseValue}% Noise] ${evt.actionId} -> ${evt.target} (${scopeLabel})`
          );
        }
      }

      output.push('====================================================================');
      output.push("  Commands: 'trace scope', 'trace tor on|off', 'trace wipe', 'trace debrief'");
      return { stdout: output };
    }

    if (sub === 'scope' || sub === 'roe') {
      const scope = trace.activeScope;
      if (!scope) {
        return {
          stdout: [
            '====================================================================',
            '  RULES OF ENGAGEMENT // AUTHORISED SCOPE REGISTER',
            '====================================================================',
            '  Status: NO FORMAL RULES OF ENGAGEMENT REGISTERED.',
            '  Current Context: Gray-zone or unofficial reconnaissance.',
            '  WARNING: All external intrusive actions carry full legal liability',
            '  and will elevate your Long-Term Legal Exposure meter.',
            '====================================================================',
          ],
        };
      }

      return {
        stdout: [
          '====================================================================',
          '  RULES OF ENGAGEMENT // AUTHORISED SCOPE REGISTER',
          '====================================================================',
          `  Mission Reference:   ${scope.missionName ?? scope.clientName} (${scope.jobId})`,
          `  Authorizing Body:    ${scope.authorizingClient ?? scope.clientName}`,
          `  Authorized Hosts:    ${scope.authorizedHosts.join(', ')}`,
          `  Authorized Ports:    ${scope.authorizedPorts.join(', ')}`,
          `  Prohibited Targets:  ${scope.prohibitedTargets.join(', ')}`,
          `  Authorized Window:   ${scope.timeWindowStart ?? '08:00'} -> ${scope.timeWindowEnd ?? '18:00'}`,
          '--------------------------------------------------------------------',
          '  OPERATIONAL BOUNDARY DIRECTIVES:',
          ...(scope.rulesOfEngagement ? scope.rulesOfEngagement.map((r: string) => `    - ${r}`) : [`    - ${scope.description}`]),
          '--------------------------------------------------------------------',
          '  Notice: Probing assets outside authorized hosts will trigger a mandatory',
          '  scope warning and register evidence as tainted.',
          '====================================================================',
        ],
      };
    }

    if (sub === 'tor') {
      const mode = args[1]?.toLowerCase();
      if (mode !== 'on' && mode !== 'off') {
        return {
          isError: true,
          stdout: ["Usage: trace tor <on|off>"],
        };
      }
      const active = mode === 'on';
      if (dispatch) {
        dispatch({
          type: 'ApplyOpsecAction',
          useTor: active,
        });
      }
      return {
        stdout: [
          `[OPSEC] Onion Routing (Tor) daemon ${active ? 'ENABLED. Traffic routed via virtual SOCKS5 proxy (185.220.101.5).' : 'DISABLED. Direct egress restored.'}`,
          `Noise reduction modifier: ${active ? '-35% active scan attenuation.' : 'None.'}`,
        ],
      };
    }

    if (sub === 'vpn') {
      const mode = args[1]?.toLowerCase();
      if (mode !== 'on' && mode !== 'off') {
        return {
          isError: true,
          stdout: ["Usage: trace vpn <on|off>"],
        };
      }
      const active = mode === 'on';
      if (dispatch) {
        dispatch({
          type: 'ApplyOpsecAction',
          useVpn: active,
        });
      }
      return {
        stdout: [
          `[OPSEC] WireGuard Encrypted Tunnel ${active ? 'CONNECTED (Lagos Secure Gateway node).' : 'DISCONNECTED.'}`,
          `Noise reduction modifier: ${active ? '-15% perimeter footprint reduction.' : 'None.'}`,
        ],
      };
    }

    if (sub === 'wipe') {
      if (dispatch) {
        dispatch({
          type: 'ApplyOpsecAction',
          logCleanup: true,
        });
      }
      return {
        stdout: [
          '[OPSEC] Anti-Forensic Session Sanitization initiated...',
          '  [+] Truncating /var/log/lastlog and bash history.',
          '  [+] Zeroing ephemeral socket file descriptors.',
          '  [+] Trace reduction applied (-20% trace level).',
          '  [!] Note: Real blue teams identify anomalous log gaps during post-incident triage.',
        ],
      };
    }

    if (sub === 'ack') {
      const choice = (args[1] ?? '').toLowerCase();
      if (choice !== 'proceed' && choice !== 'cancel') {
        return {
          isError: true,
          stdout: ["Usage: trace ack <proceed|cancel>"],
        };
      }
      if (!trace.pendingScopeWarning) {
        return {
          stdout: ['No pending scope warning requiring acknowledgment.'],
        };
      }

      if (dispatch) {
        dispatch({
          type: 'AcknowledgeScopeWarning',
          proceed: choice === 'proceed',
        });
      }

      if (choice === 'proceed') {
        return {
          stdout: [
            '[!] Scope warning OVERRIDDEN. Action proceeding out-of-scope.',
            '  [!] Legal Exposure increased.',
            '  [!] Acquired evidence will be flagged as TAINTED.',
          ],
        };
      } else {
        return {
          stdout: ['[+] Scope warning acknowledged. Out-of-scope action cancelled.'],
        };
      }
    }

    if (sub === 'debrief') {
      if (trace.activeDebrief) {
        return {
          stdout: formatDebriefStdout(trace.activeDebrief),
        };
      }

      // If no active debrief but action history exists, generate one
      if (dispatch && trace.actionHistory.length > 0) {
        dispatch({
          type: 'GenerateDefenderDebrief',
          jobId: trace.activeJobId ?? 'ep01_night_job',
          jobTitle: 'Night Operation: Perimeter Reconnaissance',
        });
        return {
          stdout: [
            '[+] Defender View Debrief generated for recent operations.',
            "Run 'trace debrief' again to inspect blue team telemetry timeline.",
          ],
        };
      }

      return {
        stdout: [
          'No debrief currently available.',
          'Complete a simulated night reconnaissance or scan job to generate the Defender View timeline.',
        ],
      };
    }

    return {
      isError: true,
      stdout: [
        `Unknown trace subcommand '${args[0]}'.`,
        'Usage: trace [status | scope | roe | tor <on|off> | vpn <on|off> | wipe | ack <proceed|cancel> | debrief]',
      ],
    };
  },
};

function renderMeterBar(value: number): string {
  const totalSlots = 20;
  const filled = Math.min(totalSlots, Math.max(0, Math.round((value / 100) * totalSlots)));
  const empty = totalSlots - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}]`;
}

function getTraceLevelLabel(level: number): string {
  if (level >= 90) return '[CRITICAL LOCKOUT RISK]';
  if (level >= 75) return '[HIGH - IP BLOCK ENGAGED]';
  if (level >= 50) return '[ELEVATED - SOC ALERT RAISED]';
  if (level >= 25) return '[MODERATE - RATE LIMITED]';
  return '[QUIET / NOMINAL]';
}

function getLegalLevelLabel(level: number): string {
  if (level >= 85) return '[CRITICAL - SUBPOENA / TRIBUNAL RISK]';
  if (level >= 65) return '[HIGH - LAW ENFORCEMENT SURVEILLANCE]';
  if (level >= 40) return '[WARNING - MENTOR / COMPLIANCE SCRUTINY]';
  return '[CLEAN - WITHIN ROE]';
}

function formatDebriefStdout(debrief: import('../trace/types').DefenderViewDebrief): string[] {
  const missedCount = debrief.totalActions - debrief.detectedCount;
  const lines: string[] = [
    '====================================================================',
    `  DEFENDER VIEW DEBRIEF // JOB: ${debrief.jobId.toUpperCase()}`,
    '====================================================================',
    `  Job ID:          ${debrief.jobId}`,
    `  Assessment:      ${debrief.overallVerdict}`,
    `  Actions Logged:  ${debrief.detectedCount} Detected / ${missedCount} Evaded (Total: ${debrief.totalActions})`,
    `  Final Trace:     ${debrief.finalTraceLevel}% | Legal Exposure: ${debrief.finalLegalExposure}%`,
    '--------------------------------------------------------------------',
    '  SOC TELEMETRY TIMELINE:',
  ];

  for (const entry of debrief.entries) {
    const status = entry.status === 'DETECTED' ? '[DETECTED]' : entry.status === 'SUSPICIOUS' ? '[SUSPECT] ' : '[MISSED]  ';
    lines.push(`  ${status} [${entry.timestampString}] ${entry.actionName} -> ${entry.target}`);
    lines.push(`    ATT&CK: ${entry.attckTechniqueId} (${entry.attckTechniqueName})`);
    lines.push(`    Log Line: ${entry.logLine}`);
    lines.push(`    Defender View: ${entry.blueTeamInsight}`);
    lines.push(`    Purple Team Takeaway: ${entry.redTeamLesson}`);
    lines.push('  ------------------------------------------------------------------');
  }

  lines.push('  SUMMARY / LESSONS:');
  lines.push(`    ${debrief.feedbackSummary}`);
  lines.push('====================================================================');
  return lines;
}
