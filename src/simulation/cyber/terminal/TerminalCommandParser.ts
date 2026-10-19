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
      return {
        isError: true,
        stdout: [
          `Command '${commandName}' is not recognized in this simulated terminal.`,
          "Type 'help' to view the list of supported in-game commands.",
        ],
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
