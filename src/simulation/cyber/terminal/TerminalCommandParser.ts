/**
 * Cyberlife — Terminal Command Parser
 *
 * Safely parses and dispatches text commands in the simulated terminal.
 *
 * STRICT SAFETY INVARIANTS:
 * - No eval, Function, child_process, or host shell invocation.
 * - Shell injection/escape operators are rejected with friendly guidance.
 * - Returns structured TerminalCommandResult.
 */

import { TerminalCommandResult, TerminalExecutionContext } from './types';
import { TerminalCommandRegistry, createDefaultCommandRegistry } from './TerminalCommandRegistry';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = new Array<number>(n + 1).fill(0);
  for (let j = 0; j <= n; j++) {
    dp[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const diag = dp[j - 1] ?? 0;
      const top = dp[j] ?? 0;
      let cur: number;
      if (a[i - 1] === b[j - 1]) {
        cur = diag;
      } else {
        cur = 1 + Math.min(prev, top, diag);
      }
      dp[j - 1] = prev;
      prev = cur;
    }
    dp[n] = prev;
  }
  return dp[n] ?? Math.max(m, n);
}

export class TerminalCommandParser {
  private registry: TerminalCommandRegistry;

  constructor(registry: TerminalCommandRegistry = createDefaultCommandRegistry()) {
    this.registry = registry;
  }

  public getRegistry(): TerminalCommandRegistry {
    return this.registry;
  }

  /**
   * Tokenizes an input string into command name and arguments.
   * Handles quoted strings ("hello world" or 'hello world') safely.
   */
  public tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote: '"' | "'" | null = null;

    for (const char of input) {
      if (inQuote) {
        if (char === inQuote) {
          inQuote = null;
        } else {
          current += char;
        }
      } else if (char === '"' || char === "'") {
        inQuote = char;
      } else if (/\s/.test(char)) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Evaluates a command string against the simulated environment.
   */
  public parseAndExecute(
    rawInput: string,
    context: TerminalExecutionContext
  ): TerminalCommandResult {
    const trimmed = rawInput.trim();

    // 1. Empty input produces no output
    if (!trimmed) {
      return { stdout: [] };
    }

    // 1b. Excessive input boundary check
    if (trimmed.length > 512) {
      return {
        isError: true,
        stdout: [
          `Syntax notice: Command exceeds maximum input length limit of 512 characters (${trimmed.length} chars entered).`,
          "Please shorten your command or type 'help' for usage instructions.",
        ],
      };
    }

    // 2. Prohibit unhandled shell operators (pipes, redirects, backgrounding, semicolons, subshells)
    const shellOperatorMatch = /[|;<>&`$]/.exec(trimmed);
    if (shellOperatorMatch) {
      return {
        isError: true,
        stdout: [
          `Syntax notice: Shell operators (like '${shellOperatorMatch[0]}') are not supported in this simulated terminal.`,
          "Type 'help' to see the list of available in-game commands.",
        ],
      };
    }

    // 3. Tokenize input
    const tokens = this.tokenize(trimmed);
    const commandName = tokens[0]?.toLowerCase();
    const args = tokens.slice(1);

    if (!commandName) {
      return { stdout: [] };
    }

    // 4. Look up in registry
    const handler = this.registry.get(commandName);
    if (!handler) {
      // 4a. Check known real shell commands to guide players
      const COMMON_SHELL_COMMANDS: Record<string, string> = {
        ls: "In Cyberlife, file and artifact browsing is handled via dedicated apps or tools. Try 'evidence list' or 'logview recent'.",
        dir: "In Cyberlife, file and artifact browsing is handled via dedicated apps or tools. Try 'evidence list' or 'logview recent'.",
        cd: "Directory navigation is managed visually via desktop applications. Type 'help' to see available terminal tools.",
        cat: "To view forensic artifacts or evidence contents, use 'evidence inspect <evidence-id>'.",
        ping: "To discover active network devices on the subnet, use 'netmap hosts'.",
        nmap: "In Cyberlife, network discovery uses 'netmap hosts' and port/service inspection uses 'svcscan inspect <host>'.",
        wireshark:
          "Network and security telemetry is inspected using 'logview recent' or 'logview filter'.",
        sudo: "Administrative incident actions are executed using 'aster-admin' (e.g. 'aster-admin status').",
        exit: "To exit the virtual desktop, click the 'Exit Desktop' button at the top-right or press [Esc].",
        quit: "To exit the virtual desktop, click the 'Exit Desktop' button at the top-right or press [Esc].",
      };

      const stdoutLines = [
        `Command '${commandName}' is not recognized in this simulated terminal.`,
        "Type 'help' to view the list of supported in-game commands.",
      ];

      if (COMMON_SHELL_COMMANDS[commandName]) {
        stdoutLines.push(`Notice: '${commandName}' is a real-world utility.`);
        stdoutLines.push(COMMON_SHELL_COMMANDS[commandName]);
      } else {
        // 4b. Find closest matching command (Levenshtein / prefix match)
        const allRegistered = this.registry.getAll().map(h => h.name.toLowerCase());
        let bestMatch: string | null = null;
        let minDistance = 3; // Max threshold

        for (const candidate of allRegistered) {
          if (candidate.startsWith(commandName) || commandName.startsWith(candidate)) {
            bestMatch = candidate;
            break;
          }
          const dist = levenshtein(commandName, candidate);
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = candidate;
          }
        }

        if (bestMatch) {
          stdoutLines.push(`💡 Did you mean: '${bestMatch}'?`);
        }
      }

      stdoutLines.push(
        'Open the Field Guide app (📖) on your desktop for detailed tool manuals and tutorials.'
      );

      return {
        isError: true,
        stdout: stdoutLines,
      };
    }

    // 5. Execute handler safely
    try {
      return handler.execute(args, context);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        stdout: [
          `Error executing command '${commandName}': ${errorMsg}`,
          "Type 'help' to review proper command syntax.",
        ],
      };
    }
  }
}

/**
 * Convenience factory to create a default parser with all M4 commands registered.
 */
export function createDefaultTerminalParser(): TerminalCommandParser {
  return new TerminalCommandParser(createDefaultCommandRegistry());
}
