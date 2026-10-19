import { describe, it, expect } from 'vitest';
import { createDefaultTerminalParser, TerminalExecutionContext } from '@/simulation/cyber/terminal';
import { createToolCommandHandler } from '@/simulation/cyber/tools';

describe('Milestone 5 Cybersecurity Tools', () => {
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
      username: 'tade_adebayo',
      displayName: 'Tade Adebayo',
      role: 'Security Analyst Intern',
      organization: 'Cedarline Services',
      accessTier: 1, // Tier 1 Clearance
    },
    workstation: {
      id: 'ws_cedarline_01',
      hostname: 'cedarline-sec-ws04.corp.local',
      osVersion: 'Parrot Security OS v4.5',
      ipAddress: '10.0.4.15',
      subnet: '255.255.255.0',
      status: 'Active (Simulated Intranet)',
      locationId: 'cedarline_interior',
    },
    history: [],
  };

  const parser = createDefaultTerminalParser();

  // ==========================================================================
  // Tool 2 — Network Discovery (`netmap`)
  // ==========================================================================
  describe('NetmapTool (Network Discovery)', () => {
    it('lists all reachable subnet hosts on netmap hosts', () => {
      const result = parser.parseAndExecute('netmap hosts', mockContext);

      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('DISCOVERED SUBNET HOST INVENTORY'))).toBe(true);
      expect(result.stdout.some(l => l.includes('ws-sec-04'))).toBe(true);
      expect(result.stdout.some(l => l.includes('filesrv-01'))).toBe(true);
      expect(result.stdout.some(l => l.includes('app-portal-01'))).toBe(true);
      expect(result.stdout.some(l => l.includes('gw-core-01'))).toBe(true);
      expect(result.stdout.some(l => l.includes('EDUCATIONAL GUIDANCE'))).toBe(true);
    });

    it('inspects a specific host by id and by IP address', () => {
      const byId = parser.parseAndExecute('netmap inspect filesrv-01', mockContext);
      expect(byId.isError).toBeFalsy();
      expect(byId.stdout.some(l => l.includes('10.0.4.50'))).toBe(true);
      expect(byId.stdout.some(l => l.includes('Debian GNU/Linux 12'))).toBe(true);
      expect(byId.stdout.some(l => l.includes('Corporate Document Repository'))).toBe(true);

      const byIp = parser.parseAndExecute('netmap inspect 10.0.4.80', mockContext);
      expect(byIp.isError).toBeFalsy();
      expect(byIp.stdout.some(l => l.includes('app-portal-01'))).toBe(true);
    });

    it('filters hosts by role', () => {
      const result = parser.parseAndExecute('netmap filter workstation', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('ws-sec-04'))).toBe(true);
      expect(result.stdout.some(l => l.includes('ws-finance-02'))).toBe(true);
      expect(result.stdout.some(l => l.includes('filesrv-01'))).toBe(false);
    });

    it('returns a constructive error when inspecting an unknown host', () => {
      const result = parser.parseAndExecute('netmap inspect ghost-host-99', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain("Host identifier 'ghost-host-99' was not found");
      expect(result.stdout[1]).toContain("Type 'netmap hosts'");
    });

    it('returns syntax guidance when missing action or parameters', () => {
      const missingAction = parser.parseAndExecute('netmap', mockContext);
      expect(missingAction.isError).toBe(true);
      expect(missingAction.stdout[0]).toContain("Missing action for 'netmap'");

      const missingInspectTarget = parser.parseAndExecute('netmap inspect', mockContext);
      expect(missingInspectTarget.isError).toBe(true);
      expect(missingInspectTarget.stdout[0]).toContain('Missing target host identifier');
    });

    it('enforces simulated access control on restricted vault host', () => {
      const result = parser.parseAndExecute('netmap inspect vault-core-01', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout.some(l => l.includes('ACCESS RESTRICTION'))).toBe(true);
      expect(result.stdout.some(l => l.includes('Clearance Tier 2'))).toBe(true);
    });
  });

  // ==========================================================================
  // Tool 3 — Service Inventory (`svcscan`)
  // ==========================================================================
  describe('SvcscanTool (Service Inventory)', () => {
    it('returns different service inventories for different hosts', () => {
      const financeResult = parser.parseAndExecute('svcscan inspect ws-finance-02', mockContext);
      expect(financeResult.isError).toBeFalsy();
      expect(financeResult.stdout.some(l => l.includes('445/tcp'))).toBe(true); // SMB
      expect(financeResult.stdout.some(l => l.includes('3389/tcp'))).toBe(true); // RDP
      expect(financeResult.stdout.some(l => l.includes('80/tcp'))).toBe(false);

      const appResult = parser.parseAndExecute('svcscan inspect app-portal-01', mockContext);
      expect(appResult.isError).toBeFalsy();
      expect(appResult.stdout.some(l => l.includes('80/tcp'))).toBe(true);
      expect(appResult.stdout.some(l => l.includes('443/tcp'))).toBe(true);
      expect(appResult.stdout.some(l => l.includes('8080/tcp'))).toBe(true);
      expect(appResult.stdout.some(l => l.includes('REQUIRES REVIEW'))).toBe(true);
    });

    it('lists all services across the network on svcscan list', () => {
      const result = parser.parseAndExecute('svcscan list', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('ALL INVENTORIED SERVICES'))).toBe(true);
      expect(result.stdout.some(l => l.includes('filesrv-01'))).toBe(true);
      expect(result.stdout.some(l => l.includes('gw-core-01'))).toBe(true);
    });

    it('filters services by review status', () => {
      const reviewResult = parser.parseAndExecute('svcscan filter review', mockContext);
      expect(reviewResult.isError).toBeFalsy();
      expect(reviewResult.stdout.some(l => l.includes('8080/tcp'))).toBe(true); // tomcat
      expect(reviewResult.stdout.some(l => l.includes('443/tcp'))).toBe(false); // https is approved
    });

    it('teaches the distinction between discovery and vulnerability', () => {
      const result = parser.parseAndExecute('svcscan inspect filesrv-01', mockContext);
      expect(result.stdout.some(l => l.includes('EDUCATIONAL TAKEAWAYS'))).toBe(true);
      expect(result.stdout.some(l => l.includes('DISCOVERY'))).toBe(true);
    });

    it('handles unknown host in svcscan gracefully', () => {
      const result = parser.parseAndExecute('svcscan inspect non-existent-srv', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain("Host 'non-existent-srv' not recognized");
    });
  });

  // ==========================================================================
  // Tool 4 — Log Analysis (`logview`)
  // ==========================================================================
  describe('LogviewTool (Log Analysis)', () => {
    it('returns recent logs with simulation timestamps', () => {
      const result = parser.parseAndExecute('logview recent', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('RECENT EVENTS'))).toBe(true);
      expect(result.stdout.some(l => l.includes('LOG-2026-101'))).toBe(true);
      expect(result.stdout.some(l => l.includes('AUTH_SUCCESS'))).toBe(true);
    });

    it('supports limiting log output count with --limit', () => {
      const result = parser.parseAndExecute('logview recent --limit=3', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('Limit: 3'))).toBe(true);
    });

    it('filters logs by source (e.g. auth, firewall, app-portal)', () => {
      const authResult = parser.parseAndExecute('logview filter --source=auth', mockContext);
      expect(authResult.isError).toBeFalsy();
      expect(authResult.stdout.some(l => l.includes('AUTH_SUCCESS'))).toBe(true);
      expect(authResult.stdout.some(l => l.includes('AUTH_FAILURE'))).toBe(true);
      expect(authResult.stdout.some(l => l.includes('gw-core-01'))).toBe(false);
    });

    it('filters logs by severity (e.g. WARN, ERROR)', () => {
      const warnResult = parser.parseAndExecute('logview filter --severity=WARN', mockContext);
      expect(warnResult.isError).toBeFalsy();
      expect(warnResult.stdout.some(l => l.includes('WARN'))).toBe(true);
      expect(warnResult.stdout.some(l => l.includes('INFO'))).toBe(false);
    });

    it('inspects a specific log entry by id', () => {
      const result = parser.parseAndExecute('logview inspect LOG-2026-104', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('EVENT INSPECTION: LOG-2026-104'))).toBe(true);
      expect(result.stdout.some(l => l.includes('folake_alabi'))).toBe(true);
      expect(result.stdout.some(l => l.includes('ANALYST INTERPRETATION'))).toBe(true);
    });

    it('handles unknown log ID gracefully', () => {
      const result = parser.parseAndExecute('logview inspect LOG-9999-XYZ', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain("Log event 'LOG-9999-XYZ' not found");
    });

    it('rejects invalid filter severity with helpful options', () => {
      const result = parser.parseAndExecute('logview filter --severity=CRITICAL', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain("Invalid severity level 'CRITICAL'");
      expect(result.stdout[1]).toContain('Permitted severities: INFO, NOTICE, WARN, ERROR');
    });
  });

  // ==========================================================================
  // Tool 5 — File and Evidence Inspection (`evidence`)
  // ==========================================================================
  describe('EvidenceTool (Evidence Inspection)', () => {
    it('lists registered evidence artifacts on evidence list', () => {
      const result = parser.parseAndExecute('evidence list', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('FORENSIC EVIDENCE REPOSITORY'))).toBe(true);
      expect(result.stdout.some(l => l.includes('EVD-2026-001'))).toBe(true);
      expect(result.stdout.some(l => l.includes('EVD-2026-002'))).toBe(true);
      expect(result.stdout.some(l => l.includes('EVD-2026-003'))).toBe(true);
    });

    it('inspects an evidence item showing SHA-256 hash and custody ledger', () => {
      const result = parser.parseAndExecute('evidence inspect EVD-2026-001', mockContext);
      expect(result.isError).toBeFalsy();
      expect(result.stdout.some(l => l.includes('EVD-2026-001'))).toBe(true);
      expect(result.stdout.some(l => l.includes('SHA-256 Hash'))).toBe(true);
      expect(
        result.stdout.some(l =>
          l.includes('7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069')
        )
      ).toBe(true);
      expect(result.stdout.some(l => l.includes('Simulated Chain of Custody Ledger'))).toBe(true);
      expect(result.stdout.some(l => l.includes('Chidi Okafor'))).toBe(true);
      expect(result.stdout.some(l => l.includes('EDUCATIONAL TAKEAWAYS'))).toBe(true);
    });

    it('returns error when inspecting non-existent evidence', () => {
      const result = parser.parseAndExecute('evidence inspect EVD-999-NOTFOUND', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain("Evidence identifier 'EVD-999-NOTFOUND' was not found");
    });

    it('enforces access control on restricted Tier 2 evidence', () => {
      const result = parser.parseAndExecute('evidence inspect EVD-2026-RESTRICTED', mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout.some(l => l.includes('ACCESS RESTRICTION'))).toBe(true);
      expect(result.stdout.some(l => l.includes('Clearance Tier 2'))).toBe(true);
      expect(result.stdout.some(l => l.includes('Security Concepts -> IAM'))).toBe(true);
    });
  });

  // ==========================================================================
  // Boundary Protection & Safety
  // ==========================================================================
  describe('Safety & Input Boundaries', () => {
    it('rejects commands exceeding 512 characters', () => {
      const hugeInput = 'netmap inspect ' + 'a'.repeat(600);
      const result = parser.parseAndExecute(hugeInput, mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain('exceeds maximum input length limit of 512 characters');
    });

    it('rejects commands with excessive arguments (>20 args)', () => {
      const manyArgs = 'netmap filter ' + Array(25).fill('arg').join(' ');
      const result = parser.parseAndExecute(manyArgs, mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain('Too many arguments supplied to');
    });

    it('safely handles internal exceptions without crashing the terminal', () => {
      const throwingTool = {
        metadata: {
          id: 'tool_throw',
          name: 'thrower',
          displayName: 'Thrower',
          description: 'Throws error',
          learningObjective: 'test',
          syntax: 'thrower',
          examples: ['thrower'],
          requiredTier: 1 as const,
        },
        parseArgs: () => ({ success: true as const, args: {} }),
        checkAccess: () => ({ allowed: true as const }),
        execute: () => {
          throw new Error('Simulated memory exception');
        },
        formatOutput: () => ({ stdout: [] }),
      };

      const handler = createToolCommandHandler(throwingTool);
      const result = handler.execute([], mockContext);
      expect(result.isError).toBe(true);
      expect(result.stdout[0]).toContain('Simulated memory exception');
    });
  });
});
