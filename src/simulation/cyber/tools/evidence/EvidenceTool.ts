/**
 * Cyberlife — Simulated Evidence Inspection Tool (`evidence`)
 *
 * Inspects digital forensic evidence records catalogued in the simulated vault.
 * Zero real host file system access; purely sandboxed in-game artifacts.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches beginners:
 * 1. Digital evidence must be preserved in a read-only state.
 * 2. Cryptographic hashes (SHA-256) verify that evidence has not been altered.
 * 3. An unbroken chain of custody documents who touched the evidence, when, and why.
 * 4. Proper documentation is essential for security audits and incident response.
 */

import {
  CyberTool,
  CyberToolMetadata,
  ToolParseResult,
  AccessControlResult,
  FictionalEvidenceItem,
} from '../types';
import { getFictionalEvidence, findEvidenceById } from '../data/fictionalEvidence';
import { TerminalCommandResult, TerminalExecutionContext } from '../../terminal/types';

export type EvidenceAction = 'list' | 'inspect';

export interface EvidenceArgs {
  action: EvidenceAction;
  evidenceId?: string;
}

export interface EvidenceResult {
  mode: 'list' | 'inspect';
  items: readonly FictionalEvidenceItem[];
  singleItem?: FictionalEvidenceItem;
  notFoundId?: string;
}

export class EvidenceTool implements CyberTool<EvidenceArgs, EvidenceResult> {
  public readonly metadata: CyberToolMetadata = {
    id: 'tool_evidence',
    name: 'evidence',
    displayName: 'Simulated Digital Forensic Evidence Inspector',
    description:
      'Catalogs and displays digital evidence artifacts, cryptographic hashes, and custody records.',
    learningObjective:
      'Learn why digital evidence integrity, hash verification, and custody logs are foundational to cybersecurity investigation.',
    syntax: 'evidence list | evidence inspect <evidence-id>',
    examples: [
      'evidence list',
      'evidence inspect EVD-2026-001',
      'evidence inspect EVD-2026-002',
      'evidence inspect EVD-2026-003',
    ],
    requiredTier: 1,
  };

  public parseArgs(args: readonly string[]): ToolParseResult<EvidenceArgs> {
    if (!args || args.length === 0) {
      return {
        success: true,
        args: { action: 'list' },
      };
    }

    const action = args[0]?.toLowerCase();

    if (action === 'list' || action === 'all') {
      return {
        success: true,
        args: { action: 'list' },
      };
    }

    if (action === 'inspect' || action === 'show' || action === 'view') {
      const id = args[1]?.trim();
      if (!id) {
        return {
          success: false,
          error: "Missing evidence identifier for 'evidence inspect'.",
          hint: "Example: 'evidence inspect EVD-2026-001'. Type 'evidence list' to see all IDs.",
        };
      }
      return {
        success: true,
        args: { action: 'inspect', evidenceId: id },
      };
    }

    if (action && /^evd-|^case-/i.test(action)) {
      return {
        success: true,
        args: { action: 'inspect', evidenceId: action },
      };
    }

    return {
      success: false,
      error: `Unrecognized evidence action '${action}'.`,
      hint: "Usage: 'evidence list' or 'evidence inspect <evidence-id>'. Type 'help evidence' for details.",
    };
  }

  public checkAccess(context: TerminalExecutionContext, args?: EvidenceArgs): AccessControlResult {
    const userTier = (context.currentUser.accessTier ?? 1) as 1 | 2;

    if (args?.action === 'inspect' && args.evidenceId) {
      const item = findEvidenceById(args.evidenceId);
      if (item && item.requiredTier > userTier) {
        return {
          allowed: false,
          requiredTier: item.requiredTier,
          currentRole: context.currentUser.role,
          reason: `Access Denied: Evidence object '${item.id}' requires Clearance Tier ${item.requiredTier} (Senior Analyst / Incident Response Lead). Your persona is currently assigned Tier ${userTier} (${context.currentUser.role}).`,
        };
      }
    }

    return { allowed: true };
  }

