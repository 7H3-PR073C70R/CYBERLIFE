/**
 * Cyberlife — Human & Physical Security Fixtures and Realistic Scenarios
 *
 * Ground-truth deterministic data structures representing Marina Tower physical security,
 * visitor controls, badges, synthetic removable media, and multi-role investigation incidents.
 *
 * All datasets are purely synthetic and execute in-memory with zero host/network side-effects.
 */

import {
  PhysicalFacility,
  PhysicalBadge,
  PhysicalAccessLogEntry,
  FictionalRemovableDevice,
  RemovableMediaTelemetryEvent,
  PretextPersona,
  SimulatedEmailLure,
  EmployeeSecurityReportEvent,
  RulesOfEngagement,
  CorrelatedInvestigationIncident,
} from './types';

// ============================================================================
// 1. Physical Facilities & Rooms (Marina Tower & Broad Street)
// ============================================================================

export const MARINA_TOWER_FACILITY: PhysicalFacility = {
  id: 'fac-marina-tower',
  name: 'Marina Tower Corporate Center',
  address: '14–18 Marina Boulevard, Lagos Island, Nigeria',
  organizationId: 'org-cedarline',
  operatingHours: {
    openHour: 7,
    closeHour: 20,
    is24Hours: false,
  },
  securityStaffed: true,
  cctvCoverage: 'FULL_INTERNAL',
  rooms: [
    {
      id: 'room-ground-lobby',
      facilityId: 'fac-marina-tower',
      name: 'Ground Floor Reception & Turnstiles',
      floor: 0,
      requiredClearance: 'PUBLIC',
      requiresEscortForGuests: false,
      badgeReaderId: 'reader-turnstile-main',
      containsEndpoints: ['kiosk-visitor-01'],
      containsPhysicalEvidence: ['evd-visitor-register-paper'],
      description: 'Public turnstiles, manned security desk, and visitor registration kiosks.',
    },
    {
      id: 'room-floor3-finance',
      facilityId: 'fac-marina-tower',
      name: '3rd Floor Finance & Accounts Suite',
      floor: 3,
      requiredClearance: 'STANDARD',
      requiresEscortForGuests: true,
      badgeReaderId: 'reader-fl3-suite',
      containsEndpoints: ['ws-fin-01', 'ws-fin-04', 'ws-fin-07'],
      containsPhysicalEvidence: ['evd-discarded-usb-desk'],
      description: 'Open-plan accounting workstations, payroll filing cabinets, and departmental printers.',
    },
    {
      id: 'room-floor4-soc',
      facilityId: 'fac-marina-tower',
      name: '4th Floor Security Operations Center (SOC)',
      floor: 4,
      requiredClearance: 'RESTRICTED',
      requiresEscortForGuests: true,
      badgeReaderId: 'reader-fl4-soc-entry',
      containsEndpoints: ['soc-analyst-ws01', 'soc-analyst-ws02', 'soc-display-wall'],
      containsPhysicalEvidence: ['evd-soc-shift-handover'],
      description: 'Manned 24/7 security monitoring center with restricted dual-badge entry.',
    },
    {
      id: 'room-floor5-server',
      facilityId: 'fac-marina-tower',
      name: '5th Floor Core Datacenter — Server Room 2B',
      floor: 5,
      requiredClearance: 'SECURE_VAULT',
      requiresEscortForGuests: true,
      badgeReaderId: 'reader-fl5-server2b',
      containsEndpoints: ['filesrv-01', 'app-portal-01', 'dc-01', 'fw-gateway-01'],
      containsPhysicalEvidence: ['evd-server-rack-tamper-seal'],
      description: 'Climate-controlled server racks housing Cedarline core infrastructure and Aster host.',
    },
    {
      id: 'room-floor6-executive',
      facilityId: 'fac-marina-tower',
      name: '6th Floor Executive Boardroom & VP Offices',
      floor: 6,
      requiredClearance: 'SECURE_VAULT',
      requiresEscortForGuests: true,
      badgeReaderId: 'reader-fl6-exec-suite',
      containsEndpoints: ['ws-exec-femi', 'ws-boardroom-conf'],
      containsPhysicalEvidence: ['evd-board-minutes-confidential'],
      description: 'Executive offices of Femi Martins, corporate legal counsel, and confidential records.',
    },
  ],
};

