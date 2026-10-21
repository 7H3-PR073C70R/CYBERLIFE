/**
 * Cyberlife — Milestone 16: Authored Investigation Scenario ("Operation Marina Nexus")
 *
 * Story continuity: Tied to the Aster Anomaly and the Eko Nexus Pipeline breach.
 *
 * SAFETY INVARIANT:
 * Zero host shell operations. All artifacts are simulated in-memory entities.
 */

import { NetworkInvestigationState, InvestigationObjective } from './types';

export const M16_OBJECTIVES: readonly InvestigationObjective[] = [
  {
    id: 'obj-m16-triage-topology',
    title: 'Inspect DMZ Application Cluster in Topology',
    description: 'Open the Network Topology tab and inspect the application host app-portal-01 (10.0.1.10) to review its role, open ports, and connection links.',
    hint: 'Click on node "app-portal-01" in the Network Map to review its running services and connections.',
    isCompleted: false,
    requiredAction: 'INSPECT_SUSPICIOUS_NODE',
  },
  {
    id: 'obj-m16-filter-tls',
    title: 'Filter Synthetic Traffic by TLS Protocol',
    description: 'Use the Traffic Explorer protocol filter to isolate encrypted TLS sessions on non-standard ports.',
    hint: 'In the Traffic tab, select "TLS" from the Protocol filter dropdown to view encrypted streams.',
    isCompleted: false,
    requiredAction: 'FILTER_TRAFFIC_BY_PROTOCOL',
  },
  {
    id: 'obj-m16-dissect-beacon',
    title: 'Dissect Outbound C2 Beacon Frame',
    description: 'Select packet pkt-031 in the traffic table and inspect its TLS Client Hello metadata to identify the destination SNI and JA3 fingerprint.',
    hint: 'Click on packet pkt-031 in the traffic stream and examine the TLS metadata tab in the bottom dissection panel.',
    isCompleted: false,
    requiredAction: 'DISSECT_SUSPICIOUS_PACKET',
  },
  {
    id: 'obj-m16-correlate-intel',
    title: 'Correlate Suspect IP 198.51.100.45 in Threat Intel',
    description: 'Navigate to the Threat Intelligence tab and search for IP 198.51.100.45 to identify the adversary group and campaign context.',
    hint: 'Search for "198.51.100.45" in the Threat Intel search bar and inspect NDSRC Advisory #2026-8841.',
    isCompleted: false,
    requiredAction: 'CORRELATE_THREAT_INDICATOR',
  },
  {
    id: 'obj-m16-distinguish-false-positive',
    title: 'Verify Authorized SIEM Port Scan as Benign Allowlist',
    description: 'Inspect packet pkt-007 from mon-siem-01 (10.0.99.5) and verify against the threat intel database to distinguish routine internal scanner noise from real adversary activity.',
    hint: 'Review packet pkt-007 from 10.0.99.5. Search threat intel for 10.0.99.5 to see that it is an authorized internal scanner, and mark its review status as Benign/False Positive.',
    isCompleted: false,
    requiredAction: 'IDENTIFY_FALSE_POSITIVE',
  },
  {
    id: 'obj-m16-preserve-evidence',
    title: 'Preserve Forensic Evidence in the Vault',
    description: 'Collect at least two pieces of forensic evidence from the traffic inspector (SMB credential access or C2 beacon) to preserve cryptographic chain-of-custody.',
    hint: 'Click the "Save Evidence" button on packet pkt-012 (SMB credential theft) or pkt-031 (TLS C2 beacon).',
    isCompleted: false,
    requiredAction: 'PRESERVE_NETWORK_EVIDENCE',
  },
  {
    id: 'obj-m16-submit-assessment',
    title: 'Submit Incident Finding & Technical Assessment',
    description: 'Formulate your investigation conclusions in the Investigation tab by identifying the compromised host, threat actor, and C2 exfiltration vector.',
    hint: 'Fill in the assessment form with app-portal-01 as the compromised asset, Phantom Weaver APT as the actor, and port 8443 TLS / DNS tunneling as the exfiltration channel.',
    isCompleted: false,
    requiredAction: 'SUBMIT_INVESTIGATION_ASSESSMENT',
  },
];

export const M16_INVESTIGATION_SCENARIO = {
  id: 'scen_m16_marina_nexus',
  title: 'Operation Marina Nexus: The Aster Exfiltration & Eko Nexus Beacon Anomaly',
  briefingSummary:
    'Michael reported anomalous outbound packets on gateway interface eth0. DMZ host app-portal-01 appears to have initiated outbound connections to an unapproved external IP over TCP 8443, as well as bursty DNS TXT requests. Verify if this is tied to the Aster Assistant daemon or an external campaign.',
  objectives: M16_OBJECTIVES,
};

export function createInitialNetworkInvestigationState(): NetworkInvestigationState {
  return {
    scenarioId: 'scen_m16_marina_nexus',
    title: 'Operation Marina Nexus: The Aster Exfiltration & Eko Nexus Beacon Anomaly',
    activePhase: 'BRIEFING',
    objectives: M16_OBJECTIVES,
    inspectedHostIds: [],
    inspectedEventIds: [],
    correlatedIndicatorIds: [],
    collectedEvidenceIds: [],
    indicatorReviews: {
      'ioc-benign-siem-scanner': 'FALSE_POSITIVE_BENIGN',
    },
    analystNotes: [
      {
        id: 'note-01-briefing',
        createdAtSimTime: 28800,
        title: 'SecOps Dispatch Triage Note',
        content:
          'Michael reported anomalous outbound packets on gateway interface eth0. DMZ host app-portal-01 appears to have initiated outbound connections to an unapproved external IP over TCP 8443, as well as bursty DNS TXT requests. Verify if this is tied to the Aster Assistant daemon or an external campaign.',
        category: 'HYPOTHESIS',
        linkedHostIds: ['app-portal-01', 'gw-core-01'],
        linkedEventIds: [],
        linkedIndicatorIds: [],
      },
    ],
    selectedHostId: 'app-portal-01',
    selectedEventId: 'pkt-031',
    selectedIndicatorId: 'ioc-ip-c2-phantom',
  };
}
