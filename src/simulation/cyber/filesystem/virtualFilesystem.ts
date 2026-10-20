/**
 * Cyberlife — Simulated Virtual Filesystem Implementation
 *
 * Deterministic in-memory file structure modeled for a security analyst workstation.
 * Read-only enforcement on system directories (/var, /etc, /mnt, /opt).
 * Read-write support in /home/analyst.
 * Strictly isolated from real host machine operating system.
 */

import { VirtualFileEntry } from './types';

// Initial synthetic virtual file records
const INITIAL_VIRTUAL_FILES: Record<string, VirtualFileEntry> = {
  // Root and top-level directories
  '/': {
    name: '/',
    path: '/',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/home': {
    name: 'home',
    path: '/home',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/home/analyst': {
    name: 'analyst',
    path: '/home/analyst',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:00',
    readOnly: false,
  },
  '/home/analyst/downloads': {
    name: 'downloads',
    path: '/home/analyst/downloads',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:00',
    readOnly: false,
  },
  '/home/analyst/notes.txt': {
    name: 'notes.txt',
    path: '/home/analyst/notes.txt',
    type: 'file',
    sizeBytes: 642,
    permissions: '-rw-r--r--',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:15',
    readOnly: false,
    content: `# Security Analyst Investigation Notes
Workstation: ws-sec-04 (10.0.4.15)
Incident: SIEM Alert 2026-107B / Aster Incident

OBSERVATIONS:
1. Service account 'svc-aster' performed after-hours queries on filesrv-01.
2. Port 445 (SMB) on filesrv-01 appears accessible without host restrictions.
3. RBAC role 'corporate-admin' grants wildcard [*] scope across storage buckets.
4. Digital evidence preserved in /mnt/evidence/EVD-2026-004.raw.

TODO:
- [x] Correlate syslog authentication timestamps
- [ ] Run netmap scan on 10.0.4.0/24 subnet
- [ ] Verify SHA-256 hash digest of evidence artifact
- [ ] Tune SIEM lateral movement rule in Purple Console
`,
  },
  '/home/analyst/recon_targets.cfg': {
    name: 'recon_targets.cfg',
    path: '/home/analyst/recon_targets.cfg',
    type: 'file',
    sizeBytes: 284,
    permissions: '-rw-r--r--',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:05',
    readOnly: false,
    content: `# Cedarline Solutions Authorized Staging Subnet Scope
# Rules of Engagement: #ROE-2026-AST
SUBNET=10.0.4.0/24
GATEWAY=10.0.4.1
AUTHORIZED_HOSTS=app-portal-01,filesrv-01,db-stage-01,ws-sec-04
RESTRICTED_HOSTS=vault-core-01 (DO NOT SCAN)
`,
  },
  '/home/analyst/roe_agreement.md': {
    name: 'roe_agreement.md',
    path: '/home/analyst/roe_agreement.md',
    type: 'file',
    sizeBytes: 512,
    permissions: '-rw-r--r--',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 07:30',
    readOnly: true,
    content: `# RULES OF ENGAGEMENT (RoE)
Reference: ROE-2026-AST
Target Organization: Cedarline Solutions Nigeria Ltd.
Scope: Marina Tower Internal Staging Cluster (10.0.4.0/24)
Allowed Actions: Passive enumeration, service banner grabbing, attack path modeling.
Prohibited Actions: Destructive payloads, denial of service, data exfiltration.
Authorized By: Chief Information Security Officer (CISO)
`,
  },
  '/home/analyst/reports': {
    name: 'reports',
    path: '/home/analyst/reports',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:10',
    readOnly: false,
  },
  '/home/analyst/reports/findings_draft_roe_2026.md': {
    name: 'findings_draft_roe_2026.md',
    path: '/home/analyst/reports/findings_draft_roe_2026.md',
    type: 'file',
    sizeBytes: 480,
    permissions: '-rw-r--r--',
    owner: 'analyst',
    group: 'analyst',
    modifiedDate: '2026-10-12 08:20',
    readOnly: false,
    content: `# Penetration Testing Finding Report (Draft)
Finding ID: FIND-ROE-2026-001
Title: Unrestricted SMB Service Exposure & Excessive Service Account Privileges
Severity: HIGH (CVSS 7.8)
Target Host: filesrv-01 (10.0.4.20)
Impact: Intranet web service compromise leads to lateral movement to payroll shares.
Remediation: Enforce network segmentation and bind svc-aster permissions to docs:read only.
`,
  },

  // /var/log directory
  '/var': {
    name: 'var',
    path: '/var',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/var/log': {
    name: 'log',
    path: '/var/log',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'adm',
    modifiedDate: '2026-10-12 08:00',
    readOnly: true,
  },
  '/var/log/auth.log': {
    name: 'auth.log',
    path: '/var/log/auth.log',
    type: 'file',
    sizeBytes: 1024,
    permissions: '-rw-r-----',
    owner: 'root',
    group: 'adm',
    modifiedDate: '2026-10-12 08:14',
    readOnly: true,
    content: `Oct 12 01:14:02 filesrv-01 sshd[4912]: Failed password for root from 192.168.1.50 port 49202 ssh2
Oct 12 01:14:08 filesrv-01 sshd[4915]: Failed password for root from 192.168.1.50 port 49204 ssh2
Oct 12 02:22:15 filesrv-01 smbd[5120]: Authenticated user svc-aster (domain: CORP, client: 10.0.4.10)
Oct 12 02:22:18 filesrv-01 smbd[5120]: Tree connect to share [payroll$] by svc-aster (READ_CONTROL)
Oct 12 02:22:20 filesrv-01 smbd[5120]: Opened file '\\payroll$\\october_salaries.xlsx' by svc-aster
Oct 12 08:00:01 ws-sec-04 systemd-logind[104]: Session 1 logged in for user analyst
`,
  },
  '/var/log/syslog': {
    name: 'syslog',
    path: '/var/log/syslog',
    type: 'file',
    sizeBytes: 768,
    permissions: '-rw-r-----',
    owner: 'root',
    group: 'adm',
    modifiedDate: '2026-10-12 08:10',
    readOnly: true,
    content: `Oct 12 00:00:01 ws-sec-04 CRON[3201]: (root) CMD (/opt/tools/healthcheck.sh)
Oct 12 02:22:14 app-portal-01 node[810]: Assistant process spawned outbound SMB socket to 10.0.4.20:445
Oct 12 06:00:00 ws-sec-04 kernel: [    0.000000] EkoSec Linux 2026 Security Edition initialized
Oct 12 08:00:00 ws-sec-04 networkd[210]: eth0: link ready, assigned 10.0.4.15/24
`,
  },
  '/var/log/siem_alerts.json': {
    name: 'siem_alerts.json',
    path: '/var/log/siem_alerts.json',
    type: 'file',
    sizeBytes: 890,
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'adm',
    modifiedDate: '2026-10-12 08:12',
    readOnly: true,
    content: JSON.stringify(
      [
        {
          alertId: 'SIEM-2026-107B',
          timestamp: '2026-10-12 02:22:20 WAT',
          rule: 'RULE-DET-AUTH-BRUTEFORCE',
          severity: 'HIGH',
          source: '10.0.4.10',
          target: 'filesrv-01 (10.0.4.20)',
          summary: 'Anomalous after-hours credential usage by service account svc-aster.',
        },
        {
          alertId: 'SIEM-2026-104A',
          timestamp: '2026-10-12 01:14:08 WAT',
          rule: 'RULE-DET-SSH-ROOT',
          severity: 'WARN',
          source: '192.168.1.50',
          target: 'filesrv-01',
          summary: 'Repeated failed root login attempts over SSH.',
        },
      ],
      null,
      2
    ),
  },

  // /mnt/evidence directory
  '/mnt': {
    name: 'mnt',
    path: '/mnt',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/mnt/evidence': {
    name: 'evidence',
    path: '/mnt/evidence',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'analyst',
    modifiedDate: '2026-10-12 07:45',
    readOnly: true,
  },
  '/mnt/evidence/EVD-2026-001.pcap': {
    name: 'EVD-2026-001.pcap',
    path: '/mnt/evidence/EVD-2026-001.pcap',
    type: 'file',
    sizeBytes: 16384,
    permissions: '-r--r-----',
    owner: 'root',
    group: 'analyst',
    modifiedDate: '2026-10-12 07:00',
    readOnly: true,
    description:
      'PCAP capture of unauthorized SMB session negotiation between app-portal-01 and filesrv-01.',
    content:
      '[BINARY PCAP DATA: 128 Packets, Protocol: SMB2/TCP, SHA-256: 4f1a... Use packetview to inspect]',
  },
  '/mnt/evidence/EVD-2026-004.raw': {
    name: 'EVD-2026-004.raw',
    path: '/mnt/evidence/EVD-2026-004.raw',
    type: 'file',
    sizeBytes: 65536,
    permissions: '-r--r-----',
    owner: 'root',
    group: 'analyst',
    modifiedDate: '2026-10-12 07:15',
    readOnly: true,
    description:
      'Physical RAM dump snippet of Aster assistant daemon containing decrypted API token.',
    content:
      '[RAW MEMORY ARTIFACT: 64KB Core Dump, Target: aster-daemon, SHA-256: d8f3... Use revview to inspect]',
  },
  '/mnt/evidence/evidence_hashes.sha256': {
    name: 'evidence_hashes.sha256',
    path: '/mnt/evidence/evidence_hashes.sha256',
    type: 'file',
    sizeBytes: 320,
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'analyst',
    modifiedDate: '2026-10-12 07:50',
    readOnly: true,
    content: `4f1a92e10c7980bd3b865761a299587efc808f9b9f7a5b3a4c0c1e8d9e2b4f10  EVD-2026-001.pcap
d8f31920acb781198fbc10293847561029384756102938475610293847561029  EVD-2026-004.raw
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  aster_agent_daemon.bin
`,
  },

  // /etc/security directory
  '/etc': {
    name: 'etc',
    path: '/etc',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/etc/security': {
    name: 'security',
    path: '/etc/security',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/etc/security/access.conf': {
    name: 'access.conf',
    path: '/etc/security/access.conf',
    type: 'file',
    sizeBytes: 410,
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:30',
    readOnly: true,
    content: `# Cedarline RBAC Policy Configuration
role: kb-assistant
  allowed_scopes: ["docs:read", "kb:search"]
  prohibited: ["storage:write", "db:admin", "smb:read"]

role: corporate-admin (FLAGGED AS MISCONFIGURED)
  allowed_scopes: ["*"]
  assigned_to: ["svc-aster"]
`,
  },
  '/etc/security/detection_rules.yaml': {
    name: 'detection_rules.yaml',
    path: '/etc/security/detection_rules.yaml',
    type: 'file',
    sizeBytes: 520,
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:30',
    readOnly: true,
    content: `# SIEM Detection Ruleset
rules:
  - id: RULE-DET-AUTH-BRUTEFORCE
    field: eventType
    operator: EQUALS
    value: AUTH_FAILURE
    severity: WARN
    enabled: true
  - id: RULE-DET-SMB-LATERAL
    field: source
    operator: EQUALS
    value: file-server
    severity: CRITICAL
    enabled: false # (Needs tuning by Purple Team)
`,
  },

  // /opt/tools directory
  '/opt': {
    name: 'opt',
    path: '/opt',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/opt/tools': {
    name: 'tools',
    path: '/opt/tools',
    type: 'directory',
    sizeBytes: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
  },
  '/opt/tools/netmap': {
    name: 'netmap',
    path: '/opt/tools/netmap',
    type: 'file',
    sizeBytes: 45200,
    permissions: '-rwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
    content:
      '[ELF 64-bit LSB executable, x86-64, dynamically linked: Cyberlife Netmap Scanner v2.4]',
  },
  '/opt/tools/svcscan': {
    name: 'svcscan',
    path: '/opt/tools/svcscan',
    type: 'file',
    sizeBytes: 51200,
    permissions: '-rwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
    content:
      '[ELF 64-bit LSB executable, x86-64, dynamically linked: Cyberlife Service Scanner v3.1]',
  },
  '/opt/tools/logview': {
    name: 'logview',
    path: '/opt/tools/logview',
    type: 'file',
    sizeBytes: 62000,
    permissions: '-rwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
    content:
      '[ELF 64-bit LSB executable, x86-64, dynamically linked: Cyberlife Logview SIEM CLI v4.0]',
  },
  '/opt/tools/evidence': {
    name: 'evidence',
    path: '/opt/tools/evidence',
    type: 'file',
    sizeBytes: 41900,
    permissions: '-rwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
    content:
      '[ELF 64-bit LSB executable, x86-64, dynamically linked: Cyberlife Forensic Evidence Tool v1.9]',
  },
  '/opt/tools/aster-admin': {
    name: 'aster-admin',
    path: '/opt/tools/aster-admin',
    type: 'file',
    sizeBytes: 48900,
    permissions: '-rwxr-xr-x',
    owner: 'root',
    group: 'root',
    modifiedDate: '2026-10-12 06:00',
    readOnly: true,
    content:
      '[ELF 64-bit LSB executable, x86-64, dynamically linked: Aster Service Admin Console v2.0]',
  },
};

