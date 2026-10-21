/**
 * Cyberlife : The Aster Incident Ground Truth & Assessment Validators
 *
 * Authoritative ground truth data for the incident at Cedarline Services.
 *
 * STRICT REQUISITE:
 * Pure deterministic in-game logic. All checks validate against in-game simulation state.
 */

import {
  MissionObjective,
  RootCauseAssessment,
  IncidentReportData,
  AsterServiceStatus,
  VerificationResult,
} from './types';

export const ASTER_INCIDENT_GROUND_TRUTH = {
  missionId: 'the_aster_incident' as const,
  title: 'The Aster Incident: Over-Privileged AI Assistant Investigation',
  organization: 'Cedarline Services Ltd.',
  affectedHost: 'app-portal-01',
  accessedTargetHost: 'filesrv-01',
  serviceAccount: 'svc-aster',
  compromisedResource: 'payroll_q3_confidential.xlsx',
  intendedRole: 'kb-assistant' as const,
  intendedScopes: ['docs:read', 'kb:search'] as const,
  excessiveRole: 'corporate-admin' as const,
  excessiveScopes: ['*'] as const,
  criticalEvidenceIds: ['EVD-2026-001', 'EVD-2026-002', 'EVD-2026-003', 'EVD-2026-004'] as const,
  suspiciousLogIds: ['LOG-2026-103B', 'LOG-2026-107B', 'LOG-2026-109B'] as const,
};

export const INITIAL_ASTER_SERVICE_STATUS: AsterServiceStatus = {
  hostId: 'app-portal-01',
  serviceName: 'aster-ai-core',
  operationalMode: 'NORMAL',
  activePolicyRole: 'corporate-admin',
  grantedScopes: ['*'],
  allowedSubnets: ['10.0.4.0/24'],
  smbAccessAllowed: true, // EXCEEDING INTENDED ACCESS
  databaseAccessAllowed: true, // EXCEEDING INTENDED ACCESS
};

