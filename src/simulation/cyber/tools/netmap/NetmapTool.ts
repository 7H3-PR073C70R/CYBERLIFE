/**
 * Cyberlife — Simulated Network Discovery Tool (`netmap`)
 *
 * Operates strictly over in-game synthetic network topology data.
 * Zero real network requests, socket connections, or external scanning.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches beginners what a host inventory is, what simulated reachability
 * represents on a local area network, and why finding a live host does NOT mean
 * that the host is compromised.
 */

import {
  CyberTool,
  CyberToolMetadata,
  ToolParseResult,
  AccessControlResult,
  FictionalHost,
} from '../types';
import { getFictionalHosts, findHostByIdOrIp } from '../data/fictionalHosts';
import { TerminalCommandResult, TerminalExecutionContext } from '../../terminal/types';

export type NetmapAction = 'hosts' | 'inspect' | 'filter';

export interface NetmapArgs {
  action: NetmapAction;
  target?: string;
  filterRole?: string;
}

export interface NetmapResult {
  mode: 'hosts' | 'inspect' | 'filter';
  hosts?: readonly FictionalHost[];
  singleHost?: FictionalHost;
  filterRole?: string;
  notFoundQuery?: string;
  totalSubnetHosts: number;
}

export class NetmapTool implements CyberTool<NetmapArgs, NetmapResult> {
  public readonly metadata: CyberToolMetadata = {
    id: 'tool_netmap',
    name: 'netmap',
    displayName: 'Simulated Network Discovery & Host Inventory',
    description:
      'Discovers reachable virtual hosts, addresses, and device roles on the in-game subnet.',
    learningObjective:
      'Learn how security analysts map local networks to establish an authorized baseline of active devices.',
    syntax: 'netmap hosts | netmap inspect <host-id> | netmap filter <role>',
    examples: [
      'netmap hosts',
      'netmap inspect ws-finance-02',
      'netmap inspect 10.0.4.50',
      'netmap filter workstation',
    ],
    requiredTier: 1,
  };

  public parseArgs(args: readonly string[]): ToolParseResult<NetmapArgs> {
    if (!args || args.length === 0) {
      return {
        success: false,
        error: "Missing action for 'netmap'.",
        hint: "Type 'netmap hosts' to list subnet devices, or 'help netmap' for full syntax.",
      };
    }

    const action = args[0]?.toLowerCase();

    if (action === 'hosts' || action === 'list') {
      return {
        success: true,
        args: { action: 'hosts' },
      };
    }

    if (action === 'inspect' || action === 'host' || action === 'show') {
      const target = args[1]?.trim();
      if (!target) {
        return {
          success: false,
          error: "Missing target host identifier for 'netmap inspect'.",
          hint: "Example: 'netmap inspect filesrv-01' or 'netmap inspect 10.0.4.15'.",
        };
      }
      return {
        success: true,
        args: { action: 'inspect', target },
      };
    }

    if (action === 'filter') {
      const role = args[1]?.trim().toLowerCase();
      if (!role) {
        return {
          success: false,
          error: "Missing role to filter by for 'netmap filter'.",
          hint: 'Valid roles: workstation, file_server, application_server, network_gateway, monitoring_system.',
        };
      }
      return {
        success: true,
        args: { action: 'filter', filterRole: role },
      };
    }

    return {
      success: false,
      error: `Unrecognized netmap action '${action}'.`,
      hint: "Available actions: 'hosts', 'inspect <host-id>', 'filter <role>'. Type 'help netmap' for details.",
    };
  }

  public checkAccess(context: TerminalExecutionContext, args?: NetmapArgs): AccessControlResult {
    const userTier = (context.currentUser.accessTier ?? 1) as 1 | 2;

    if (args?.action === 'inspect' && args.target) {
      const host = findHostByIdOrIp(args.target);
      if (host && host.requiredTier > userTier) {
        return {
          allowed: false,
          requiredTier: host.requiredTier,
          currentRole: context.currentUser.role,
          reason: `Access Denied: Host '${host.id}' requires Security Clearance Tier ${host.requiredTier}. Your current clearance is Tier ${userTier} (${context.currentUser.role}).`,
        };
      }
    }

    return { allowed: true };
  }

