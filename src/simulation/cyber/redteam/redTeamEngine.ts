/**
 * Cyberlife — Milestone 17: Red Team Domain Simulation Engine & Evaluator
 *
 * Implements deterministic execution of simulated assessment tools,
 * finding validation tracking, cryptographic evidence generation,
 * and executive penetration testing report evaluation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory deterministic simulation.
 * Zero host shell execution · Zero real network sockets · Zero external requests.
 */

import {
  RedTeamAssessmentState,
  RedTeamActionResult,
  RedTeamEvidenceItem,
  RedTeamReportSubmission,
  RedTeamEvaluationResult,
  FindingStatus,
  AssessmentTargetAsset,
  AssessmentTargetService,
  ScopeEvaluationResult,
  RedTeamToolDefinition,
} from './types';
import { RedTeamAuthorizationGate } from './authorizationGate';

export class RedTeamEngine {
  /**
   * Executes a registered Red Team assessment tool against a target asset.
   * Centralizes the authorization gate check before any simulation action runs.
   */
  public static executeToolAction(
    state: RedTeamAssessmentState,
    options: {
      readonly targetId: string;
      readonly toolId: string;
      readonly currentSimTime?: number;
      readonly actorName?: string;
    }
  ): RedTeamActionResult {
    const {
      targetId,
      toolId,
      currentSimTime = 0,
      actorName = 'Protector (Assessor)',
    } = options;

    const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tool = state.availableTools.find(t => t.id === toolId);
    const target = state.targets.find(t => t.id === targetId);

    // 1. Tool existence check
    if (!tool) {
      const scopeEvaluation = {
        isAuthorized: false,
        decision: 'BLOCKED_UNAUTHORIZED' as const,
        reason: `Unknown tool identifier '${toolId}'. Tool is not registered in the Red Team toolkit.`,
        targetedResource: targetId,
        attemptedAction: toolId,
        actionCategory: 'RECONNAISSANCE' as const,
        timestampSimTime: currentSimTime,
      };

      return {
        actionId,
        assessmentId: state.roe.assessmentId,
        targetId,
        toolId,
        toolName: 'Unknown Tool',
        category: 'RECONNAISSANCE',
        status: 'BLOCKED',
        scopeEvaluation,
        simulatedTimestamp: currentSimTime,
        executionLogs: [
          `[-] FATAL: Tool '${toolId}' is not registered in toolkit. Execution aborted.`,
        ],
        observations: ['No assessment action executed due to unknown tool definition.'],
        limitationExplanation: 'Tool could not be resolved in domain registry.',
      };
    }

    // 2. Target existence check
    if (!target) {
      const scopeEvaluation = {
        isAuthorized: false,
        decision: 'BLOCKED_OUT_OF_SCOPE' as const,
        reason: `TARGET OUT OF SCOPE: Asset '${targetId}' does not exist in target inventory.`,
        targetedResource: targetId,
        attemptedAction: tool.id,
        actionCategory: tool.category,
        timestampSimTime: currentSimTime,
      };

      return {
        actionId,
        assessmentId: state.roe.assessmentId,
        targetId,
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: 'BLOCKED',
        scopeEvaluation,
        simulatedTimestamp: currentSimTime,
        executionLogs: [
          `====================================================================`,
          `[!] EKOSEC AUTHORIZATION GUARD: ACTION REJECTED`,
          `====================================================================`,
          `Target:      ${targetId}`,
          `Tool:        ${tool.name} [${tool.category}]`,
          `Decision:    BLOCKED_OUT_OF_SCOPE`,
          `Reason:      Asset identifier '${targetId}' is not in client scope inventory.`,
          `====================================================================`,
        ],
        observations: [`Target '${targetId}' was rejected by domain authorization policy.`],
        limitationExplanation: 'Out-of-scope targets are strictly prohibited by Rules of Engagement.',
      };
    }

    // 3. Centralized Authorization Gate Evaluation
    const scopeEvaluation = RedTeamAuthorizationGate.evaluateScope(
      state,
      target.id,
      tool.category,
      tool.id,
      currentSimTime
    );

    if (!scopeEvaluation.isAuthorized) {
      const executionLogs = [
        `====================================================================`,
        `[!] EKOSEC RULES OF ENGAGEMENT GUARD: ACTION BLOCKED`,
        `====================================================================`,
        `Assessor:    ${actorName}`,
        `Engagement:  ${state.roe.assessmentId} (${state.roe.clientOrganization})`,
        `Target Host: ${target.hostname} (${target.ipAddress})`,
        `Category:    ${tool.category} // Tool: ${tool.name}`,
        `Decision:    ${scopeEvaluation.decision}`,
        `Reason:      ${scopeEvaluation.reason}`,
        `====================================================================`,
        `[-] Operation halted immediately by simulation authorization gate.`,
        `[-] Zero network packets emitted. Protected target state remains untouched.`,
      ];

      return {
        actionId,
        assessmentId: state.roe.assessmentId,
        targetId: target.id,
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: 'BLOCKED',
        scopeEvaluation,
        simulatedTimestamp: currentSimTime,
        executionLogs,
        observations: [
          `Security boundary enforced: ${scopeEvaluation.reason}`,
          'Target asset state is protected and was not evaluated or modified.',
        ],
        limitationExplanation:
          'Action rejected by Rules of Engagement. Only pre-approved in-scope assets and actions are evaluated.',
      };
    }

    // 4. Authorized Execution: Deterministic Simulation based on Target & Tool
    return this.generateDeterministicResult({
      state,
      actionId,
      target,
      tool,
      currentSimTime,
      actorName,
      scopeEvaluation,
    });
  }

