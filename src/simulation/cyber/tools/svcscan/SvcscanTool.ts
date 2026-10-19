/**
 * Cyberlife — Simulated Service Inventory Tool (`svcscan`)
 *
 * Inspects services, open ports, and application versions running on fictional hosts.
 * Zero socket connections, zero network packets, zero real scanning.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches beginners:
 * 1. An open port is a software program listening for incoming network messages.
 * 2. Service banners report application name and version.
 * 3. Discovering a service or version DOES NOT automatically prove a vulnerability exists.
 * 4. Legitimate services are required for business operations.
 */

import {
  CyberTool,
  CyberToolMetadata,
  ToolParseResult,
  AccessControlResult,
  FictionalService,
  FictionalHost,
} from '../types';
import { getServicesForHost, getAllServices } from '../data/fictionalServices';
import { findHostByIdOrIp } from '../data/fictionalHosts';
import { TerminalCommandResult, TerminalExecutionContext } from '../../terminal/types';

export type SvcscanAction = 'inspect' | 'list' | 'filter';

export interface SvcscanArgs {
  action: SvcscanAction;
  target?: string;
  filterStatus?: 'approved' | 'review';
}

export interface SvcscanResult {
  mode: 'inspect' | 'list' | 'filter';
  host?: FictionalHost;
  services: readonly FictionalService[];
  notFoundTarget?: string;
  filterStatus?: 'approved' | 'review';
}

export class SvcscanTool implements CyberTool<SvcscanArgs, SvcscanResult> {
  public readonly metadata: CyberToolMetadata = {
    id: 'tool_svcscan',
    name: 'svcscan',
    displayName: 'Simulated Service & Port Inventory Scanner',
    description:
      'Queries active listeners, port numbers, software products, and version banners on in-game hosts.',
    learningObjective:
      'Understand how services expose network listeners, how to verify approved configurations, and why banner presence alone does not establish vulnerability.',
    syntax: 'svcscan inspect <host-id> | svcscan list | svcscan filter <approved|review>',
    examples: [
      'svcscan inspect ws-finance-02',
      'svcscan inspect filesrv-01',
      'svcscan inspect app-portal-01',
      'svcscan list',
      'svcscan filter review',
    ],
    requiredTier: 1,
  };

  public parseArgs(args: readonly string[]): ToolParseResult<SvcscanArgs> {
    if (!args || args.length === 0) {
      return {
        success: false,
        error: "Missing action for 'svcscan'.",
        hint: "Usage: 'svcscan inspect <host-id>' or 'svcscan list'. Type 'help svcscan' for details.",
      };
    }

    const action = args[0]?.toLowerCase();

    if (action === 'inspect' || action === 'host' || action === 'scan') {
      const target = args[1]?.trim();
      if (!target) {
        return {
          success: false,
          error: "Missing target host for 'svcscan inspect'.",
          hint: "Example: 'svcscan inspect filesrv-01' or 'svcscan inspect ws-finance-02'.",
        };
      }
      return {
        success: true,
        args: { action: 'inspect', target },
      };
    }

    if (action === 'list' || action === 'all') {
      return {
        success: true,
        args: { action: 'list' },
      };
    }

    if (action === 'filter') {
      const statusParam = args[1]?.trim().toLowerCase();
      if (statusParam !== 'approved' && statusParam !== 'review') {
        return {
          success: false,
          error: `Invalid status filter '${statusParam}'.`,
          hint: "Filter options: 'svcscan filter approved' or 'svcscan filter review'.",
        };
      }
      return {
        success: true,
        args: { action: 'filter', filterStatus: statusParam },
      };
    }

    return {
      success: false,
      error: `Unrecognized svcscan action '${action}'.`,
      hint: "Available actions: 'inspect <host-id>', 'list', 'filter <approved|review>'. Type 'help svcscan' for help.",
    };
  }

  public checkAccess(context: TerminalExecutionContext, args?: SvcscanArgs): AccessControlResult {
    const userTier = (context.currentUser.accessTier ?? 1) as 1 | 2;

    if (args?.action === 'inspect' && args.target) {
      const host = findHostByIdOrIp(args.target);
      if (host && host.requiredTier > userTier) {
        return {
          allowed: false,
          requiredTier: host.requiredTier,
          currentRole: context.currentUser.role,
          reason: `Access Denied: Service inspection on host '${host.id}' requires Clearance Tier ${host.requiredTier}. Your current clearance is Tier ${userTier} (${context.currentUser.role}).`,
        };
      }
    }

    return { allowed: true };
  }