export const AIRGAPPED_LAB_FACILITY: PhysicalFacility = {
  id: 'fac-airgap-research',
  name: 'Lagos Island Cyber Defense Research Lab',
  address: 'Broad Street 14, 2nd Floor, Lagos Island',
  organizationId: 'org-independent-research',
  operatingHours: {
    openHour: 0,
    closeHour: 23,
    is24Hours: true,
  },
  securityStaffed: false,
  cctvCoverage: 'PERIMETER',
  rooms: [
    {
      id: 'room-airgap-workbench',
      facilityId: 'fac-airgap-research',
      name: 'Isolated Hardware & Malware Analysis Workbench',
      floor: 2,
      requiredClearance: 'AIRGAPPED_LAB',
      requiresEscortForGuests: false,
      containsEndpoints: ['ws-isolated-forensic-01', 'hardware-write-blocker-01'],
      containsPhysicalEvidence: ['evd-usb-parking-drop-01'],
      description: 'Zero network connectivity, dedicated hardware write-blocker, and digital oscilloscope.',
    },
  ],
};

// ============================================================================
// 2. Physical Badges & Credentials
// ============================================================================

export const PHYSICAL_BADGES: readonly PhysicalBadge[] = [
  {
    badgeId: 'badge-amina-01',
    badgeNumber: 'CED-2026-B-0101',
    assignedUserId: 'ident-amina',
    holderName: 'Temitope Blessing',
    holderOrganization: 'Cedarline Services Ltd',
    badgeType: 'SECURITY_SECOPS',
    clearanceLevel: 'SECURE_VAULT',
    issuedAt: '2026-01-15T08:00:00Z',
    expiresAt: '2027-01-15T08:00:00Z',
    isActive: true,
  },
  {
    badgeId: 'badge-marcus-02',
    badgeNumber: 'CED-2026-B-0244',
    assignedUserId: 'ident-marcus',
    holderName: 'Marcus Adebayo',
    holderOrganization: 'Cedarline Services Ltd',
    badgeType: 'IT_INFRASTRUCTURE',
    clearanceLevel: 'RESTRICTED',
    issuedAt: '2026-03-01T08:00:00Z',
    expiresAt: '2027-03-01T08:00:00Z',
    isActive: true,
  },
  {
    badgeId: 'badge-femi-03',
    badgeNumber: 'CED-2026-B-0004',
    assignedUserId: 'ident-femi',
    holderName: 'Femi Martins',
    holderOrganization: 'Cedarline Services Ltd',
    badgeType: 'EXECUTIVE_LEADERSHIP',
    clearanceLevel: 'SECURE_VAULT',
    issuedAt: '2025-11-01T08:00:00Z',
    expiresAt: '2027-11-01T08:00:00Z',
    isActive: true,
  },
  {
    badgeId: 'badge-contractor-chidi',
    badgeNumber: 'CED-2026-V-8821',
    assignedUserId: 'ident-ext-chidi',
    holderName: 'Chidi Nwosu (Eko Fiber Tech)',
    holderOrganization: 'Eko Telecom Infrastructure Ltd',
    badgeType: 'CONTRACTOR_TEMPORARY',
    clearanceLevel: 'GUEST',
    issuedAt: '2026-10-20T08:30:00Z',
    expiresAt: '2026-10-20T17:00:00Z',
    isActive: true,
  },
  {
    badgeId: 'badge-forged-audit',
    badgeNumber: 'CED-2026-B-0999',
    holderName: 'Kelechi Adams (Simulated External Auditor)',
    holderOrganization: 'Apex Assurance Partners',
    badgeType: 'CONTRACTOR_TEMPORARY',
    clearanceLevel: 'STANDARD',
    issuedAt: '2026-10-18T09:00:00Z',
    expiresAt: '2026-10-25T18:00:00Z',
    isActive: false, // Revoked in system
    isClonedOrTampered: true,
  },
];