export const DEFAULT_MISSION_OBJECTIVES: readonly MissionObjective[] = [
  // 1. Briefing
  {
    id: 'obj-briefing-01',
    phase: 'briefing',
    title: 'Review Incident Briefing with Lead Analyst Blessing',
    description:
      'Meet with Lead Security Analyst Blessing in the Cedarline office or review the initial alert in the Incident Portal.',
    isCompleted: false,
    hint: 'Blessing is standing near the office console. Speak with her [E] or open the Incident Portal app on your workstation.',
    requiredAction: 'speak_amina_or_open_portal',
  },

  // 2. Initial Assessment
  {
    id: 'obj-assess-01',
    phase: 'initial_assessment',
    title: 'Identify Active Corporate Subnet Nodes',
    description:
      'Use the simulated network discovery tool to scan the Cedarline subnet inventory and locate the Aster AI host (app-portal-01) and file repository (filesrv-01).',
    isCompleted: false,
    hint: "Open Terminal and run 'netmap hosts' to review discovered network infrastructure.",
    requiredAction: 'netmap_hosts',
  },

  // 3. Investigation
  {
    id: 'obj-investigate-01',
    phase: 'investigation',
    title: 'Audit Exposed Services on app-portal-01 and filesrv-01',
    description:
      'Inspect the service inventory of the AI application host and departmental file server to check running services and configuration flags.',
    isCompleted: false,
    hint: "Run 'svcscan inspect app-portal-01' and 'svcscan inspect filesrv-01' in the terminal.",
    requiredAction: 'svcscan_inspect',
  },
  {
    id: 'obj-investigate-02',
    phase: 'investigation',
    title: 'Analyze Authentication and Application Logs',
    description:
      'Query security logs to identify anomalous authentication activity, service account queries, and out-of-scope resource access.',
    isCompleted: false,
    hint: "Use 'logview recent' or 'logview filter --severity=WARN' to pinpoint out-of-scope queries from svc-aster.",
    requiredAction: 'logview_analyze',
  },

  // 4. Evidence Preservation
  {
    id: 'obj-evidence-01',
    phase: 'evidence_preservation',
    title: 'Inspect & Preserve Digital Forensic Artifacts',
    description:
      'Inspect relevant forensic evidence records and preserve a configuration snapshot of the Aster service before making system modifications.',
    isCompleted: false,
    hint: "Inspect evidence items using 'evidence list' and 'evidence inspect EVD-2026-004', or preserve evidence in the Incident Portal.",
    requiredAction: 'evidence_preserve',
  },

  // 5. Containment
  {
    id: 'obj-containment-01',
    phase: 'containment',
    title: 'Formulate Root Cause & Contain Aster Service',
    description:
      'Submit your root-cause assessment connecting the excessive permissions to the data access event, then execute authorized containment to isolate the service.',
    isCompleted: false,
    hint: "Submit your assessment in the Incident Portal or use 'aster-admin contain' in the terminal.",
    requiredAction: 'execute_containment',
  },

  // 6. Remediation
  {
    id: 'obj-remediation-01',
    phase: 'remediation',
    title: 'Apply Least-Privilege IAM Policy to Aster',
    description:
      'Reconfigure Aster from the over-scoped "corporate-admin" role to the least-privilege "kb-assistant" role (docs:read, kb:search), removing file server access.',
    isCompleted: false,
    hint: "Use the policy selector in Incident Portal or run 'aster-admin remediate --role=kb-assistant' in the terminal.",
    requiredAction: 'remediate_permissions',
  },

  // 7. Verification
  {
    id: 'obj-verification-01',
    phase: 'verification',
    title: 'Execute Recovery & Security Verification Suite',
    description:
      'Run verification tests to prove that legitimate knowledge queries succeed while unauthorized storage and database requests are rejected.',
    isCompleted: false,
    hint: "Click 'Run Verification' in the Incident Portal or run 'aster-admin verify' in the terminal.",
    requiredAction: 'verify_remediation',
  },

  // 8. Reporting
  {
    id: 'obj-reporting-01',
    phase: 'reporting',
    title: 'Submit Incident Response Report',
    description:
      'Compile and submit the final incident report covering root cause, impact, containment, remediation, and recommendations to prevent recurrence.',
    isCompleted: false,
    hint: 'Fill in the structured report sections in the Incident Portal or copy template from Notes and submit for review.',
    requiredAction: 'submit_report',
  },
];

/**
 * Validates a root cause assessment submitted by the player against the ground truth.
 */
