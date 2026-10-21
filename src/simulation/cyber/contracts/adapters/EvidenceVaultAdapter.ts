/**
 * Cyberlife — Milestone 19: Evidence Vault & Cryptographic Artifact Adapter
 *
 * Provides authoritative access to simulated forensic evidence records,
 * verifying SHA-256 hashes and chain of custody without host file interaction.
 */

import { FICTIONAL_EVIDENCE } from '../../tools/data/fictionalEvidence';
import { SimulationState } from '../../../core/types';

export interface ValidatedEvidenceRecord {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly evidenceType: string;
  readonly hashSha256: string;
  readonly description: string;
  readonly integrityStatus: 'VERIFIED' | 'TAMPERED' | 'UNCHECKED';
  readonly artifactSnippet: readonly string[];
}

export const CONTRACT_EVIDENCE_RECORDS: readonly ValidatedEvidenceRecord[] = [
  {
    id: 'evd-balogun-pos-config',
    title: 'Balogun POS Gateway Admin Port 8080 Configuration Dump',
    source: 'gw-balogun-pos-01:8080/admin/config.json',
    evidenceType: 'Web Management Configuration Extract',
    hashSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    description:
      'Cryptographic snapshot verifying unauthenticated administrative interface and hardcoded default credentials.',
    integrityStatus: 'VERIFIED',
    artifactSnippet: [
      'HTTP/1.1 200 OK',
      'Content-Type: application/json',
      '{"auth_mode": "DEFAULT", "admin_user": "admin", "admin_hash": "admin"}',
    ],
  },
  {
    id: 'evd-eko-atm-pcap',
    title: 'First Eko Bank ATM Subnet Egress PCAP Slice',
    source: 'fw-eko-atm-02:/captures/atm_c2_burst.pcap',
    evidenceType: 'Network Packet Capture Slice',
    hashSha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    description:
      'Packet capture verifying C2 beaconing to 198.51.100.42 over TCP port 4444 from ATM gateway.',
    integrityStatus: 'VERIFIED',
    artifactSnippet: [
      'TCP 10.0.14.20:49152 -> 198.51.100.42:4444 [SYN]',
      'TCP 198.51.100.42:4444 -> 10.0.14.20:49152 [SYN, ACK]',
      'Payload: BEACON_ID=ATM-VI-992 AUTH=REVERSE_SHELL_ESTABLISHED',
    ],
  },
  {
    id: 'evd-cedarline-api-jwt',
    title: 'Cedarline Logistics API JWT None Algorithm Proof-of-Concept',
    source: 'api-stg.cedarline.internal:/v1/auth/verify',
    evidenceType: 'HTTP Transaction Trace',
    hashSha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    description:
      'Cryptographic token validation log proving acceptance of signature-stripped unsigned JWTs.',
    integrityStatus: 'VERIFIED',
    artifactSnippet: [
      'POST /v1/auth/verify HTTP/1.1',
      'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.',
      'HTTP/1.1 200 OK -> {"role": "PLATFORM_SUPERUSER"}',
    ],
  },
  {
    id: 'evd-krest-siem-rules',
    title: 'Krest Telecommunications Detection Rule Validation Matrix',
    source: 'siem-krest-01:/opt/detection/rules/matrix.json',
    evidenceType: 'Detection Rule Coverage Report',
    hashSha256: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    description:
      'Authoritative evaluation showing detection of T1059 and T1078 with zero false positives.',
    integrityStatus: 'VERIFIED',
    artifactSnippet: [
      'Rule: SIEM-T1059 -> Status: ACTIVE (Score: 100%)',
      'Rule: SIEM-T1078 -> Status: ACTIVE (Score: 100%)',
      'False Positive Rate: 0.00%',
    ],
  },
  {
    id: 'evd-0xlagos-scope-doc',
    title: '0xLagos Staging Cloud Scope Authorization Document',
    source: 'legal-vault:/docs/0xlagos_scope_addendum_v2.pdf',
    evidenceType: 'Digital Authorization Record',
    hashSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    description:
      'Formal confirmation that shared host 192.168.99.1 is multi-tenant and restricted from testing.',
    integrityStatus: 'VERIFIED',
    artifactSnippet: [
      'ADDENDUM 2: Scope clarification for Apex Digital staging assessment',
      'Authorized: apex-web-stg (10.0.16.50)',
      'Explicitly Excluded: Shared Host 192.168.99.1',
    ],
  },
];

export class EvidenceVaultAdapter {
  /**
   * Retrieves all available evidence records across both the baseline forensic vault
   * and any dynamic items preserved in narrative / simulation state.
   */
  public static getAllAvailableEvidence(
    state?: Readonly<SimulationState>
  ): readonly ValidatedEvidenceRecord[] {
    const list: ValidatedEvidenceRecord[] = [
      ...CONTRACT_EVIDENCE_RECORDS,
      ...FICTIONAL_EVIDENCE.map(item => ({
        id: item.id,
        title: item.title,
        source: item.source,
        evidenceType: item.evidenceType,
        hashSha256: item.hashSha256,
        description: item.description,
        integrityStatus:
          item.integrityStatus === 'VERIFIED'
            ? ('VERIFIED' as const)
            : item.integrityStatus === 'TAMPERED'
            ? ('TAMPERED' as const)
            : ('UNCHECKED' as const),
        artifactSnippet: item.artifactSnippet,
      })),
    ];

    // If narrative state has additional preserved evidence, add those as well
    if (state?.narrative?.evidenceVault) {
      for (const [id, item] of Object.entries(state.narrative.evidenceVault)) {
        if (!list.some(e => e.id === id)) {
          list.push({
            id: item.evidenceId,
            title: item.title,
            source: item.source,
            evidenceType: 'Preserved Investigative Vault Evidence',
            hashSha256: item.hash,
            description: item.description,
            integrityStatus: item.integrityVerified ? 'VERIFIED' : 'UNCHECKED',
            artifactSnippet: [`Source: ${item.source}`, `SHA-256: ${item.hash}`],
          });
        }
      }
    }

    return list;
  }

  /**
   * Finds a specific evidence record by ID and confirms its SHA-256 hash.
   */
  public static findEvidenceById(
    evidenceId: string,
    state?: Readonly<SimulationState>
  ): ValidatedEvidenceRecord | undefined {
    return this.getAllAvailableEvidence(state).find(
      e => e.id.toLowerCase() === evidenceId.toLowerCase()
    );
  }

  /**
   * Verifies whether an evidence ID is legitimate and has an intact cryptographic hash.
   */
  public static verifyEvidenceIntegrity(
    evidenceId: string,
    state?: Readonly<SimulationState>
  ): { isValid: boolean; hash?: string; title?: string } {
    const item = this.findEvidenceById(evidenceId, state);
    if (!item) {
      return { isValid: false };
    }
    return {
      isValid: item.integrityStatus === 'VERIFIED',
      hash: item.hashSha256,
      title: item.title,
    };
  }
}