// ============================================================================
// 3. Physical Access Event Logs
// ============================================================================

export const PHYSICAL_ACCESS_LOGS: readonly PhysicalAccessLogEntry[] = [
  {
    id: 'phys-log-001',
    timestamp: '2026-10-20T07:15:22Z',
    facilityId: 'fac-marina-tower',
    roomId: 'room-ground-lobby',
    badgeId: 'badge-amina-01',
    holderName: 'Temitope Blessing',
    accessGranted: true,
    tailgatingAlert: false,
    doorHeldOpenSeconds: 3,
  },
  {
    id: 'phys-log-002',
    timestamp: '2026-10-20T07:22:45Z',
    facilityId: 'fac-marina-tower',
    roomId: 'room-floor4-soc',
    badgeId: 'badge-amina-01',
    holderName: 'Temitope Blessing',
    accessGranted: true,
    tailgatingAlert: false,
    doorHeldOpenSeconds: 4,
  },
  {
    id: 'phys-log-003',
    timestamp: '2026-10-20T08:05:10Z',
    facilityId: 'fac-marina-tower',
    roomId: 'room-floor3-finance',
    badgeId: 'badge-marcus-02',
    holderName: 'Marcus Adebayo',
    accessGranted: true,
    tailgatingAlert: false,
    doorHeldOpenSeconds: 5,
  },
  {
    id: 'phys-log-004',
    timestamp: '2026-10-20T09:14:38Z',
    facilityId: 'fac-marina-tower',
    roomId: 'room-floor5-server',
    badgeId: 'badge-marcus-02',
    holderName: 'Marcus Adebayo',
    accessGranted: false,
    denialReason: 'INSUFFICIENT_CLEARANCE',
    tailgatingAlert: false,
  },
  {
    id: 'phys-log-005',
    timestamp: '2026-10-20T11:42:19Z',
    facilityId: 'fac-marina-tower',
    roomId: 'room-floor5-server',
    badgeId: 'badge-forged-audit',
    holderName: 'Kelechi Adams (Simulated External Auditor)',
    accessGranted: false,
    denialReason: 'REVOKED',
    tailgatingAlert: true,
    doorHeldOpenSeconds: 28, // Door held open by unescorted visitor
    cctvSnapshotId: 'cctv-fl5-corridor-1142.png',
  },
];

// ============================================================================
// 4. Fictional Removable Media & Synthetic Artifacts
// ============================================================================

