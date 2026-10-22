/**
 * Cyberlife — Milestone 23: Digital Forensics Analyst CLI
 *
 * Implements the simulated forensic investigation toolchain:
 * - Evidence disk/USB image integrity verification (SHA-256 / MD5 hash auditing)
 * - Filesystem timeline reconstruction & Master File Table ($MFT) analysis
 * - Anti-forensic timestomping anomaly detection ($STANDARD_INFORMATION vs $FILE_NAME discrepancy)
 * - File carving / extraction of exfiltrated data artifacts
 * - Formal certified forensic reporting with chain-of-custody verification
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory forensic artifacts. Zero real disk access or external execution.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';

export interface ForensicArtifact {
  readonly path: string;
  readonly description: string;
  readonly sizeBytes: number;
  readonly expectedSha256: string;
  readonly verified: boolean;
}

export interface MftRecord {
  readonly fileName: string;
  readonly standardInfoModified: string;
  readonly fileNameCreated: string;
  readonly sizeBytes: number;
  readonly isTimestomped: boolean;
  readonly notes: string;
}

export interface ForensicsSessionState {
  currentEvidenceImage: string;
  hashVerified: boolean;
  mftAnalyzed: boolean;
  extractedFiles: string[];
  reportSubmitted: boolean;
}

let activeForensicsState: ForensicsSessionState = {
  currentEvidenceImage: '/evidence/marina_exfil_usb.dd',
  hashVerified: false,
  mftAnalyzed: false,
  extractedFiles: [],
  reportSubmitted: false,
};

export function resetForensicsSessionState(): void {
  activeForensicsState = {
    currentEvidenceImage: '/evidence/marina_exfil_usb.dd',
    hashVerified: false,
    mftAnalyzed: false,
    extractedFiles: [],
    reportSubmitted: false,
  };
}

export function getForensicsSessionState(): Readonly<ForensicsSessionState> {
  return activeForensicsState;
}

const EVIDENCE_ARTIFACTS: readonly ForensicArtifact[] = [
  {
    path: '/evidence/marina_exfil_usb.dd',
    description: 'Bitstream raw disk dump of seized Kingston DataTraveler 32GB flash drive',
    sizeBytes: 32_212_254_720,
    expectedSha256: '9f8339c4a8874992a2b9f3032d847a988d876402371900d869a0a0349258dc76',
    verified: false,
  },
  {
    path: '/evidence/port_auth_gateway.pcap',
    description: 'Ethernet packet capture of terminal operator workstation egress switchport',
    sizeBytes: 148_291_042,
    expectedSha256: 'a140f28dc0182479e491823901bcf40918230491823091823094812093840192',
    verified: false,
  },
];

const MFT_TIMELINE_RECORDS: readonly MftRecord[] = [
  {
    fileName: 'System Volume Information/IndexerVolumeGuid',
    standardInfoModified: '2025-11-04 14:12:00 UTC',
    fileNameCreated: '2025-11-04 14:12:00 UTC',
    sizeBytes: 76,
    isTimestomped: false,
    notes: 'Legitimate OS metadata container.',
  },
  {
    fileName: 'marina_q3_manifest_exports.xlsx',
    standardInfoModified: '2024-01-15 08:30:00 UTC',
    fileNameCreated: '2026-10-21 07:14:22 UTC',
    sizeBytes: 4_891_200,
    isTimestomped: true,
    notes: 'CRITICAL ANOMALY: $STANDARD_INFO timestamp forged 2+ years into past. $FILE_NAME proves creation during breach window.',
  },
  {
    fileName: 'transport_auth_tokens.kdbx',
    standardInfoModified: '2026-10-21 07:16:45 UTC',
    fileNameCreated: '2026-10-21 07:16:45 UTC',
    sizeBytes: 184_320,
    isTimestomped: false,
    notes: 'Encrypted KeePass database archive copied 2 minutes after manifest exfiltration.',
  },
  {
    fileName: '.trashes/payload_transport_enc.zip',
    standardInfoModified: '2026-10-21 07:18:10 UTC',
    fileNameCreated: '2026-10-21 07:18:10 UTC',
    sizeBytes: 12_490_880,
    isTimestomped: false,
    notes: 'Deleted zip container in recycle bin folder with valid PK\\x03\\x04 magic bytes.',
  },
];

export const forensicsCommand: TerminalCommandHandler = {
  name: 'forensics',
  description: 'Digital Forensics Analyst CLI — Evidence integrity verification, MFT timeline analysis, and artifact carving',
  usage: 'forensics [list | hash <image> | mft | extract <file> | report | status | reset]',
  execute: (args: string[], context: TerminalExecutionContext): TerminalCommandResult => {
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'help') {
      return {
        stdout: [
          '=== Cyberlife Digital Forensics CLI (v2.3-lagos) ===',
          'Usage: forensics <command> [options]',
          '',
          'Commands:',
          '  list                  Catalog mounted evidence drives and physical bitstream dumps',
          '  hash [imagePath]      Compute and verify SHA-256 cryptographic evidence integrity hash',
          '  mft                   Analyze Master File Table records & detect anti-forensic timestomping',
          '  extract <filename>    Carve and extract identified exfiltration payload from raw evidence',
          '  report                Compile and sign certified digital forensics disclosure report',
          '  status                View current case status, verified findings, and chain-of-custody log',
          '  reset                 Reset active forensics session state',
          '',
          'Active Case: CAS-2026-MARINA-092 (Marina Logistics Port Authority USB Incident)',
        ],
      };
    }

    if (sub === 'list') {
      return {
        stdout: [
          '=== Evidence Storage Registry — /evidence ===',
          'PATH                             SIZE           DESCRIPTION',
          '--------------------------------------------------------------------------------------------------',
          ...EVIDENCE_ARTIFACTS.map(
            a => `${a.path.padEnd(32)} ${(a.sizeBytes / 1_000_000).toFixed(1).padStart(7)} MB    ${a.description}`
          ),
          '',
          'Current target: /evidence/marina_exfil_usb.dd',
          'Run "forensics hash /evidence/marina_exfil_usb.dd" to establish chain of custody.',
        ],
      };
    }

    if (sub === 'hash') {
      const target = args[1] ?? activeForensicsState.currentEvidenceImage;
      const artifact = EVIDENCE_ARTIFACTS.find(a => a.path === target) ?? EVIDENCE_ARTIFACTS[0]!;

      activeForensicsState.hashVerified = true;
      activeForensicsState.currentEvidenceImage = artifact.path;

      return {
        stdout: [
          `[*] Initiating cryptographic verification for: ${artifact.path}`,
          `[*] Reading bitstream blocks (${(artifact.sizeBytes / 1_000_000_000).toFixed(2)} GB)...`,
          `[*] Algorithm: SHA-256 (FIPS 180-4 compliant)`,
          `[+] Computed Hash:  ${artifact.expectedSha256}`,
          `[+] Reference Hash: ${artifact.expectedSha256}`,
          `[+] INTEGRITY VERIFICATION: PASSED [MATCH 100%]`,
          `[+] Chain of Custody record #COC-7741 updated by ${context.currentUser.displayName} (${context.currentUser.organization}).`,
          '',
          'Next Step: Run "forensics mft" to reconstruct the filesystem timeline and inspect metadata.',
        ],
      };
    }

    if (sub === 'mft' || sub === 'timeline') {
      if (!activeForensicsState.hashVerified) {
        return {
          isError: true,
          stdout: [
            '[!] WARNING: Evidence hash has not been verified.',
            'Best practice mandates cryptographic integrity verification before analysis.',
            'Run "forensics hash" first, or re-run with explicit authorization.',
          ],
        };
      }

      activeForensicsState.mftAnalyzed = true;

      const output = [
        '=== Master File Table ($MFT) Timeline Reconstruction ===',
        'Image: /evidence/marina_exfil_usb.dd [FAT32 / NTFS Shadow Volume]',
        'Total Records: 4,192 | Filtered Breached Window: 2026-10-21 07:00:00 - 07:30:00 UTC',
        '',
        'FILE PATH                                  $STANDARD_INFO MODIFIED     $FILE_NAME CREATED          SIZE       STATUS',
        '--------------------------------------------------------------------------------------------------------------------------------',
      ];

      for (const rec of MFT_TIMELINE_RECORDS) {
        const flag = rec.isTimestomped ? '[!] TIMESTOMPED' : '[+] NOMINAL';
        output.push(
          `${rec.fileName.padEnd(42)} ${rec.standardInfoModified.padEnd(27)} ${rec.fileNameCreated.padEnd(27)} ${(rec.sizeBytes / 1024).toFixed(1).padStart(7)} KB  ${flag}`
        );
      }

      output.push('');
      output.push('[!] CRITICAL FORENSIC FINDING DETECTED:');
      output.push('    marina_q3_manifest_exports.xlsx exhibits clear anti-forensic timestamp forging.');
      output.push('    The operator forged $STANDARD_INFORMATION to 2024-01-15, but $FILE_NAME retains');
      output.push('    the true creation timestamp: 2026-10-21 07:14:22 UTC (matching security camera logs).');
      output.push('');
      output.push('Next Step: Run "forensics extract transport_auth_tokens.kdbx" or "forensics report" to compile findings.');

      return { stdout: output };
    }

    if (sub === 'extract') {
      const fileName = args[1] ?? 'payload_transport_enc.zip';
      const record = MFT_TIMELINE_RECORDS.find(r => r.fileName.includes(fileName));

      if (!record) {
        return {
          isError: true,
          stdout: [
            `[!] Artifact "${fileName}" not located in Master File Table.`,
            'Available artifacts: marina_q3_manifest_exports.xlsx, transport_auth_tokens.kdbx, payload_transport_enc.zip',
          ],
        };
      }

      if (!activeForensicsState.extractedFiles.includes(record.fileName)) {
        activeForensicsState.extractedFiles.push(record.fileName);
      }

      return {
        stdout: [
          `[*] Carving file from raw bitstream offset...`,
          `[*] Target: ${record.fileName} (${(record.sizeBytes / 1024).toFixed(1)} KB)`,
          `[+] Header signature validated (PK Zip / KeePass 2.x Database).`,
          `[+] Carved to sandbox: /cases/CAS-MARINA-092/extracted/${fileName}`,
          `[+] File recovery status: 100% UNFRAGMENTED`,
          '',
          `Artifact saved for cryptographic disclosure. Run "forensics report" to finalize investigation.`,
        ],
      };
    }

    if (sub === 'report') {
      if (!activeForensicsState.hashVerified || !activeForensicsState.mftAnalyzed) {
        return {
          isError: true,
          stdout: [
            '[!] INCOMPLETE INVESTIGATION: Unable to generate certified report.',
            `    - Cryptographic Hash Verified: ${activeForensicsState.hashVerified ? 'YES' : 'NO (Run forensics hash)'}`,
            `    - MFT Timeline Analyzed:       ${activeForensicsState.mftAnalyzed ? 'YES' : 'NO (Run forensics mft)'}`,
          ],
        };
      }

      activeForensicsState.reportSubmitted = true;

      return {
        stdout: [
          '========================================================================================',
          '                 LAGOS ISLAND DIGITAL FORENSICS & INTEGRITY CHAMBERS',
          '                         CERTIFIED FORENSIC DISCLOSURE REPORT',
          '========================================================================================',
          'CASE FILE:        CAS-2026-MARINA-092',
          `EXAMINER:         ${context.currentUser.displayName} // ${context.currentUser.role}`,
          `ORGANIZATION:     ${context.currentUser.organization}`,
          `EVIDENCE TARGET:  ${activeForensicsState.currentEvidenceImage}`,
          `HASH (SHA-256):   9f8339c4a8874992a2b9f3032d847a988d876402371900d869a0a0349258dc76`,
          'INTEGRITY STATUS: VERIFIED & TAMPER-FREE (CHAIN-OF-CUSTODY COMPLIANT)',
          '----------------------------------------------------------------------------------------',
          'EXECUTIVE FINDINGS:',
          '1. ANTI-FORENSIC TAMPERING CONFIRMED:',
          '   - Artifact "marina_q3_manifest_exports.xlsx" underwent active timestomping.',
          '   - $STANDARD_INFORMATION attribute was deliberately altered to 2024-01-15.',
          '   - Internal $FILE_NAME metadata confirms file was written on 2026-10-21 at 07:14:22 UTC.',
          '',
          '2. EXFILTRATED CREDENTIAL ARTIFACTS:',
          '   - Discovered unencrypted transport container: transport_auth_tokens.kdbx.',
          '   - Contains API authentication tokens for Marina Port Terminal Container Gate 04.',
          '',
          '3. DEFENSIBLE CONCLUSION:',
          '   - Unauthorized bulk data transfer occurred within the 07:14 - 07:18 UTC window.',
          '   - Tampering indicates intentional evasion rather than accidental operator usage.',
          '----------------------------------------------------------------------------------------',
          '[+] REPORT DIGITALLY SIGNED & FILED WITH LEGAL CHAMBERS.',
          '[+] Objective Completed: Certified Forensic Investigation Complete.',
          '========================================================================================',
        ],
      };
    }

    if (sub === 'status') {
      return {
        stdout: [
          '=== Digital Forensics Case Status ===',
          `Target Image:      ${activeForensicsState.currentEvidenceImage}`,
          `Hash Verified:     ${activeForensicsState.hashVerified ? 'YES [SHA-256 MATCH]' : 'NO'}`,
          `MFT Analyzed:      ${activeForensicsState.mftAnalyzed ? 'YES [TIMESTOMP DETECTED]' : 'NO'}`,
          `Extracted Files:   ${activeForensicsState.extractedFiles.length > 0 ? activeForensicsState.extractedFiles.join(', ') : 'None'}`,
          `Report Submitted:  ${activeForensicsState.reportSubmitted ? 'YES [CERTIFIED]' : 'NO'}`,
        ],
      };
    }

    if (sub === 'reset') {
      resetForensicsSessionState();
      return { stdout: ['[+] Forensics session state reset to default.'] };
    }

    return {
      isError: true,
      stdout: [`Unknown forensics command "${sub}". Run "forensics help" for usage.`],
    };
  },
};
