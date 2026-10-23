import { describe, it, expect } from 'vitest';
import {
  createDefaultTerminalParser,
  createDefaultCommandRegistry,
  TerminalCommandParser,
  TerminalCommandRegistry,
  TerminalExecutionContext,
  TerminalCommandHandler,
} from '@/simulation/cyber/terminal';

describe('TerminalCommandParser & Registry', () => {
  const mockContext: TerminalExecutionContext = {
    simulationTime: {
      dateString: 'Monday, Oct 12, 2026',
      timeString: '08:00 AM',
      iso: '2026-10-12T08:00:00.000Z',
      year: 2026,
      month: 10,
      day: 12,
      hour: 8,
      minute: 0,
      second: 0,
      dayOfWeek: 'Monday',
    },
    currentUser: {
      username: 'protector',
      displayName: 'Protector',
      role: 'Security Analyst Intern',
      organization: 'Cedarline Services',
    },
    workstation: {
      id: 'ws_cedarline_01',
      hostname: 'cedarline-sec-ws04.corp.local',
      osVersion: 'CyberOS Enterprise v4.2',
      ipAddress: '10.0.4.15',
      subnet: '255.255.255.0',
      status: 'Active (Simulated Intranet)',
      locationId: 'cedarline_interior',
    },
    history: ['whoami', 'date'],
  };

  it('initializes default registry with standard commands and M5 cyber tools', () => {
    const registry = createDefaultCommandRegistry();
    expect(registry.has('help')).toBe(true);
    expect(registry.has('clear')).toBe(true);
    expect(registry.has('whoami')).toBe(true);
    expect(registry.has('date')).toBe(true);
    expect(registry.has('status')).toBe(true);
    expect(registry.has('history')).toBe(true);
    expect(registry.has('netmap')).toBe(true);
    expect(registry.has('svcscan')).toBe(true);
    expect(registry.has('logview')).toBe(true);
    expect(registry.has('evidence')).toBe(true);
    expect(registry.has('aster-admin')).toBe(true);
    expect(registry.has('catalogue')).toBe(true);
    expect(registry.has('pwd')).toBe(true);
    expect(registry.has('ls')).toBe(true);
    expect(registry.has('cd')).toBe(true);
    expect(registry.has('cat')).toBe(true);
    expect(registry.has('grep')).toBe(true);
    expect(registry.has('file')).toBe(true);
    expect(registry.has('nmap')).toBe(true);
    expect(registry.has('packetview')).toBe(true);
    expect(registry.has('revview')).toBe(true);
    expect(registry.has('exploitlab')).toBe(true);
    expect(registry.has('webproxy')).toBe(true);
    expect(registry.has('pretext')).toBe(true);
    expect(registry.has('threatintel')).toBe(true);
    expect(registry.has('topology')).toBe(true);
    expect(registry.has('blueops')).toBe(true);
    expect(registry.has('purpleteam')).toBe(true);
    expect(registry.has('redteam')).toBe(true);
    expect(registry.has('bounty')).toBe(true);
    expect(registry.has('humint')).toBe(true);
    expect(registry.has('forensics')).toBe(true);
    expect(registry.has('soctriage')).toBe(true);
    expect(registry.has('complianceaudit')).toBe(true);
    expect(registry.has('journal')).toBe(true);
    expect(registry.getAll().length).toBe(35);
  });

  it('executes help command returning available commands and beginner tips', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('help', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout.some(line => line.includes('whoami'))).toBe(true);
    expect(result.stdout.some(line => line.includes('date'))).toBe(true);
    expect(result.stdout.some(line => line.includes('status'))).toBe(true);
    expect(result.stdout.some(line => line.includes('Tips for Beginners'))).toBe(true);
  });

  it('executes help for a specific command', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('help date', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout.some(line => line.includes('Command: date'))).toBe(true);
  });

  it('executes clear command returning clearScreen flag', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('clear', mockContext);

    expect(result.clearScreen).toBe(true);
    expect(result.stdout).toEqual([]);
  });

  it('executes whoami command showing fictional user persona', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('whoami', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout).toContain('protector');
    expect(result.stdout.some(line => line.includes('Cedarline Services'))).toBe(true);
    expect(result.stdout.some(line => line.includes('Security Analyst Intern'))).toBe(true);
  });

  it('executes date command returning in-game simulation clock', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('date', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout[0]).toBe('Monday, Oct 12, 2026 08:00 AM WAT (West Africa Time)');
    expect(result.stdout[1]).toContain('Authoritative Cyberlife Simulation Engine');
  });

  it('executes status command showing workstation details and host isolation note', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('status', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout.some(line => line.includes('cedarline-sec-ws04.corp.local'))).toBe(true);
    expect(result.stdout.some(line => line.includes('CyberOS Enterprise v4.2'))).toBe(true);
    expect(result.stdout.some(line => line.includes('10.0.4.15'))).toBe(true);
    expect(result.stdout.some(line => line.includes('100% synthetic in-game sandbox'))).toBe(true);
  });

  it('executes history command showing past session commands', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('history', mockContext);

    expect(result.isError).toBeFalsy();
    expect(result.stdout.length).toBe(2);
    expect(result.stdout[0]).toContain('whoami');
    expect(result.stdout[1]).toContain('date');
  });

  it('handles empty history gracefully', () => {
    const parser = createDefaultTerminalParser();
    const emptyCtx = { ...mockContext, history: [] };
    const result = parser.parseAndExecute('history', emptyCtx);

    expect(result.stdout[0]).toContain('No command history recorded');
  });

  it('handles case-insensitivity and whitespace padding', () => {
    const parser = createDefaultTerminalParser();
    const result1 = parser.parseAndExecute('   HELP   ', mockContext);
    expect(result1.isError).toBeFalsy();

    const result2 = parser.parseAndExecute('WhoAmI', mockContext);
    expect(result2.isError).toBeFalsy();
    expect(result2.stdout).toContain('protector');
  });

  it('handles empty or whitespace-only inputs without output or errors', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('    ', mockContext);
    expect(result.stdout).toEqual([]);
    expect(result.isError).toBeFalsy();
  });

  it('returns a constructive error message for unsupported commands', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('hydra -l admin 10.0.4.15', mockContext);

    expect(result.isError).toBe(true);
    expect(result.stdout[0]).toContain("Command 'hydra' is not recognized");
    expect(result.stdout[1]).toContain("Type 'help'");
  });

  it('prohibits shell injection operators with clear syntax guidance', () => {
    const parser = createDefaultTerminalParser();
    const pipeResult = parser.parseAndExecute('whoami | grep root', mockContext);
    expect(pipeResult.isError).toBe(true);
    expect(pipeResult.stdout[0]).toContain("Shell operators (like '|') are not supported");

    const semiResult = parser.parseAndExecute('whoami; date', mockContext);
    expect(semiResult.isError).toBe(true);
    expect(semiResult.stdout[0]).toContain("Shell operators (like ';') are not supported");

    const redirectResult = parser.parseAndExecute('date > file.txt', mockContext);
    expect(redirectResult.isError).toBe(true);
    expect(redirectResult.stdout[0]).toContain("Shell operators (like '>') are not supported");
  });

  it('allows registering new commands dynamically for M5 extensibility', () => {
    const registry = new TerminalCommandRegistry();
    const customTool: TerminalCommandHandler = {
      name: 'ping-gateway',
      description: 'Synthetic ping test',
      usage: 'ping-gateway',
      execute: () => ({ stdout: ['PING 10.0.4.1: 64 bytes, time=1.2ms (Simulated)'] }),
    };

    registry.register(customTool);
    expect(registry.has('ping-gateway')).toBe(true);

    const parser = new TerminalCommandParser(registry);
    const result = parser.parseAndExecute('ping-gateway', mockContext);
    expect(result.stdout[0]).toContain('PING 10.0.4.1');
  });

  it('safely catches and reports unexpected handler exceptions', () => {
    const registry = new TerminalCommandRegistry();
    const buggyTool: TerminalCommandHandler = {
      name: 'buggy',
      description: 'Throws error',
      usage: 'buggy',
      execute: () => {
        throw new Error('Simulated internal fault');
      },
    };
    registry.register(buggyTool);

    const parser = new TerminalCommandParser(registry);
    const result = parser.parseAndExecute('buggy', mockContext);
    expect(result.isError).toBe(true);
    expect(result.stdout[0]).toContain('Simulated internal fault');
  });

  it('tokenizes quoted arguments safely', () => {
    const parser = createDefaultTerminalParser();
    const tokens = parser.tokenize('grep "admin token" \'secure notes\' plain_word');
    expect(tokens).toEqual(['grep', 'admin token', 'secure notes', 'plain_word']);
  });

  it('executes bounty CLI commands (list, view, rep, accept, status, scope)', async () => {
    const parser = createDefaultTerminalParser();

    // bounty list
    const listRes = await parser.parseAndExecute('bounty list', mockContext);
    expect(listRes.isError).toBeFalsy();
    expect(listRes.stdout.some(l => l.includes('ct-balogun-pos-audit'))).toBe(true);

    // bounty view
    const viewRes = await parser.parseAndExecute('bounty view ct-balogun-pos-audit', mockContext);
    expect(viewRes.isError).toBeFalsy();
    expect(viewRes.stdout.some(l => l.includes('Balogun Market'))).toBe(true);
    expect(viewRes.stdout.some(l => l.includes('Authorized In-Scope Targets'))).toBe(true);

    // bounty rep
    const repRes = await parser.parseAndExecute('bounty rep', mockContext);
    expect(repRes.isError).toBeFalsy();
    expect(repRes.stdout.some(l => l.includes('Reputation Score'))).toBe(true);

    // bounty accept
    const acceptRes = await parser.parseAndExecute('bounty accept ct-balogun-pos-audit', mockContext);
    expect(acceptRes.isError).toBeFalsy();
    expect(acceptRes.stdout.some(l => l.includes('CONTRACT ACCEPTED'))).toBe(true);

    // bounty status
    const statusRes = await parser.parseAndExecute('bounty status', mockContext);
    expect(statusRes.isError).toBeFalsy();
    expect(statusRes.stdout.some(l => l.includes('Objectives Progress'))).toBe(true);

    // bounty scope
    const scopeRes = await parser.parseAndExecute('bounty scope', mockContext);
    expect(scopeRes.isError).toBeFalsy();
    expect(scopeRes.stdout.some(l => l.includes('[IN-SCOPE] gw-balogun-pos-01'))).toBe(true);
  });
});