export const FICTIONAL_REMOVABLE_DEVICES: readonly FictionalRemovableDevice[] = [
  {
    deviceId: 'usb-parking-drop-01',
    serialNumber: 'SN-KINGSTON-DT50-9941A',
    vendorName: 'Kingston Technology',
    productName: 'DataTraveler 50 (16GB)',
    mediaType: 'USB_MASS_STORAGE',
    capacityBytes: 16 * 1024 * 1024 * 1024,
    physicalCondition: 'WEATHERED',
    foundLocationId: 'broad_street_curbside_danfo_stop',
    labelText: 'Q4_Executive_Payroll_Audit_Review_CONFIDENTIAL',
    isHardwareWriteProtected: false,
    fileManifest: [
      {
        path: 'D:\\Executive_Salaries_2026.xlsx.lnk',
        fileName: 'Executive_Salaries_2026.xlsx.lnk',
        sizeBytes: 4096,
        sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        isExecutable: true,
        isHidden: false,
        syntheticClassification: 'MALICIOUS_SIMULATION',
        simulatedBehaviorSummary:
          'Windows shortcut masquerading as Excel workbook that executes cscript.exe with hidden script argument.',
      },
      {
        path: 'D:\\.system\\beacon_agent.vbs',
        fileName: 'beacon_agent.vbs',
        sizeBytes: 12288,
        sha256Hash: 'f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100',
        isExecutable: true,
        isHidden: true,
        syntheticClassification: 'MALICIOUS_SIMULATION',
        simulatedBehaviorSummary:
          'Simulated staged beacon script configured to send synthetic ICMP echo payloads to 10.0.4.1.',
      },
      {
        path: 'D:\\Cedarline_Employee_Handbook.pdf',
        fileName: 'Cedarline_Employee_Handbook.pdf',
        sizeBytes: 1048576,
        sha256Hash: '445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
        isExecutable: false,
        isHidden: false,
        syntheticClassification: 'BENIGN',
        simulatedBehaviorSummary: 'Legitimate public PDF document used as decoy content.',
      },
    ],
  },
  {
    deviceId: 'usb-sec-backup-02',
    serialNumber: 'SN-SANDISK-ULTRA-2026B',
    vendorName: 'SanDisk Corp.',
    productName: 'Ultra Flair USB 3.0 (64GB)',
    mediaType: 'USB_MASS_STORAGE',
    capacityBytes: 64 * 1024 * 1024 * 1024,
    physicalCondition: 'PRISTINE',
    foundLocationId: 'room-floor4-soc',
    labelText: 'SOC_OFFLINE_GPG_BACKUP_VAULT',
    isHardwareWriteProtected: true,
    fileManifest: [
      {
        path: 'E:\\gpg_public_keys.asc',
        fileName: 'gpg_public_keys.asc',
        sizeBytes: 8192,
        sha256Hash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        isExecutable: false,
        isHidden: false,
        syntheticClassification: 'CONFIDENTIAL',
        simulatedBehaviorSummary: 'Cedarline SOC GPG public key ring for evidence signing.',
      },
    ],
  },
];

// ============================================================================
// 5. Removable Media Telemetry Events (Correlated Endpoint Data)
// ============================================================================

export const REMOVABLE_MEDIA_TELEMETRY: readonly RemovableMediaTelemetryEvent[] = [
  {
    eventId: 'telem-usb-001',
    timestamp: '2026-10-20T10:14:02Z',
    hostId: 'ws-fin-04',
    hostName: 'WS-FIN-04.cedarline.corp.local',
    loggedInUser: 'biodun.ade (Junior Accountant)',
    deviceSerial: 'SN-KINGSTON-DT50-9941A',
    vendorProduct: 'Kingston Technology DataTraveler 50',
    action: 'DEVICE_CONNECTED',
    mountPoint: 'D:\\',
  },
  {
    eventId: 'telem-usb-002',
    timestamp: '2026-10-20T10:14:48Z',
    hostId: 'ws-fin-04',
    hostName: 'WS-FIN-04.cedarline.corp.local',
    loggedInUser: 'biodun.ade (Junior Accountant)',
    deviceSerial: 'SN-KINGSTON-DT50-9941A',
    vendorProduct: 'Kingston Technology DataTraveler 50',
    action: 'FILE_ACCESSED',
    mountPoint: 'D:\\',
    processGenerated: {
      processId: 4412,
      processName: 'cscript.exe',
      commandLine: 'cscript.exe //nologo D:\\.system\\beacon_agent.vbs',
      parentProcessName: 'explorer.exe',
      sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    },
    networkActivityDetected: {
      destIp: '10.0.4.1',
      destPort: 445,
      protocol: 'SMB2',
      bytesTransferred: 512,
    },
  },
];

// ============================================================================
// 6. Pretext Personas & Social Scenarios
// ============================================================================