  public execute(args: NetmapArgs, _context: TerminalExecutionContext): NetmapResult {
    const allHosts = getFictionalHosts();

    if (args.action === 'hosts') {
      return {
        mode: 'hosts',
        hosts: allHosts,
        totalSubnetHosts: allHosts.length,
      };
    }

    if (args.action === 'inspect') {
      const found = findHostByIdOrIp(args.target!);
      return {
        mode: 'inspect',
        singleHost: found,
        notFoundQuery: found ? undefined : args.target,
        totalSubnetHosts: allHosts.length,
      };
    }

    if (args.action === 'filter') {
      const filtered = allHosts.filter(h => h.role.toLowerCase() === args.filterRole);
      return {
        mode: 'filter',
        hosts: filtered,
        filterRole: args.filterRole,
        totalSubnetHosts: allHosts.length,
      };
    }

    return {
      mode: 'hosts',
      hosts: allHosts,
      totalSubnetHosts: allHosts.length,
    };
  }

  public formatOutput(
    result: NetmapResult,
    _args: NetmapArgs,
    _context: TerminalExecutionContext
  ): TerminalCommandResult {
    const lines: string[] = [];

    if (result.mode === 'hosts' || result.mode === 'filter') {
      const titlePrefix =
        result.mode === 'filter'
          ? `FILTERED HOSTS (Role: ${result.filterRole?.toUpperCase()})`
          : 'DISCOVERED SUBNET HOST INVENTORY';

      lines.push(
        '================================================================================'
      );
      lines.push(`  NETMAP // ${titlePrefix} — Subnet: 10.0.4.0/24 (Marina Tower)`);
      lines.push('  Safety: 100% simulated sandbox. Zero external network scanning.');
      lines.push(
        '================================================================================'
      );
      lines.push(
        `${'HOST ID'.padEnd(16)} ${'IP ADDRESS'.padEnd(14)} ${'STATUS'.padEnd(8)} ${'ROLE'.padEnd(20)} ${'HOSTNAME'}`
      );
      lines.push(
        '--------------------------------------------------------------------------------'
      );

      const hostList = result.hosts ?? [];
      if (hostList.length === 0) {
        lines.push('  No hosts matched the specified filter.');
      } else {
        for (const h of hostList) {
          const statusText = h.status === 'UP' ? 'UP' : h.status;
          lines.push(
            `${h.id.padEnd(16)} ${h.ipAddress.padEnd(14)} ${statusText.padEnd(8)} ${h.role.padEnd(20)} ${h.hostname}`
          );
        }
      }

      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push(
        `Total nodes in inventory: ${result.totalSubnetHosts} | Displayed: ${hostList.length}`
      );
      lines.push('');
      lines.push('🎓 EDUCATIONAL GUIDANCE — What does this mean?');
      lines.push('  • A host inventory maps which virtual devices are connected to the network.');
      lines.push(
        '  • Reachability ("UP") indicates the device responds to synthetic ICMP/ARP ping probes.'
      );
      lines.push(
        '  • IMPORTANT: An inventory alone DOES NOT mean a host is vulnerable or compromised.'
      );
      lines.push(
        '  • Next Step: Use "svcscan inspect <host-id>" to examine running services and open ports.'
      );
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    if (result.mode === 'inspect') {
      if (!result.singleHost) {
        return {
          isError: true,
          stdout: [
            `netmap: Host identifier '${result.notFoundQuery}' was not found on simulated subnet 10.0.4.0/24.`,
            "Type 'netmap hosts' to view the list of discovered in-game devices.",
          ],
        };
      }

      const h = result.singleHost;
      lines.push(
        '================================================================================'
      );
      lines.push(`  NETMAP HOST INSPECTION: ${h.id} (${h.hostname})`);
      lines.push(
        '================================================================================'
      );
      lines.push(`  Fictional IP:       ${h.ipAddress} (Subnet: 10.0.4.0/24)`);
      lines.push(`  MAC Address:        ${h.macAddress}`);
      lines.push(`  Device Role:        ${h.roleLabel}`);
      lines.push(`  Operating System:   ${h.os}`);
      lines.push(`  Network Status:     ${h.status} (Reachability: ${h.reachability})`);
      lines.push(`  Physical Location:  ${h.location}`);
      lines.push(`  Approved Services:  ${h.approvedServices.join(', ')}`);
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Host Description:');
      lines.push(`    ${h.description}`);
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('🎓 INTERPRETATION GUIDANCE:');
      lines.push('  • Review the "Approved Services" against expected operational roles.');
      lines.push(
        '  • In digital security, finding an open port is normal — services run businesses.'
      );
      lines.push(
        `  • Next Step: Type 'svcscan inspect ${h.id}' to inspect running ports & version banners.`
      );
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    return { stdout: ['netmap: Command completed.'] };
  }
}