export function validateRootCauseAssessment(
  assessment:
    | {
      suspectedRootCause: string;
      affectedComponent: string;
      observedImpact: string;
      supportingEvidenceIds: readonly string[];
    }
    | RootCauseAssessment
): { isAccurate: boolean; feedback: string } {
  const causeLower = assessment.suspectedRootCause.toLowerCase();
  const componentLower = assessment.affectedComponent.toLowerCase();
  const impactLower = assessment.observedImpact.toLowerCase();

  // 1. Component check: must mention Aster / AI / app-portal / svc-aster
  const componentValid =
    componentLower.includes('aster') ||
    componentLower.includes('ai') ||
    componentLower.includes('app-portal') ||
    componentLower.includes('svc-aster');

  // 2. Root cause check: must identify excessive permissions, wildcard scope, admin role, or over-privileged account
  const causeValid =
    causeLower.includes('permission') ||
    causeLower.includes('privilege') ||
    causeLower.includes('wildcard') ||
    causeLower.includes('admin') ||
    causeLower.includes('scope') ||
    causeLower.includes('least privilege');

  // 3. Observed impact check: file server access, payroll, data exfiltration, or unauthorized smb read
  const impactValid =
    impactLower.includes('payroll') ||
    impactLower.includes('file') ||
    impactLower.includes('filesrv') ||
    impactLower.includes('smb') ||
    impactLower.includes('share') ||
    impactLower.includes('read') ||
    impactLower.includes('access');

  // 4. Evidence check: must reference at least 1 valid evidence ID
  const validEvidence = assessment.supportingEvidenceIds.filter(id =>
    ['EVD-2026-001', 'EVD-2026-002', 'EVD-2026-003', 'EVD-2026-004'].includes(id.toUpperCase())
  );
  const evidenceValid = validEvidence.length >= 1;

  if (!componentValid) {
    return {
      isAccurate: false,
      feedback:
        'Incomplete Assessment: The affected component does not clearly identify the Aster AI service or its host (app-portal-01 / svc-aster). Please review service logs.',
    };
  }

  if (!causeValid) {
    return {
      isAccurate: false,
      feedback:
        'Incomplete Assessment: The suspected root cause does not address the underlying permissions weakness (e.g. excessive admin role or wildcard scope). Consider why Aster could reach resources outside its purpose.',
    };
  }

  if (!impactValid) {
    return {
      isAccurate: false,
      feedback:
        'Incomplete Assessment: The observed impact should specify the unauthorized resource accessed (e.g. file server filesrv-01 or confidential payroll records).',
    };
  }

  if (!evidenceValid) {
    return {
      isAccurate: false,
      feedback:
        'Missing Evidence: Your assessment must cite at least one verified evidence artifact (e.g. EVD-2026-001, EVD-2026-003, or EVD-2026-004).',
    };
  }

  return {
    isAccurate: true,
    feedback:
      'Root Cause Confirmed: Aster was deployed with an over-privileged service account (role: corporate-admin, scope: ["*"]) permitting out-of-scope SMB access to filesrv-01. Sufficient evidence is established to proceed to containment.',
  };
}

/**
 * Validates the final incident report submitted by the player.
 */
export function validateIncidentReport(
  report: IncidentReportData,
  missionState: {
    isContained: boolean;
    isRemediated: boolean;
    isVerified: boolean;
    asterService: AsterServiceStatus;
  }
): { isApproved: boolean; score: number; reviewerFeedback: string } {
  let score = 0;
  const feedbackItems: string[] = [];

  // Section 1: Executive Summary (>= 20 characters)
  if (report.executiveSummary && report.executiveSummary.trim().length >= 20) {
    score += 15;
  } else {
    feedbackItems.push('Executive Summary is brief or missing.');
  }

  // Section 2: Timeline (>= 15 characters)
  if (report.timeline && report.timeline.trim().length >= 15) {
    score += 10;
  } else {
    feedbackItems.push('Timeline lacks sufficient detail.');
  }

  // Section 3: Affected Systems
  if (report.affectedSystems && report.affectedSystems.length >= 1) {
    const hasCore = report.affectedSystems.some(
      s =>
        s.toLowerCase().includes('app-portal') ||
        s.toLowerCase().includes('filesrv') ||
        s.toLowerCase().includes('aster')
    );
    if (hasCore) {
      score += 15;
    } else {
      score += 5;
      feedbackItems.push('Affected systems list should mention app-portal-01 or filesrv-01.');
    }
  } else {
    feedbackItems.push('Affected systems list is empty.');
  }

  // Section 4: Root Cause (>= 20 characters)
  if (report.rootCause && report.rootCause.trim().length >= 20) {
    score += 15;
  } else {
    feedbackItems.push('Root Cause analysis requires further explanation.');
  }

  // Section 5: Containment & Remediation Alignment with Actual State
  if (missionState.isContained && missionState.isRemediated) {
    score += 20;
  } else {
    feedbackItems.push('Containment or remediation has not been verified in the simulation.');
  }

  // Section 6: Verification Results Alignment
  if (missionState.isVerified && missionState.asterService.activePolicyRole === 'kb-assistant') {
    score += 15;
  } else {
    feedbackItems.push('Remediation verification must confirm role: kb-assistant.');
  }

  // Section 7: Recommendations (>= 20 characters)
  if (report.recommendations && report.recommendations.trim().length >= 20) {
    score += 10;
  } else {
    feedbackItems.push('Recommendations should provide actionable guidance to prevent recurrence.');
  }

  const isApproved = score >= 70;
  const reviewerFeedback = isApproved
    ? `Incident Report Approved with high merit (Score: ${score}/100). Excellent identification of excessive service scopes, proper evidence preservation prior to containment, and verification of least-privilege policy.`
    : `Incident Report Requires Revision (Score: ${score}/100). Areas needing attention: ${feedbackItems.join(' ')}`;

  return {
    isApproved,
    score,
    reviewerFeedback,
  };
}