export const PRETEXT_PERSONAS: readonly PretextPersona[] = [
  {
    personaId: 'pretext-telecom-tech',
    claimedName: 'Chidi Nwosu',
    claimedTitle: 'Senior Field Transmission Engineer',
    claimedOrganization: 'Eko Telecom Infrastructure Ltd',
    targetNpcId: 'npc_marcus',
    vector: 'HELP_DESK_WALKUP',
    objective: 'Gain physical unescorted access to Floor 5 Server Room 2B to install network tap.',
    pretextStory:
      'Reports that Marina Boulevard fiber trunk experienced high jitter during rain and needs to test continuity from Server Room patch panel 3.',
    supportingArtifacts: [
      'Forged Work Order #WO-8819 on laminated clipboard',
      'High-visibility orange vest with Eko Telecom logo',
    ],
    flawOrTell:
      'Work order references obsolete fiber ring topology decommissioned two months ago by Amina.',
  },
  {
    personaId: 'pretext-vp-password-reset',
    claimedName: 'Femi Martins',
    claimedTitle: 'VP of Technology & Operations',
    claimedOrganization: 'Cedarline Services Ltd',
    targetNpcId: 'npc_marcus',
    vector: 'PHONE_CALL',
    objective: 'Bypass MFA and force password reset on corporate administrator account.',
    pretextStory:
      'Claims he is boarding an international flight to London for emergency board meeting and cannot receive SMS token due to airport roaming blackout.',
    supportingArtifacts: ['Spoofed caller ID displaying Cedarline Executive Extension (x4001)'],
    flawOrTell:
      'Speaks with heightened anger demanding immediate compliance contrary to Cedarline out-of-band callback policy.',
  },
];

// ============================================================================
// 7. Simulated Phishing Lures & Employee Security Reports
// ============================================================================

export const SIMULATED_EMAIL_LURES: readonly SimulatedEmailLure[] = [
  {
    emailId: 'lure-q4-payroll-audit',
    timestamp: '2026-10-20T08:12:00Z',
    envelopeSender: 'payroll-verification@cedarline-portal.online',
    displayName: 'Cedarline HR & Treasury Division',
    replyToAddress: 'admin@cloud-hr-notification.net',
    recipientEmail: 'biodun.ade@cedarline.corp.local',
    subject: 'URGENT: Verify Your Q4 Pension & Tax Adjustment Slip',
    bodyText:
      'Dear Employee,\n\nAll Cedarline staff are required to review the attached 2026 Tax Reconciliation worksheet before close of business today to prevent salary disbursement holds.\n\nPlease open the secure attachment below and verify your banking BVN.\n\nHR Department, Marina Tower.',
    syntheticAttachment: {
      fileName: 'Tax_Adjustment_Slip_2026.xlsx.vbs',
      sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      fileSizeBytes: 14336,
    },
    spoofIndicators: [
      {
        headerField: 'From',
        indicator: 'cedarline-portal.online is a typosquatted lookalike domain',
        explanation: 'Official Cedarline domain is cedarline.corp.local / cedarline.ng',
      },
      {
        headerField: 'Authentication-Results',
        indicator: 'SPF SoftFail, DKIM None',
        explanation: 'Sending IP 198.51.100.44 is not authorized in Cedarline SPF record',
      },
    ],
    targetedDepartment: 'Finance & Treasury',
  },
];

export const EMPLOYEE_SECURITY_REPORTS: readonly EmployeeSecurityReportEvent[] = [
  {
    reportId: 'sec-report-001',
    reporterNpcId: 'npc_marcus',
    reporterName: 'Marcus Adebayo',
    timestamp: '2026-10-20T10:35:00Z',
    incidentCategory: 'UNATTENDED_USB',
    subjectSummary: 'Unattended USB drive found in 3rd floor kitchenette',
    detailedNotes:
      'Accountant Biodun Ade reported plugging a USB drive found curbside to see who owned it, then noticed a command prompt flash on screen. Machine ws-fin-04 disconnected from network as precaution.',
    reportedArtifactId: 'usb-parking-drop-01',
    socTriageStatus: 'VALIDATED_THREAT',
  },
];