/**
 * Normalizes a virtual path string, removing trailing slashes and resolving . and ..
 */
export function normalizeVirtualPath(rawPath: string): string {
  if (!rawPath || rawPath.trim() === '') return '/';
  let cleaned = rawPath.trim().replace(/\/+/g, '/');
  if (cleaned.startsWith('~')) {
    cleaned = '/home/analyst' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }

  const parts = cleaned.split('/').filter(Boolean);
  const resolvedParts: string[] = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resolvedParts.pop();
    } else {
      resolvedParts.push(part);
    }
  }

  return '/' + resolvedParts.join('/');
}

/**
 * Resolves relative or absolute path against current working directory.
 */
export function resolveVirtualPath(currentDir: string, targetPath: string): string {
  if (!targetPath || targetPath.trim() === '') {
    return normalizeVirtualPath(currentDir);
  }
  const trimmed = targetPath.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('~')) {
    return normalizeVirtualPath(trimmed);
  }
  const base = currentDir === '/' ? '' : currentDir;
  return normalizeVirtualPath(`${base}/${trimmed}`);
}

/**
 * Singleton in-memory virtual filesystem manager.
 */
class VirtualFilesystemManager {
  private files: Map<string, VirtualFileEntry>;

  constructor() {
    this.files = new Map();
    for (const [path, entry] of Object.entries(INITIAL_VIRTUAL_FILES)) {
      this.files.set(path, { ...entry });
    }
  }