/**
 * Runs deterministic recovery verification on the live Aster service status.
 */
export function runSimulatedVerification(
  asterService: AsterServiceStatus,
  currentSimTimeSeconds: number
): VerificationResult {
  const legitimateDocsAccessible =
    asterService.grantedScopes.includes('docs:read') ||
    asterService.grantedScopes.includes('kb:search') ||
    asterService.activePolicyRole === 'kb-assistant';

  const fileServerAccessBlocked =
    !asterService.smbAccessAllowed &&
    asterService.activePolicyRole !== 'corporate-admin' &&
    !asterService.grantedScopes.includes('*');

  const databaseAccessBlocked =
    !asterService.databaseAccessAllowed &&
    asterService.activePolicyRole !== 'corporate-admin' &&
    !asterService.grantedScopes.includes('*');

  const auditLogVerified =
    asterService.operationalMode === 'REMEDIATED' ||
    (asterService.operationalMode === 'NORMAL' && asterService.activePolicyRole === 'kb-assistant');

  const passed =
    legitimateDocsAccessible &&
    fileServerAccessBlocked &&
    databaseAccessBlocked &&
    asterService.activePolicyRole === 'kb-assistant';

  const checkDetails = [
    {
      checkName: 'Legitimate Knowledge-Base Access (docs:read)',
      passed: legitimateDocsAccessible,
      description: legitimateDocsAccessible
        ? 'PASSED: Internal handbook and engineering policy search queries return HTTP 200 OK.'
        : 'FAILED: Legitimate intranet documentation search is unavailable.',
    },
    {
      checkName: 'File Server SMB Pathway Isolation (filesrv-01:445)',
      passed: fileServerAccessBlocked,
      description: fileServerAccessBlocked
        ? 'PASSED: Query to SMB share //filesrv-01/finance-secure returned HTTP 403 FORBIDDEN.'
        : 'FAILED: File server access pathway remains open under excessive role.',
    },
    {
      checkName: 'Restricted Database Access Isolation',
      passed: databaseAccessBlocked,
      description: databaseAccessBlocked
        ? 'PASSED: Direct SQL read attempts to backend database rejected (ACCESS_DENIED).'
        : 'FAILED: Database read scopes are still active on service token.',
    },
    {
      checkName: 'IAM Role Least-Privilege Conformance',
      passed: asterService.activePolicyRole === 'kb-assistant',
      description:
        asterService.activePolicyRole === 'kb-assistant'
          ? 'PASSED: Service account svc-aster is bound to scoped role "role:kb-assistant".'
          : `FAILED: Current role is "${asterService.activePolicyRole}"; expected "role:kb-assistant".`,
    },
  ];

  const message = passed
    ? 'Verification Succeeded: All 4 security controls verified. Aster retains legitimate knowledge-base functionality while all unauthorized pathways to departmental storage and databases are blocked.'
    : 'Verification Failed: One or more security controls failed. Aster service policy does not yet satisfy least-privilege requirements.';

  return {
    legitimateDocsAccessible,
    fileServerAccessBlocked,
    databaseAccessBlocked,
    auditLogVerified,
    passed,
    testedAt: currentSimTimeSeconds,
    message,
    checkDetails,
  };
}
