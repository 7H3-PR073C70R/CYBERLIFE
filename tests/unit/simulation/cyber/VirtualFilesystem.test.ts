import { describe, it, expect } from 'vitest';
import {
  virtualFilesystem,
  resolveVirtualPath,
  VirtualFilesystem,
} from '@/simulation/cyber/filesystem';
import { createDefaultTerminalParser, TerminalExecutionContext } from '@/simulation/cyber/terminal';

describe('VirtualFilesystem & Terminal File Commands', () => {
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
      displayName: 'Protector',
      role: 'Security Analyst Intern',
      organization: 'Cedarline Services',
    },
    workstation: {
      id: 'ws_cedarline_01',
      hostname: 'cedarline-sec-ws04.corp.local',
      osVersion: 'EkoSec Linux 2026',
      ipAddress: '10.0.4.15',
      subnet: '255.255.255.0',
      status: 'Active (Simulated Intranet)',
      locationId: 'cedarline_interior',
    },
    currentDirectory: '/home/analyst',
    history: [],
  };

  it('resolves virtual relative and absolute paths safely', () => {
    expect(resolveVirtualPath('/home/analyst', 'notes.txt')).toBe('/home/analyst/notes.txt');
    expect(resolveVirtualPath('/home/analyst', '/var/log/auth.log')).toBe('/var/log/auth.log');
    expect(resolveVirtualPath('/home/analyst', '../analyst/notes.txt')).toBe(
      '/home/analyst/notes.txt'
    );
    expect(resolveVirtualPath('/home/analyst', '~')).toBe('/home/analyst');
    expect(resolveVirtualPath('/home/analyst', '~/projects')).toBe('/home/analyst/projects');
    expect(resolveVirtualPath('/home/analyst', '..')).toBe('/home');
    expect(resolveVirtualPath('/', '..')).toBe('/');
  });

  it('lists directory contents deterministically with permissions and metadata', () => {
    const rootChildren = virtualFilesystem.listDirectory('/');
    expect(rootChildren.some(c => c.name === 'home')).toBe(true);
    expect(rootChildren.some(c => c.name === 'var')).toBe(true);
    expect(rootChildren.some(c => c.name === 'etc')).toBe(true);
    expect(rootChildren.some(c => c.name === 'mnt')).toBe(true);
    expect(rootChildren.some(c => c.name === 'opt')).toBe(true);

    const logChildren = virtualFilesystem.listDirectory('/var/log');
    expect(logChildren.some(c => c.name === 'auth.log')).toBe(true);
    expect(logChildren.some(c => c.name === 'syslog')).toBe(true);

    const evidenceChildren = virtualFilesystem.listDirectory('/mnt/evidence');
    expect(evidenceChildren.some(c => c.name === 'EVD-2026-001.pcap')).toBe(true);
  });

  it('enforces read-only protection on system directories and allows writing in /home/analyst', () => {
    const vfs = new VirtualFilesystem();

    // Writing to read-only /var/log must fail
    const varResult = vfs.writeFile('/var/log/tamper.log', 'malicious content');
    expect(varResult.success).toBe(false);
    expect(varResult.error).toContain('is read-only');

    // Writing to read-only /etc/security must fail
    const etcResult = vfs.writeFile('/etc/security/hacked.conf', 'admin:all');
    expect(etcResult.success).toBe(false);

    // Writing to /home/analyst succeeds
    const userResult = vfs.writeFile('/home/analyst/scratchpad.txt', 'hypothesis verified');
    expect(userResult.success).toBe(true);
    const readBack = vfs.readFile('/home/analyst/scratchpad.txt');
    expect(readBack?.content).toBe('hypothesis verified');
  });

  it('executes pwd command showing current virtual directory', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('pwd', mockContext);
    expect(result.stdout).toEqual(['/home/analyst']);
  });

  it('executes ls and ls -l with formatting and file details', () => {
    const parser = createDefaultTerminalParser();
    const resultSimple = parser.parseAndExecute('ls', mockContext);
    expect(resultSimple.stdout[0]).toContain('notes.txt');

    const resultDetailed = parser.parseAndExecute('ls -l /var/log', mockContext);
    expect(resultDetailed.stdout.some(l => l.includes('auth.log'))).toBe(true);
    expect(resultDetailed.stdout.some(l => l.includes('-rw-r-----'))).toBe(true);
  });

  it('executes cd command changing current directory', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('cd /mnt/evidence', mockContext);
    expect(result.newDirectory).toBe('/mnt/evidence');

    const invalidResult = parser.parseAndExecute('cd /nonexistent/dir', mockContext);
    expect(invalidResult.isError).toBe(true);
    expect(invalidResult.stderr?.[0]).toContain('No such file or directory');
  });

  it('executes cat command to inspect text files and prevents reading non-existent paths', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('cat /etc/security/access.conf', mockContext);
    expect(result.stdout.some(l => l.includes('Cedarline RBAC Policy'))).toBe(true);

    const missingResult = parser.parseAndExecute('cat /no_file.txt', mockContext);
    expect(missingResult.isError).toBe(true);
    expect(missingResult.stderr?.[0]).toContain('No such file or directory');
  });

  it('executes grep command to filter lines in virtual files', () => {
    const parser = createDefaultTerminalParser();
    const result = parser.parseAndExecute('grep "Failed password" /var/log/auth.log', mockContext);
    expect(result.stdout.some(l => l.includes('Failed password'))).toBe(true);
  });

  it('executes file command identifying file types and encodings', () => {
    const parser = createDefaultTerminalParser();
    const pcapRes = parser.parseAndExecute('file /mnt/evidence/EVD-2026-001.pcap', mockContext);
    expect(pcapRes.stdout[0]).toContain('tcpdump capture file');

    const txtRes = parser.parseAndExecute('file /home/analyst/notes.txt', mockContext);
    expect(txtRes.stdout[0]).toContain('ASCII text');
  });

  it('executes nmap, packetview, and revview educational commands and aliases', () => {
    const parser = createDefaultTerminalParser();
    const nmapRes = parser.parseAndExecute('nmap hosts', mockContext);
    expect(nmapRes.stdout.some(l => l.includes('EkoSec Educational Alias'))).toBe(true);
    expect(nmapRes.stdout.some(l => l.includes('10.0.4.50'))).toBe(true);

    const pcapRes = parser.parseAndExecute('packetview smb', mockContext);
    expect(pcapRes.stdout.some(l => l.includes('Packet Lens'))).toBe(true);
    expect(pcapRes.stdout.some(l => l.includes('payroll$'))).toBe(true);

    const revRes = parser.parseAndExecute('revview strings', mockContext);
    expect(revRes.stdout.some(l => l.includes('Static String Extraction'))).toBe(true);
    expect(revRes.stdout.some(l => l.includes('svc-aster'))).toBe(true);
  });
});