  /**
   * Resets virtual filesystem to initial factory state.
   */
  public reset(): void {
    this.files.clear();
    for (const [path, entry] of Object.entries(INITIAL_VIRTUAL_FILES)) {
      this.files.set(path, { ...entry });
    }
  }

  /**
   * Checks if an entry exists at path.
   */
  public exists(path: string): boolean {
    const norm = normalizeVirtualPath(path);
    return this.files.has(norm);
  }

  /**
   * Gets an entry at path.
   */
  public getEntry(path: string): VirtualFileEntry | null {
    const norm = normalizeVirtualPath(path);
    return this.files.get(norm) ?? null;
  }

  /**
   * Lists immediate child entries of a directory.
   */
  public listDirectory(dirPath: string): VirtualFileEntry[] {
    const norm = normalizeVirtualPath(dirPath);
    const targetDir = this.files.get(norm);
    if (!targetDir || targetDir.type !== 'directory') {
      return [];
    }

    const children: VirtualFileEntry[] = [];
    const prefix = norm === '/' ? '/' : `${norm}/`;

    for (const [entryPath, entry] of this.files.entries()) {
      if (entryPath === norm) continue;
      if (entryPath.startsWith(prefix)) {
        const sub = entryPath.slice(prefix.length);
        if (!sub.includes('/')) {
          children.push({ ...entry });
        }
      }
    }

    return children.sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Reads a text file's contents.
   */
  public readFile(
    filePath: string
  ): { content: string; readOnly: boolean; sizeBytes: number } | null {
    const norm = normalizeVirtualPath(filePath);
    const entry = this.files.get(norm);
    if (!entry || entry.type !== 'file') {
      return null;
    }
    return {
      content: entry.content ?? '',
      readOnly: entry.readOnly,
      sizeBytes: entry.sizeBytes,
    };
  }

  /**
   * Writes content to a virtual file, creating it if in a writable directory.
   */
  public writeFile(
    filePath: string,
    content: string
  ): { success: boolean; error?: string; entry?: VirtualFileEntry } {
    const norm = normalizeVirtualPath(filePath);
    const existing = this.files.get(norm);

    if (existing) {
      if (existing.readOnly) {
        return {
          success: false,
          error: `Permission denied: '${norm}' is a read-only system file.`,
        };
      }
      if (existing.type !== 'file') {
        return {
          success: false,
          error: `Cannot write to '${norm}': target is a directory.`,
        };
      }
      const updated: VirtualFileEntry = {
        ...existing,
        content,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        modifiedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      this.files.set(norm, updated);
      return { success: true, entry: updated };
    }

    // Creating new file: verify parent directory exists and is writable
    const parentDir = norm.slice(0, norm.lastIndexOf('/')) || '/';
    const parent = this.files.get(parentDir);
    if (!parent) {
      return {
        success: false,
        error: `Parent directory '${parentDir}' does not exist.`,
      };
    }
    if (parent.readOnly) {
      return {
        success: false,
        error: `Permission denied: parent directory '${parentDir}' is read-only.`,
      };
    }

    const name = norm.slice(norm.lastIndexOf('/') + 1);
    const newEntry: VirtualFileEntry = {
      name,
      path: norm,
      type: 'file',
      sizeBytes: Buffer.byteLength(content, 'utf8'),
      permissions: '-rw-r--r--',
      owner: 'analyst',
      group: 'analyst',
      modifiedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      readOnly: false,
      content,
    };

    this.files.set(norm, newEntry);
    return { success: true, entry: newEntry };
  }
}

export { VirtualFilesystemManager, VirtualFilesystemManager as VirtualFilesystem };
export const virtualFilesystem = new VirtualFilesystemManager();