// ============================================================================
// 8. Rules of Engagement & Authorization Scope
// ============================================================================

export const AUTHORIZED_ROE_CEDARLINE: RulesOfEngagement = {
  engagementId: 'ROE-2026-CED-001',
  clientName: 'Cedarline Insurance & Financial Services Plc',
  authorizedAssessorName: 'Independent Security Specialist (Player)',
  effectiveStartDate: '2026-10-15T00:00:00Z',
  effectiveEndDate: '2026-10-25T23:59:59Z',
  authorizedRoles: ['BLUE_TEAM', 'PURPLE_TEAM', 'RED_TEAM', 'INDEPENDENT_INVESTIGATOR'],
  allowedTechniques: [
    'Subnet discovery & port enumeration (netmap, svcscan)',
    'SIEM log analysis and query filtering (logview)',
    'Synthetic PCAP frame inspection and protocol dissection (packetview)',
    'Physical access badge audit & tailgating detection verification',
    'Controlled USB payload detonation on isolated air-gapped lab',
    'Social engineering awareness challenge evaluation with willing participants',
  ],
  prohibitedTechniques: [
    'Disruption of production financial payment gateways',
    'Destructive formatting of server storage arrays',
    'Unconsented physical lock picking or property damage',
    'External network traffic to non-fictional IP addresses or host machines',
  ],
  inScopeTargets: [
    {
      targetType: 'SUBNET',
      identifier: '10.0.4.0/24',
      description: 'Corporate LAN floor 3-6 workstations and internal servers',
    },
    {
      targetType: 'HOST',
      identifier: 'ws-fin-04',
      description: 'Finance workstation involved in removable media triage',
    },
    {
      targetType: 'FACILITY_ROOM',
      identifier: 'room-floor5-server',
      description: 'Datacenter server room 2B physical access controls',
    },
  ],
  emergencyContactPhone: '+234 1 234 5678 (Temitope Blessing / SOC Lead)',
  signatureSha256: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  isSignedAndActive: true,
};

// ============================================================================
// 9. Correlated Multi-Role Incident Contract
// ============================================================================

export const CORRELATED_INCIDENT_REMOVABLE_MEDIA: CorrelatedInvestigationIncident = {
  incidentId: 'INC-2026-PHYS-002',
  title: 'Curbside Removable Media Insertion & Synthetic SMB Beaconing',
  primaryVector: 'REMOVABLE_MEDIA',
  leadNpcId: 'npc_amina',
  targetHostId: 'ws-fin-04',
  targetRoomId: 'room-floor3-finance',
  correlationTimestamp: '2026-10-20T10:14:02Z',
  physicalAccessLogId: 'phys-log-003',
  removableMediaSerial: 'SN-KINGSTON-DT50-9941A',
  endpointTelemetryEventId: 'telem-usb-002',
  networkPacketFrameId: 104,
  siemAlertId: 'alert-smb-anom-01',
  chainOfCustodyIds: ['custody-usb-001', 'custody-disk-wsfin04'],
  investigativeRoles: {
    blueTeamAction:
      'Triage SIEM alert, isolate host ws-fin-04, preserve disk forensic hash, and revoke compromised accountant credentials.',
    purpleTeamAction:
      'Replay synthetic USB child-process telemetry against SIEM detection engine; verify why cscript.exe parent-child rule did not trigger alert.',
    redTeamAssessmentAction:
      'Perform authorized physical social pretext with reception staff to assess badge verification compliance under RoE.',
    investigatorAuditAction:
      'Correlate physical badge swipe times with USB kernel mount events, verify chain of custody integrity, and author regulatory disclosure.',
  },
};