  /**
   * Generates deterministic, typed execution traces based on the fictional target state.
   */
  private static generateDeterministicResult(params: {
    readonly state: RedTeamAssessmentState;
    readonly actionId: string;
    readonly target: AssessmentTargetAsset;
    readonly tool: RedTeamToolDefinition;
    readonly currentSimTime: number;
    readonly actorName: string;
    readonly scopeEvaluation: ScopeEvaluationResult;
  }): RedTeamActionResult {
    const { actionId, target, tool, currentSimTime, actorName, scopeEvaluation } = params;
    const baseHeader = [
      `[*] ====================================================================`,
      `[*] EKOSEC RED TEAM SUITE // AUTHORIZED ASSESSMENT RUNNER`,
      `[*] ====================================================================`,
      `[*] Operator:    ${actorName}`,
      `[*] Mandate:     ${params.state.roe.assessmentId} (${params.state.roe.clientOrganization})`,
      `[*] Target Host: ${target.hostname} (${target.ipAddress}) [Segment: ${target.segmentName}]`,
      `[*] Technique:   ${tool.name} [Category: ${tool.category}]`,
      `[*] Scope Gate:  AUTHORIZED (Rules of Engagement Verified)`,
      `[*] --------------------------------------------------------------------`,
    ];

    // Tool 1: Reconnaissance & Asset Discovery
    if (tool.id === 'tool-recon-enum') {
      const serviceLines = target.services.map(
        (s: AssessmentTargetService) =>
          `[+] Found Service: ${s.port}/${s.protocol} - ${s.name} (${s.product} ${s.version}) ${
            s.banner ? `[Banner: "${s.banner}"]` : ''
          }`
      );

      const logs = [
        ...baseHeader,
        `[*] Querying local simulation directory for ${target.hostname}...`,
        `[+] Host resolution successful: ${target.fqdn} -> ${target.ipAddress}`,
        `[*] Operating System: ${target.os}`,
        `[*] Scanning permitted port spectrum...`,
        ...serviceLines,
        `[+] Passive reconnaissance complete. Identified ${target.services.length} listening service(s).`,
        `[*] Zero external packets were transmitted during this simulated discovery.`,
      ];

      const observations = [
        `Target ${target.hostname} (${target.ipAddress}) is online in ${target.segmentName}.`,
        `Exposed services: ${target.services.map((s: AssessmentTargetService) => `${s.port}/${s.protocol} ${s.name}`).join(', ')}.`,
        `Environment: ${target.environmentType}. Role: ${target.roleLabel}.`,
      ];

      return {
        actionId,
        assessmentId: params.state.roe.assessmentId,
        targetId: target.id,
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: 'SUCCESS',
        scopeEvaluation,
        simulatedTimestamp: currentSimTime,
        executionLogs: logs,
        observations,
        limitationExplanation:
          'Reconnaissance reflects in-scope inventory data. Does not prove whether exposed services are vulnerable without active validation.',
      };
    }

    // Tool 2: SMB Configuration & Share Auditor
    if (tool.id === 'tool-config-smb-audit') {
      const isFilesrv = target.id === 'filesrv-01';
      if (isFilesrv) {
        const evidenceId = `EVD-M17-SMB-${Date.now().toString().slice(-6)}`;
        const evidence: RedTeamEvidenceItem = {
          id: evidenceId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          title: `SMB Configuration Audit Trace: filesrv-01`,
          source: `SMB Config Auditor // filesrv-01:445`,
          collectionTimeSimTime: currentSimTime,
          evidenceType: 'CONFIG_EVALUATION',
          integrityStatus: 'VERIFIED',
          hashSha256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
          artifactSnippet: [
            `TARGET: 10.0.4.50:445 (filesrv-01.corp.local)`,
            `SMB2_NEGOTIATE_RESPONSE: SecurityMode=0x01 (SIGNING_ENABLED, SIGNING_NOT_REQUIRED)`,
            `TREE_CONNECT: \\\\filesrv-01\\public_staging [SUCCESS AS GUEST/NULL SESSION]`,
            `SHARE_CONTENTS: deployment_credentials_backup.txt.bak (READ ACCESS GRANTED)`,
          ],
          chainOfCustody: [
            {
              time: currentSimTime,
              handler: actorName,
              action: 'AUTOMATED_DIAGNOSTIC_EVIDENCE_CAPTURE',
              signature: 'SIG-EKOSEC-SMB-AUDIT-VERIFIED',
            },
          ],
          analystNotes: 'Confirmed SMB signing not enforced and guest share accessible without credentials.',
        };

        const logs = [
          ...baseHeader,
          `[*] Connecting to simulated SMB2 endpoint at ${target.ipAddress}:445...`,
          `[+] Handshake established: Negotiated dialect SMB 3.1.1 with Samba 4.18.2-Debian.`,
          `[*] Auditing SMB signing security flags...`,
          `[!] ALERT: SecurityMode = 0x01 (Signing Enabled, but NOT Required).`,
          `[!] FINDING CONFIRMED: Target is vulnerable to NTLM Relay attacks.`,
          `[*] Auditing share permissions with NULL session (anonymous)...`,
          `[+] Successfully connected to share: \\\\${target.hostname}\\public_staging`,
          `[!] SENSITIVE ARTIFACT EXPOSED: Found deployment notes accessible to unauthenticated guests!`,
          `[+] Cryptographic evidence artifact preserved: ${evidenceId}`,
          `[*] Completed non-destructive configuration review.`,
        ];

        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'SUCCESS',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: logs,
          observations: [
            'Samba SMB2 signing is NOT enforced (server signing = auto). Vulnerable to NTLM relay.',
            'Share "\\\\filesrv-01\\public_staging" permits unauthenticated guest enumeration.',
            'Evidence artifact generated with SHA-256 provenance hash.',
          ],
          candidateFindingId: 'VULN-CEDAR-002',
          generatedEvidence: evidence,
          limitationExplanation:
            'SMB evaluation evaluated dialect negotiation and permissions without writing or deleting any file assets.',
        };
      } else {
        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'INCONCLUSIVE',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: [
            ...baseHeader,
            `[*] Connecting to ${target.ipAddress}:445...`,
            `[-] Connection refused: Target does not expose SMB file sharing service on port 445.`,
            `[?] Inconclusive: SMB auditor requires an active SMB2/3 listener.`,
          ],
          observations: [`Host ${target.hostname} does not run an SMB service. Audit inconclusive.`],
          limitationExplanation: 'Target does not expose port 445/tcp.',
        };
      }
    }

    // Tool 3: REST API Object-Level Authorization Tester (IDOR)
    if (tool.id === 'tool-web-api-idor') {
      const isAppPortal = target.id === 'app-portal-01';
      if (isAppPortal) {
        const evidenceId = `EVD-M17-API-${Date.now().toString().slice(-6)}`;
        const evidence: RedTeamEvidenceItem = {
          id: evidenceId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          title: `REST API Broken Object-Level Authorization Trace: app-portal-01`,
          source: `API BOLA Tester // app-portal-01:8080/api/v1/internal/claims`,
          collectionTimeSimTime: currentSimTime,
          evidenceType: 'WEB_API_TRACE',
          integrityStatus: 'VERIFIED',
          hashSha256: `4a5f6e7d8c9b0a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123`,
          artifactSnippet: [
            `REQUEST: GET /api/v1/internal/claims/CLM-2026-9042 HTTP/1.1`,
            `AUTHORIZATION: Bearer jwt_token_standard_staff_user`,
            `RESPONSE: HTTP/1.1 200 OK`,
            `PAYLOAD_SNIPPET: {"claimId": "CLM-2026-9042", "executiveOwner": "Goodness", "settlementPayoutNaira": 85000000, "status": "CONFIDENTIAL_EXECUTIVE_HOLD"}`,
            `RESULT: BOLA/IDOR Confirmed — Standard user accessed executive record without authorization!`,
          ],
          chainOfCustody: [
            {
              time: currentSimTime,
              handler: actorName,
              action: 'AUTOMATED_API_TEST_EVIDENCE_CAPTURE',
              signature: 'SIG-EKOSEC-IDOR-TRACE-OK',
            },
          ],
          analystNotes: 'Confirmed broken object-level authorization on internal claims endpoint.',
        };

        const logs = [
          ...baseHeader,
          `[*] Connecting to Aster Assistant REST API on ${target.ipAddress}:8080...`,
          `[+] Handshake verified with Gunicorn / FastAPI service (AsterAssistant-API/1.4.2).`,
          `[*] Simulating request with low-privileged employee session: "staff_tier1"...`,
          `[>] GET /api/v1/internal/claims/CLM-2026-9042 HTTP/1.1`,
          `[>] Host: ${target.hostname}:8080`,
          `[>] Authorization: Bearer <valid_low_privileged_staff_token>`,
          `[*] Awaiting simulated server response...`,
          `[<] HTTP/1.1 200 OK (Content-Type: application/json)`,
          `[<] Payload: {"claimId":"CLM-2026-9042","executive":"Goodness","settlement":85000000}`,
          `[!] VULNERABILITY CONFIRMED: Broken Object-Level Authorization (BOLA/IDOR)!`,
          `[!] The API returned confidential executive settlement data to an unauthorized staff session.`,
          `[+] Preserving cryptographic HTTP trace artifact: ${evidenceId}`,
          `[*] Non-destructive test completed. Zero database records were modified or deleted.`,
        ];

        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'SUCCESS',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: logs,
          observations: [
            'API endpoint /api/v1/internal/claims/{id} lacks object ownership verification.',
            'Standard staff token was able to read executive settlement record CLM-2026-9042.',
            'Evidence item generated with SHA-256 hash provenance.',
          ],
          candidateFindingId: 'VULN-CEDAR-001',
          generatedEvidence: evidence,
          limitationExplanation:
            'Testing evaluated object read authorization only. Did not test PUT/DELETE mutations or SQL injection.',
        };
      } else {
        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'INCONCLUSIVE',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: [
            ...baseHeader,
            `[*] Connecting to ${target.ipAddress}:8080...`,
            `[-] Connection refused: Host does not expose internal Claims API.`,
            `[?] Inconclusive: BOLA tester requires Aster Assistant REST API on port 8080.`,
          ],
          observations: [`Host ${target.hostname} does not host the Aster claims API.`],
          limitationExplanation: 'Target does not expose port 8080/tcp.',
        };
      }
    }

    // Tool 4: Reverse-Proxy Header Spoofing Evaluator
    if (tool.id === 'tool-auth-header-spoof') {
      const isGateway = target.id === 'api-gw-01';
      if (isGateway) {
        const evidenceId = `EVD-M17-AUTH-${Date.now().toString().slice(-6)}`;
        const evidence: RedTeamEvidenceItem = {
          id: evidenceId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          title: `Reverse-Proxy Header Spoofing Trace: api-gw-01`,
          source: `Header Trust Evaluator // api-gw-01:443`,
          collectionTimeSimTime: currentSimTime,
          evidenceType: 'AUTH_POLICY_DIFF',
          integrityStatus: 'VERIFIED',
          hashSha256: `8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6789abcd`,
          artifactSnippet: [
            `REQUEST: POST /api/v1/admin/security/policy HTTP/1.1`,
            `INJECTED_HEADER: X-Internal-Role: secops_admin`,
            `INJECTED_HEADER: X-Authenticated-User: operator_vance`,
            `PROXY_BEHAVIOR: Envoy forwarded client headers without stripping`,
            `BACKEND_EVALUATION: {"roleEnforced": "secops_admin", "accessGranted": true}`,
            `RESULT: Vertical Privilege Escalation Confirmed via Header Trust!`,
          ],
          chainOfCustody: [
            {
              time: currentSimTime,
              handler: actorName,
              action: 'AUTOMATED_AUTH_EVIDENCE_CAPTURE',
              signature: 'SIG-EKOSEC-AUTH-SPOOF-OK',
            },
          ],
          analystNotes: 'Confirmed upstream reverse proxy forwards client-controlled internal role headers.',
        };

        const logs = [
          ...baseHeader,
          `[*] Connecting to Envoy reverse proxy on ${target.ipAddress}:443...`,
          `[+] TLS 1.3 session negotiated with ${target.hostname}.`,
          `[*] Synthesizing simulated client request with forged internal role header...`,
          `[>] POST /api/v1/admin/security/policy HTTP/1.1`,
          `[>] X-Internal-Role: secops_admin`,
          `[>] X-Authenticated-User: operator_vance`,
          `[*] Inspecting proxied request headers forwarded to backend service...`,
          `[!] ALERT: Header "X-Internal-Role" was NOT stripped by reverse proxy!`,
          `[!] BACKEND OUTCOME: Backend service accepted client role assertion as valid SecOps Admin.`,
          `[!] CRITICAL VULNERABILITY CONFIRMED: Privilege Escalation via Header Spoofing!`,
          `[+] Preserving cryptographic evidence artifact: ${evidenceId}`,
          `[*] Simulation completed safely without saving persistent administrative changes.`,
        ];

        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'SUCCESS',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: logs,
          observations: [
            'Envoy API gateway fails to strip client-supplied X-Internal-Role headers.',
            'Downstream services trust upstream header without re-verifying JWT claims.',
            'Enables vertical privilege escalation from standard user to secops_admin.',
          ],
          candidateFindingId: 'VULN-CEDAR-003',
          generatedEvidence: evidence,
          limitationExplanation:
            'Evaluated header forwarding behavior only. Did not alter backend database policy records.',
        };
      } else {
        return {
          actionId,
          assessmentId: params.state.roe.assessmentId,
          targetId: target.id,
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          status: 'INCONCLUSIVE',
          scopeEvaluation,
          simulatedTimestamp: currentSimTime,
          executionLogs: [
            ...baseHeader,
            `[*] Connecting to ${target.ipAddress}...`,
            `[-] Target is not an API reverse proxy gateway.`,
            `[?] Inconclusive: Header trust evaluation requires reverse-proxy routing host.`,
          ],
          observations: [`Host ${target.hostname} is not configured as an API gateway.`],
          limitationExplanation: 'Target is not an Envoy or reverse proxy appliance.',
        };
      }
    }

    // Tool 5: TLS Cipher Suite & Transport Security Evaluator (Benign / False Positive Check)
    if (tool.id === 'tool-crypto-cipher-eval') {
      const isWebQuote = target.id === 'web-quote-01';
      const logs = [
        ...baseHeader,
        `[*] Connecting to HTTPS service on ${target.ipAddress}:443...`,
        `[*] Testing SSL/TLS handshake negotiations across protocol versions...`,
        `[*] Probe 1: Testing legacy TLS 1.0 ClientHello with 3DES/RC4 ciphers...`,
        `[+] RESULT: Handshake REJECTED by host. Server sent TLS Alert 70 (protocol_version).`,
        `[*] Probe 2: Testing legacy TLS 1.1 ClientHello...`,
        `[+] RESULT: Handshake REJECTED by host. Protocol unsupported.`,
        `[*] Probe 3: Testing modern TLS 1.2 with ECDHE-RSA-AES256-GCM-SHA384...`,
        `[+] RESULT: Handshake ACCEPTED. Forward secrecy verified.`,
        `[*] Probe 4: Testing TLS 1.3 with TLS_AES_256_GCM_SHA384...`,
        `[+] RESULT: Handshake ACCEPTED with 0-RTT anti-replay protection.`,
        `[*] Inspecting HTTP transport headers...`,
        `[+] Strict-Transport-Security (HSTS): max-age=31536000; includeSubDomains; preload [ACTIVE]`,
        `====================================================================`,
        `[+] PEDAGOGICAL AUDIT CONCLUSION: SCANNER WARNING IS A FALSE POSITIVE!`,
        `====================================================================`,
        `[*] The automated scanner alert (VULN-CEDAR-004) was triggered by a banner heuristic.`,
        `[*] Actual diagnostic probing proves the host strictly rejects weak ciphers and enforces modern TLS.`,
        `[!] Action for Assessor: Mark VULN-CEDAR-004 as REJECTED in Findings Studio!`,
      ];

      return {
        actionId,
        assessmentId: params.state.roe.assessmentId,
        targetId: target.id,
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        status: 'DEFENSE_PREVENTED',
        scopeEvaluation,
        simulatedTimestamp: currentSimTime,
        executionLogs: logs,
        observations: [
          'Diagnostic probe proves web-quote-01 strictly enforces TLS 1.2 and TLS 1.3.',
          'Legacy TLS 1.0/1.1 connections are immediately rejected by server.',
          'Candidate finding VULN-CEDAR-004 is a confirmed BENIGN FALSE POSITIVE.',
        ],
        candidateFindingId: isWebQuote ? 'VULN-CEDAR-004' : undefined,
        limitationExplanation:
          'Evaluated cryptographic transport negotiation. Proves absence of weak SSL/TLS cipher suites.',
      };
    }

    // Default Fallback
    return {
      actionId,
      assessmentId: params.state.roe.assessmentId,
      targetId: target.id,
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'SUCCESS',
      scopeEvaluation,
      simulatedTimestamp: currentSimTime,
      executionLogs: [
        ...baseHeader,
        `[*] Tool ${tool.name} executed against ${target.hostname}.`,
        `[+] Diagnostic evaluation complete.`,
      ],
      observations: [`Completed ${tool.name} against ${target.hostname}.`],
      limitationExplanation: 'Standard diagnostic probe.',
    };
  }

  /**
   * Updates finding status, records validation history, and maintains audit trail.
   */
  public static validateFinding(
    state: RedTeamAssessmentState,
    findingId: string,
    decision: 'VALIDATE' | 'REJECT' | 'MARK_UNRESOLVED',
    rationale: string,
    currentSimTime: number = 0,
    actorName: string = 'Protector (Assessor)'
  ): RedTeamAssessmentState {
    const findingIndex = state.findings.findIndex(f => f.id === findingId);
    if (findingIndex === -1) return state;

    const finding = state.findings[findingIndex]!;
    const previousStatus = finding.status;
    let newStatus: FindingStatus = 'VALIDATED';
    let newConfidence = finding.confidence;

    if (decision === 'VALIDATE') {
      newStatus = 'VALIDATED';
      newConfidence = 'CONFIRMED';
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
      newConfidence = finding.isFalsePositive ? 'BENIGN_FALSE_POSITIVE' : 'UNRESOLVED';
    } else if (decision === 'MARK_UNRESOLVED') {
      newStatus = 'UNRESOLVED';
      newConfidence = 'UNRESOLVED';
    }

    const updatedFinding = {
      ...finding,
      status: newStatus,
      confidence: newConfidence,
      analystNotes: rationale ? `${finding.analystNotes} | Assessor Decision: ${rationale}` : finding.analystNotes,
      validationHistory: [
        ...finding.validationHistory,
        {
          timestampSimTime: currentSimTime,
          handler: actorName,
          action: decision,
          previousStatus,
          newStatus,
          rationale,
        },
      ],
    };

    const nextFindings = [...state.findings];
    nextFindings[findingIndex] = updatedFinding;

    const nextAuditLog = [
      ...state.auditLog,
      {
        id: `audit-val-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestampSimTime: currentSimTime,
        actor: actorName,
        action: `FINDING_${decision}`,
        target: finding.targetId,
        status: 'ACTION_COMPLETED' as const,
        details: `Finding ${findingId} transitioned from ${previousStatus} to ${newStatus}. Rationale: "${rationale}"`,
      },
    ];

    return {
      ...state,
      findings: nextFindings,
      auditLog: nextAuditLog,
    };
  }

  /**
   * Evaluates the player's final Executive Penetration Testing Deliverable against ground truth.
   */
  public static evaluateReportSubmission(
    submission: RedTeamReportSubmission,
    state: RedTeamAssessmentState
  ): RedTeamEvaluationResult {
    const expectedTruePositives = ['VULN-CEDAR-001', 'VULN-CEDAR-002', 'VULN-CEDAR-003'];
    const expectedFalsePositive = 'VULN-CEDAR-004';

    let score = 0;
    const feedback: string[] = [];

    // 1. True Positives Accuracy (up to 45 points: 15 points each)
    let correctFindingsCount = 0;
    for (const expectedId of expectedTruePositives) {
      if (submission.validatedFindingIds.includes(expectedId)) {
        correctFindingsCount++;
        score += 15;
      } else {
        feedback.push(`[-] OMISSION: Real vulnerability ${expectedId} was missing from validated findings.`);
      }
    }

    if (correctFindingsCount === expectedTruePositives.length) {
      feedback.push(`[+] ACCURACY: All 3 confirmed security weaknesses (BOLA on app-portal-01, SMB signing on filesrv-01, Header Spoofing on api-gw-01) correctly validated.`);
    }

    // 2. False Positive Critical Evaluation (25 points)
    const falsePositiveCorrectlyIdentified =
      submission.rejectedFalsePositiveIds.includes(expectedFalsePositive);
    const falsePositiveIncorrectlyReportedAsReal =
      submission.validatedFindingIds.includes(expectedFalsePositive);

    if (falsePositiveCorrectlyIdentified && !falsePositiveIncorrectlyReportedAsReal) {
      score += 25;
      feedback.push(`[+] CRITICAL THINKING: Benign scanner alert VULN-CEDAR-004 (TLS cipher heuristic on web-quote-01) was correctly recognized as a false positive and rejected.`);
    } else if (falsePositiveIncorrectlyReportedAsReal) {
      score = Math.max(0, score - 15);
      feedback.push(`[-] FALSE POSITIVE ERROR: Candidate finding VULN-CEDAR-004 was reported as a genuine vulnerability. Deep TLS inspection proves the server enforces forward secrecy!`);
    } else {
      feedback.push(`[?] UNRESOLVED FALSE POSITIVE: Candidate finding VULN-CEDAR-004 was not formally evaluated and rejected.`);
    }

    // 3. Evidence Provenance & Cryptographic Chain of Custody (15 points)
    const preservedIds = submission.preservedEvidenceIds;
    const evidenceCompletenessScore = Math.min(15, preservedIds.length * 5);
    score += evidenceCompletenessScore;
    if (evidenceCompletenessScore >= 15) {
      feedback.push(`[+] EVIDENCE AUDITABILITY: Sufficient cryptographic proof-of-concept traces preserved with verified SHA-256 hashes.`);
    } else {
      feedback.push(`[-] EVIDENCE GAPS: Only ${preservedIds.length} evidence artifact(s) preserved in vault. Complete reporting requires robust proof-of-concept documentation.`);
    }

    // 4. Executive Summary, Remediation Roadmap & Limitation Disclosures (15 points)
    if (submission.executiveSummary && submission.executiveSummary.length > 30) {
      score += 5;
    }
    if (submission.remediationRoadmap && submission.remediationRoadmap.length >= 2) {
      score += 5;
    }
    if (submission.limitationsDisclosed && submission.limitationsDisclosed.length >= 1) {
      score += 5;
    }

    // 5. Out-of-Scope Asset Respect Check
    const outOfScopeViolations = state.actionHistory.filter(
      act => act.scopeEvaluation.decision === 'BLOCKED_OUT_OF_SCOPE'
    );
    const outOfScopeAssetsRespected = outOfScopeViolations.length === 0;

    const finalScore = Math.min(100, Math.max(0, score));
    const isApproved = finalScore >= 75 && !falsePositiveIncorrectlyReportedAsReal;

    const summary = isApproved
      ? `EXCELLENT RED TEAM ASSESSMENT (Score: ${finalScore}%). CISO Goodness has officially APPROVED the penetration testing deliverable. Technical findings are rigorous, false positives were correctly eliminated, and actionable remediation priorities were established.`
      : `ASSESSMENT DELIVERABLE REVISED / REJECTED (Score: ${finalScore}%). The submission did not meet professional Red Team assurance standards. Please review false-positive determinations and evidence completeness.`;

    return {
      isApproved,
      scorePercentage: finalScore,
      feedbackSummary: summary,
      correctFindingsCount,
      totalExpectedFindings: expectedTruePositives.length,
      falsePositiveCorrectlyIdentified,
      falsePositiveIncorrectlyReportedAsReal,
      outOfScopeAssetsRespected,
      evidenceCompletenessScore,
      missingEvidenceIds: expectedTruePositives.filter(
        id => !submission.validatedFindingIds.includes(id)
      ),
      evaluatorFeedback: feedback,
    };
  }

  /**
   * Generates a markdown-formatted executive deliverable report from real assessment state.
   */
  public static generateExecutiveDeliverable(
    state: RedTeamAssessmentState,
    submission?: RedTeamReportSubmission
  ): string {
    const validated = state.findings.filter(f => f.status === 'VALIDATED');
    const rejected = state.findings.filter(f => f.status === 'REJECTED');
    const unresolved = state.findings.filter(f => f.status === 'SUSPECTED' || f.status === 'UNRESOLVED');

    const lines: string[] = [
      `# EKOSEC LABS — EXECUTIVE PENETRATION TESTING DELIVERABLE`,
      `**Client**: ${state.roe.clientOrganization}`,
      `**Mandate Reference**: ${state.roe.assessmentId}`,
      `**Authorizing Official**: ${state.roe.authorizingOfficial} (${state.roe.authorizingRole})`,
      `**Lead Assessor**: ${state.roe.authorizedAssessorName}`,
      `**Date**: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      ``,
      `---`,
      ``,
      `## 1. Executive Summary`,
      submission?.executiveSummary ||
        `Between October 12 and October 26, 2026, EkoSec Labs conducted an authorized technical security assessment targeting designated perimeter and internal server assets at Cedarline Services Ltd. The objective was to identify exploitable architectural vulnerabilities, validate candidate security alerts, and evaluate the risk of lateral movement following observed anomaly beacons.`,
      ``,
      `### Overall Risk Posture: **${submission?.overallRiskLevel || (validated.some(f => f.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH')}**`,
      ``,
      `| Metric | Count | Details |`,
      `| :--- | :--- | :--- |`,
      `| **In-Scope Assets Evaluated** | ${state.targets.filter(t => t.inScope).length} | app-portal-01, filesrv-01, api-gw-01, web-quote-01 |`,
      `| **Validated Vulnerabilities** | ${validated.length} | Confirmed True Positives with Proof-of-Concept |`,
      `| **Rejected False Positives** | ${rejected.length} | Verified benign or non-reproducible scanner alerts |`,
      `| **Unresolved Observations** | ${unresolved.length} | Items requiring further telemetry or testing |`,
      `| **Preserved Evidence Artifacts** | ${state.evidenceVault.length} | Hashed to SHA-256 for non-repudiation auditability |`,
      ``,
      `---`,
      ``,
      `## 2. Validated Technical Findings`,
      ``,
    ];

    if (validated.length === 0) {
      lines.push(`*No findings have been formally validated by the assessor yet.*`);
    } else {
      validated.forEach((f, idx) => {
        lines.push(`### ${idx + 1}. [${f.severity}] ${f.title} (${f.id})`);
        lines.push(`- **Target Asset**: \`${f.targetHostname}\` (${f.targetService})`);
        lines.push(`- **Classification**: \`${f.cveOrCwe}\` | **CVSS 3.1 Base Score**: \`${f.cvssScore}\` (\`${f.cvssVector}\`)`);
        lines.push(`- **Confidence**: \`${f.confidence}\` | **Status**: \`${f.status}\``);
        lines.push(`- **Technical Description**: ${f.technicalDescription}`);
        lines.push(`- **Business Impact**: ${f.businessImpact}`);
        lines.push(`- **Recommended Remediation**: ${f.remediationRecommendation}`);
        lines.push(``);
      });
    }

    lines.push(
      `---`,
      ``,
      `## 3. False-Positive Analysis & Eliminated Alerts`,
      ``
    );

    if (rejected.length === 0) {
      lines.push(`*No scanner alerts have been marked as rejected.*`);
    } else {
      rejected.forEach(f => {
        lines.push(`- **${f.id}: ${f.title}** on \`${f.targetHostname}\``);
        lines.push(`  - *Resolution*: REJECTED (False Positive / Benign Configuration)`);
        lines.push(`  - *Assessor Rationale*: ${f.falsePositiveReason || f.analystNotes || 'Verified benign via diagnostic probing.'}`);
        lines.push(``);
      });
    }

    lines.push(
      `---`,
      ``,
      `## 4. Prioritized Strategic Remediation Roadmap`,
      ``,
      `1. **Immediate (0–24 Hours)**: Configure Envoy API gateway on \`api-gw-01\` to sanitize and strip all client-supplied \`X-Internal-*\` headers to eliminate administrative privilege escalation.`,
      `2. **Near-Term (1–3 Days)**: Implement server-side user-to-object entitlement validation on the Aster Assistant \`/claims\` API on \`app-portal-01\` to remediate Broken Object-Level Authorization (IDOR).`,
      `3. **Medium-Term (1 Week)**: Enforce \`server signing = mandatory\` on \`filesrv-01\` Samba configuration and disable guest access on \`/shares/public_staging\` to mitigate NTLM relay risks.`,
      `4. **Maintenance**: Suppress legacy cipher alert in automated scanner rules for \`web-quote-01\` as the server enforces forward secrecy.`,
      ``,
      `---`,
      ``,
      `## 5. Scope Disclosures & Assessment Limitations`,
      ``,
      `- All tests strictly complied with the signed Rules of Engagement (RoE).`,
      `- Core Domain Controllers (\`dc-core-01\`) and Production SIEM infrastructure (\`mon-siem-01\`) were strictly excluded from intrusive testing to protect operational continuity.`,
      `- External threat nodes (\`c2-nexus-01\`) were not probed, in strict adherence to Nigerian cyber legislation.`,
      ``,
      `**Assessor Sign-off**: \`${state.roe.authorizedAssessorName}\``
    );

    return lines.join('\n');
  }
}