  public execute(args: EvidenceArgs, _context: TerminalExecutionContext): EvidenceResult {
    const all = getFictionalEvidence();

    if (args.action === 'inspect') {
      const item = findEvidenceById(args.evidenceId!);
      return {
        mode: 'inspect',
        items: item ? [item] : [],
        singleItem: item,
        notFoundId: item ? undefined : args.evidenceId,
      };
    }

    return {
      mode: 'list',
      items: all,
    };
  }

  public formatOutput(
    result: EvidenceResult,
    _args: EvidenceArgs,
    _context: TerminalExecutionContext
  ): TerminalCommandResult {
    const lines: string[] = [];

    if (result.mode === 'inspect') {
      if (!result.singleItem) {
        return {
          isError: true,
          stdout: [
            `evidence: Evidence identifier '${result.notFoundId}' was not found in the forensic vault.`,
            "Type 'evidence list' to view all registered evidence items.",
          ],
        };
      }

      const e = result.singleItem;
      lines.push(
        '================================================================================'
      );
      lines.push(`  EVIDENCE RECORD // ${e.id}: ${e.title}`);
      lines.push(
        '================================================================================'
      );
      lines.push(`  Acquisition Time:   ${e.collectionTime}`);
      lines.push(`  Fictional Source:   ${e.source}`);
      lines.push(`  Evidence Type:      ${e.evidenceType}`);
      lines.push(`  Integrity Status:   [${e.integrityStatus}]`);
      lines.push(`  SHA-256 Hash:       ${e.hashSha256}`);
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Forensic Description:');
      lines.push(`    ${e.description}`);
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Simulated Chain of Custody Ledger:');
      for (const c of e.chainOfCustody) {
        lines.push(`    • [${c.time}] ${c.handler}`);
        lines.push(`      Action:    ${c.action}`);
        lines.push(`      Signature: ${c.signature}`);
      }
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('  Artifact Content Preview (Read-Only Forensic View):');
      for (const snip of e.artifactSnippet) {
        lines.push(`    ${snip}`);
      }
      lines.push(
        '--------------------------------------------------------------------------------'
      );
      lines.push('🎓 EDUCATIONAL TAKEAWAYS:');
      lines.push(
        '  • Hash Matching: If a single byte of evidence changed, the SHA-256 hash would differ.'
      );
      lines.push(
        '  • Chain of Custody: Proves who had access to the data from collection to courtroom.'
      );
      lines.push('  • Read-Only Safety: Digital forensic evidence is never modified or executed.');
      lines.push(
        '  • Documentation: Record your observations in the "Notes" application for audit.'
      );
      lines.push(
        '================================================================================'
      );

      return { stdout: lines };
    }

    lines.push('================================================================================');
    lines.push('  CEDARLINE SEC-OPS FORENSIC EVIDENCE REPOSITORY');
    lines.push('  Storage: Sandboxed In-Game Memory Locker // Status: READ-ONLY');
    lines.push('================================================================================');
    lines.push(
      `${'EVIDENCE ID'.padEnd(20)} ${'STATUS'.padEnd(12)} ${'ACQUIRED'.padEnd(16)} ${'TITLE'}`
    );
    lines.push('--------------------------------------------------------------------------------');

    for (const e of result.items) {
      const shortTime = e.collectionTime.includes('//')
        ? (e.collectionTime.split('//')[1]?.trim() ?? e.collectionTime)
        : e.collectionTime;
      lines.push(
        `${e.id.padEnd(20)} ${e.integrityStatus.padEnd(12)} ${shortTime.slice(0, 15).padEnd(16)} ${e.title}`
      );
    }

    lines.push('--------------------------------------------------------------------------------');
    lines.push(`Total evidence objects in vault: ${result.items.length}`);
    lines.push('');
    lines.push('🎓 Instructions:');
    lines.push(
      '  • Type "evidence inspect <EVIDENCE-ID>" to inspect custody and view artifact data.'
    );
    lines.push('  • Example: "evidence inspect EVD-2026-001"');
    lines.push('================================================================================');

    return { stdout: lines };
  }
}