  public execute(args: SvcscanArgs, _context: TerminalExecutionContext): SvcscanResult {
    if (args.action === 'inspect') {
      const host = findHostByIdOrIp(args.target!);
      if (!host) {
        return {
          mode: 'inspect',
          services: [],
          notFoundTarget: args.target,
        };
      }
      const services = getServicesForHost(host.id);
      return {
        mode: 'inspect',
        host,
        services,
      };
    }

    if (args.action === 'filter') {
      const all = getAllServices();
      const filtered = all.filter(s =>
        args.filterStatus === 'approved' ? s.approved : !s.approved
      );
      return {
        mode: 'filter',
        services: filtered,
        filterStatus: args.filterStatus,
      };
    }

    return {
      mode: 'list',
      services: getAllServices(),
    };
  }

  public formatOutput(
    result: SvcscanResult,
    _args: SvcscanArgs,
    _context: TerminalExecutionContext
  ): TerminalCommandResult {
    const lines: string[] = [];

    if (result.mode === 'inspect') {
      if (!result.host) {
        return {
          isError: true,
          stdout: [
            `svcscan: Host '${result.notFoundTarget}' not recognized.`,
            "Type 'netmap hosts' to view valid host identifiers on the subnet.",
          ],
        };
      }

      const h = result.host;
      lines.push(
        '================================================================================'
      );
      lines.push(`  SVCSCAN // SERVICE INVENTORY: ${h.id} (${h.ipAddress})`);
      lines.push(`  Host Role: ${h.roleLabel} // OS: ${h.os}`);
      lines.push(
        '================================================================================'
      );
      lines.push(
        `${'PORT/PROTO'.padEnd(12)} ${'STATE'.padEnd(8)} ${'SERVICE'.padEnd(16)} ${'PRODUCT / VERSION'.padEnd(28)} ${'STATUS'}`
      );
      lines.push(
        '--------------------------------------------------------------------------------'
      );

      if (result.services.length === 0) {
        lines.push('  No open service listeners discovered on this host.');
      } else {
        for (const s of result.services) {
          const portProto = `${s.port}/${s.protocol}`;
          const prodVer = `${s.product} ${s.version}`.slice(0, 27);
          const approvedText = s.approved ? 'APPROVED' : 'REQUIRES REVIEW';
          lines.push(
            `${portProto.padEnd(12)} ${s.state.padEnd(8)} ${s.serviceName.padEnd(16)} ${prodVer.padEnd(28)} ${approvedText}`
          );
        }
      }

      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Service Details & Operational Observations:');
      for (const s of result.services) {
        const flagPrefix = s.approved ? '  [✓] ' : '  [⚠️] ';
        lines.push(`${flagPrefix}${s.port}/${s.protocol} (${s.serviceName}):`);
        lines.push(`      Purpose: ${s.expectedPurpose}`);
        lines.push(`      Security: ${s.securityNotes}`);
      }

      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('🎓 EDUCATIONAL TAKEAWAYS:');
      lines.push(
        '  • Differentiate between DISCOVERY (port is listening) and VULNERABILITY (flaw is exploitable).'
      );
      lines.push('  • Most open ports are essential business software (e.g. HTTPS, SMB, DNS).');
      lines.push(
        '  • Notice: Do not claim an exploit exists merely because an older version banner appears.'
      );
      lines.push(
        '  • Next Step: Check "logview recent --source=app-portal" or "--source=auth" for activity.'
      );
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    if (result.mode === 'list' || result.mode === 'filter') {
      const header =
        result.mode === 'filter'
          ? `SERVICES FILTERED BY STATUS: ${result.filterStatus?.toUpperCase()}`
          : 'ALL INVENTORIED SERVICES ACROSS SUB-NETWORK';

      lines.push(
        '================================================================================'
      );
      lines.push(`  SVCSCAN // ${header}`);
      lines.push(
        '================================================================================'
      );
      lines.push(
        `${'HOST ID'.padEnd(16)} ${'PORT/PROTO'.padEnd(12)} ${'SERVICE'.padEnd(16)} ${'VERSION'.padEnd(22)} ${'STATUS'}`
      );
      lines.push(
        '--------------------------------------------------------------------------------'
      );

      for (const s of result.services) {
        const portProto = `${s.port}/${s.protocol}`;
        const approvedText = s.approved ? 'APPROVED' : 'REQUIRES REVIEW';
        lines.push(
          `${s.hostId.padEnd(16)} ${portProto.padEnd(12)} ${s.serviceName.padEnd(16)} ${s.version.slice(0, 21).padEnd(22)} ${approvedText}`
        );
      }

      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push(`Total services listed: ${result.services.length}`);
      lines.push('');
      lines.push(
        '🎓 Pro Tip: Use "svcscan inspect <host-id>" to inspect service security notes in detail.'
      );
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    return { stdout: ['svcscan: Completed.'] };
  }
}
