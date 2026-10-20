/**
 * Cyberlife — Milestone 14: Simulated Web Application Proxy Engine
 *
 * Implements the deterministic Burp Suite / OWASP ZAP-inspired intercepting
 * proxy simulation. Allows request inspection, parameter tampering, replay,
 * diff comparison, and vulnerability finding generation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory deterministic simulation.
 * Zero external HTTP sockets · Zero real web network requests.
 * Explicitly rejects any external host or non-fictional URL.
 */

import { FictionalEvidenceItem, FictionalVulnerabilityFinding } from '../range/types';
import {
  ProxyAppTarget,
  ProxyHttpRequest,
  ProxyHttpResponse,
  ProxyTransaction,
  ProxyTransactionDiff,
  WebProxyScenario,
} from './types';
import {
  INITIAL_PROXY_TRANSACTIONS,
  PROXY_APP_TARGETS,
  WEB_PROXY_SCENARIOS,
} from './fixtures';

export class WebProxyEngine {
  private targets: Map<string, ProxyAppTarget>;
  private transactions: Map<string, ProxyTransaction>;
  private scenarios: readonly WebProxyScenario[];
  private capturedFindings: Map<string, FictionalVulnerabilityFinding> = new Map();
  private evidenceVault: Map<string, FictionalEvidenceItem> = new Map();

  constructor(
    initialTargets: readonly ProxyAppTarget[] = PROXY_APP_TARGETS,
    initialTransactions: readonly ProxyTransaction[] = INITIAL_PROXY_TRANSACTIONS,
    initialScenarios: readonly WebProxyScenario[] = WEB_PROXY_SCENARIOS
  ) {
    this.targets = new Map(initialTargets.map(t => [t.id, { ...t }]));
    this.transactions = new Map(initialTransactions.map(tx => [tx.id, { ...tx }]));
    this.scenarios = [...initialScenarios];
  }

  // ==========================================================================
  // Target Applications & Scenarios
  // ==========================================================================

  public getTargets(): readonly ProxyAppTarget[] {
    return Array.from(this.targets.values());
  }

  public getTarget(appId: string): ProxyAppTarget | undefined {
    return this.targets.get(appId);
  }

  public getScenarios(): readonly WebProxyScenario[] {
    return this.scenarios;
  }

  public getScenario(scenarioId: string): WebProxyScenario | undefined {
    return this.scenarios.find(s => s.id === scenarioId);
  }

  public setAppPatched(appId: string, isPatched: boolean): void {
    const target = this.targets.get(appId);
    if (target) {
      this.targets.set(appId, { ...target, isPatched });
    }
  }

  // ==========================================================================
  // Proxy Transactions
  // ==========================================================================

  public getTransactions(appId?: string): readonly ProxyTransaction[] {
    const list = Array.from(this.transactions.values());
    if (!appId) return list;
    return list.filter(tx => tx.appId === appId);
  }

  public getTransaction(txId: string): ProxyTransaction | undefined {
    return this.transactions.get(txId);
  }

  // ==========================================================================
  // Request Replay & Tampering Execution (Engine-Enforced Boundary)
  // ==========================================================================

  public replayRequest(
    originalTransactionId: string,
    tamperedRequest: ProxyHttpRequest
  ): {
    readonly transaction: ProxyTransaction;
    readonly error?: string;
  } {
    const originalTx = this.transactions.get(originalTransactionId);
    if (!originalTx) {
      throw new Error(`Original transaction '${originalTransactionId}' not found.`);
    }

    // STRICT NON-NEGOTIABLE SAFETY BOUNDARY CHECK:
    // Reject any URL that does not match simulated fictional domains
    const isFictionalDomain =
      tamperedRequest.url.startsWith('/') ||
      tamperedRequest.url.includes('.cedarline.corp.local') ||
      tamperedRequest.url.includes('app-portal-01') ||
      tamperedRequest.url.includes('health-portal-01') ||
      tamperedRequest.url.includes('auth-sso-01') ||
      tamperedRequest.url.includes('10.0.4.');

    if (!isFictionalDomain) {
      throw new Error(
        `SECURITY VIOLATION: External destination '${tamperedRequest.url}' rejected. Web Proxy operates exclusively within simulated fictional domains.`
      );
    }

    const app = this.targets.get(originalTx.appId);
    const isPatched = app?.isPatched ?? false;

    // Simulate backend response to tampered request
    const response = this.simulateBackendProcessing(tamperedRequest, isPatched);

    // Compute diff comparison between original and modified responses
    const diff = this.computeDiff(originalTx.originalResponse, response);

    // Evaluate if this tamper triggered a verifiable security vulnerability
    const vulnCheck = this.evaluateVulnerability(
      originalTx.appId,
      tamperedRequest,
      response,
      isPatched
    );

    const updatedTx: ProxyTransaction = {
      ...originalTx,
      modifiedRequest: tamperedRequest,
      modifiedResponse: response,
      diff,
      vulnerabilityFlagged: vulnCheck?.vulnerabilityTitle,
      finding: vulnCheck?.finding,
      evidenceItem: vulnCheck?.evidence,
    };

    if (vulnCheck?.finding) {
      this.capturedFindings.set(vulnCheck.finding.id, vulnCheck.finding);
    }
    if (vulnCheck?.evidence) {
      this.evidenceVault.set(vulnCheck.evidence.id, vulnCheck.evidence);
    }

    this.transactions.set(originalTransactionId, updatedTx);

    return { transaction: updatedTx };
  }

  // ==========================================================================
  // Simulated Backend Logic & Vulnerability Evaluation
  // ==========================================================================

  private simulateBackendProcessing(
    req: ProxyHttpRequest,
    isPatched: boolean
  ): ProxyHttpResponse {
    const path = req.path;
    const query = req.queryParams;
    const headers = req.headers;

    // 1. Input Validation Check (Rejection Case)
    for (const [key, value] of Object.entries(query)) {
      if (value.includes('<script>') || value.includes('javascript:') || value.length > 256) {
        return {
          statusCode: 400,
          statusText: 'Bad Request',
          headers: {
            'Content-Type': 'application/json',
            'X-Validation-Failure': `Parameter '${key}' contains disallowed character pattern`,
          },
          body: JSON.stringify(
            {
              error: 'BAD_REQUEST',
              code: 'ERR_MALFORMED_INPUT',
              message: `Validation rejection: Query parameter '${key}' contains illegal payload pattern.`,
              inputRejected: value.slice(0, 32),
            },
            null,
            2
          ),
          responseTimeMs: 12,
          isSynthetic: true,
        };
      }
    }

    // 2. IDOR on /api/v1/employees
    if (path === '/api/v1/employees') {
      const idParam = query.id;
      if (idParam === 'EMP-001') {
        if (isPatched) {
          return {
            statusCode: 403,
            statusText: 'Forbidden',
            headers: {
              'Content-Type': 'application/json',
              'X-Security-Policy': 'Strict-Object-Ownership-Enforced',
            },
            body: JSON.stringify(
              {
                error: 'FORBIDDEN',
                code: 'ERR_OBJECT_AUTHZ_FAILED',
                message:
                  'Access Denied: Authenticated session (biodun.ade) is not authorized to access executive record EMP-001.',
              },
              null,
              2
            ),
            responseTimeMs: 25,
            isSynthetic: true,
          };
        }

        // Vulnerable IDOR response
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Sensitive-Data': 'Executive-Confidential',
          },
          body: JSON.stringify(
            {
              id: 'EMP-001',
              name: 'Amina Okonjo',
              title: 'Chief Information Security Officer (CISO)',
              department: 'Executive InfoSec',
              email: 'amina.okonjo@cedarline.corp.local',
              grade: 'E1',
              salaryNaira: '₦28,500,000 / year',
              clearanceLevel: 'RESTRICTED_TIER_2',
              privatePhone: '+234 803 555 0199',
              manager: 'Femi Martins (VP)',
            },
            null,
            2
          ),
          responseTimeMs: 34,
          isSynthetic: true,
        };
      }
    }

    // 3. SQLi on /api/v1/search
    if (path === '/api/v1/search') {
      const searchParam = query.q ?? '';
      if (
        searchParam.includes("' OR 1=1") ||
        searchParam.includes("' OR '1'='1") ||
        searchParam.includes("UNION SELECT")
      ) {
        if (isPatched) {
          return {
            statusCode: 400,
            statusText: 'Bad Request',
            headers: {
              'Content-Type': 'application/json',
              'X-WAF-Protection': 'ParameterizedQueryEnforced',
            },
            body: JSON.stringify(
              {
                error: 'INVALID_QUERY',
                message: 'Query parameter contains invalid SQL escape characters.',
              },
              null,
              2
            ),
            responseTimeMs: 14,
            isSynthetic: true,
          };
        }

        // Vulnerable SQLi response leaking mock database users
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Database-Warning': 'Unparameterized query returned multiple result sets',
          },
          body: JSON.stringify(
            {
              query: searchParam,
              resultsCount: 4,
              records: [
                {
                  id: 1,
                  username: 'admin',
                  password_hash: '$2b$12$e8yQ0Wj8J3Q.synthetic_admin_hash_cedarline',
                  role: 'sec_admin',
                },
                {
                  id: 2,
                  username: 'svc-aster',
                  password_hash: '$2b$12$u7iO9Pl2K1M.synthetic_svc_hash_cedarline',
                  role: 'corporate-admin',
                },
                {
                  id: 3,
                  username: 'biodun.ade',
                  password_hash: '$2b$12$a1b2c3d4e5f.synthetic_user_hash_cedarline',
                  role: 'accountant',
                },
              ],
            },
            null,
            2
          ),
          responseTimeMs: 58,
          isSynthetic: true,
        };
      }
    }

    // 4. Header Role Tampering on /api/v1/reports/q4-budget
    if (path === '/api/v1/reports/q4-budget') {
      const roleHeader = headers['X-User-Role'] ?? headers['x-user-role'];
      if (roleHeader === 'sec_admin' || roleHeader === 'executive') {
        if (isPatched) {
          return {
            statusCode: 403,
            statusText: 'Forbidden',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Policy': 'Client-Role-Headers-Ignored',
            },
            body: JSON.stringify(
              {
                error: 'FORBIDDEN',
                message:
                  'Untrusted client role header ignored. Role must be cryptographically verified in session token.',
              },
              null,
              2
            ),
            responseTimeMs: 18,
            isSynthetic: true,
          };
        }

        // Vulnerable response: Trusted client role header
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Level': 'SEC_ADMIN_AUTHORIZED',
          },
          body: JSON.stringify(
            {
              reportId: 'REP-2026-Q4-BUDGET',
              title: 'Cedarline Corporate Information Security Q4 Budget Allocation',
              status: 'APPROVED_EXECUTIVE',
              totalBudgetNaira: '₦450,000,000',
              allocations: [
                { category: 'SOC Operations & MDR', amountNaira: '₦180,000,000' },
                { category: 'Air-Gapped Datacenter Upgrades', amountNaira: '₦150,000,000' },
                { category: 'Penetration Testing & Red Team Retainer', amountNaira: '₦120,000,000' },
              ],
            },
            null,
            2
          ),
          responseTimeMs: 31,
          isSynthetic: true,
        };
      }
    }

    // 5. JWT Algorithm None Bypass on /api/v1/auth/session
    if (path === '/api/v1/auth/session') {
      const authHeader = headers['Authorization'] ?? headers['authorization'] ?? '';
      if (authHeader.includes('eyJhbGciOiJub25l') || authHeader.includes('"alg":"none"')) {
        if (isPatched) {
          return {
            statusCode: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              {
                error: 'INVALID_TOKEN',
                message: 'JWT verification failed: Algorithm "none" is disallowed by security policy.',
              },
              null,
              2
            ),
            responseTimeMs: 16,
            isSynthetic: true,
          };
        }

        return {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-JWT-Status': 'Unsigned Token Accepted',
          },
          body: JSON.stringify(
            {
              authenticated: true,
              user: 'admin',
              role: 'sec_admin',
              permissions: ['*'],
              elevationNote: 'Algorithm None bypass allowed administrative session creation.',
            },
            null,
            2
          ),
          responseTimeMs: 27,
          isSynthetic: true,
        };
      }
    }

    // 6. Misleading Decoy / Diagnostic Leak on /api/v1/health
    if (path === '/api/v1/health') {
      const debugHeader = headers['X-Debug-Mode'] ?? headers['x-debug-mode'];
      if (debugHeader === 'verbose') {
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Trace': '/opt/cedarline/secrets/master_hmac.key.backup',
            'X-Internal-Secret-Leak': 'HMAC_KEY_EXPOSED',
          },
          body: JSON.stringify(
            {
              status: 'UP',
              uptimeSeconds: 84950,
              diagnostics: {
                secretsPath: '/opt/cedarline/secrets/',
                dbConnection: 'postgres://aster_user:aster_pass@10.0.4.50:5432/cedarline_db',
                env: 'staging-production-mirror',
              },
            },
            null,
            2
          ),
          responseTimeMs: 22,
          isSynthetic: true,
        };
      }
    }

    // Default generic response
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Request processed by simulated backend.' }),
      responseTimeMs: 20,
      isSynthetic: true,
    };
  }

  // ==========================================================================
  // Diff Calculation & Vulnerability Flagging
  // ==========================================================================

  private computeDiff(
    orig: ProxyHttpResponse,
    mod: ProxyHttpResponse
  ): ProxyTransactionDiff {
    const statusChanged = orig.statusCode !== mod.statusCode;
    const bodyChanged = orig.body !== mod.body;
    const lengthDeltaBytes = mod.body.length - orig.body.length;

    const headerChanges: string[] = [];
    for (const [k, v] of Object.entries(mod.headers)) {
      if (orig.headers[k] !== v) {
        headerChanges.push(`+ ${k}: ${v}`);
      }
    }

    let securityObservation = 'No significant response discrepancy observed.';
    if (orig.statusCode === 200 && mod.statusCode === 200 && lengthDeltaBytes > 100) {
      securityObservation =
        'Significant response payload expansion (+bytes) indicates unauthorized data extraction.';
    } else if (orig.statusCode === 403 && mod.statusCode === 200) {
      securityObservation =
        'Privilege escalation successful: Request transitioned from 403 Forbidden to 200 OK.';
    } else if (orig.statusCode === 200 && mod.statusCode === 403) {
      securityObservation =
        'Access control validated: Target server correctly rejected unauthorized resource access.';
    } else if (mod.statusCode === 400) {
      securityObservation =
        'Defensive input validation triggered: Server cleanly rejected malformed payload.';
    }

    return {
      statusChanged,
      oldStatus: orig.statusCode,
      newStatus: mod.statusCode,
      bodyChanged,
      lengthDeltaBytes,
      headerChanges,
      securityObservation,
    };
  }

  private evaluateVulnerability(
    _appId: string,
    req: ProxyHttpRequest,
    res: ProxyHttpResponse,
    isPatched: boolean
  ): {
    readonly vulnerabilityTitle: string;
    readonly finding: FictionalVulnerabilityFinding;
    readonly evidence: FictionalEvidenceItem;
  } | null {
    if (isPatched) return null;

    const timestamp = new Date().toISOString();

    // Check IDOR
    if (req.path === '/api/v1/employees' && req.queryParams.id === 'EMP-001' && res.statusCode === 200) {
      const findingId = 'VULN-PROXY-IDOR-01';
      const evidenceId = 'EVD-PROXY-IDOR-001';

      const finding: FictionalVulnerabilityFinding = {
        id: findingId,
        title: 'Broken Object Level Authorization (IDOR) on Employee Directory API',
        targetHost: 'app-portal-01',
        targetService: 'HTTP Portal (8080)',
        cve: 'CWE-639',
        severity: 'HIGH',
        attackVector: 'insecure_direct_object_ref',
        evidenceId,
        rootCause:
          'REST endpoint /api/v1/employees accepts unauthenticated id parameter without session ownership verification, allowing horizontal privilege escalation.',
        remediationAdvice:
          'Enforce session-backed ownership verification in employee controller before returning confidential salary fields.',
        discoveredAt: timestamp,
      };

      const evidence: FictionalEvidenceItem = {
        id: evidenceId,
        title: 'HTTP Tamper Evidence: IDOR Executive Salary Leak',
        source: 'WebProxy // /api/v1/employees?id=EMP-001',
        collectionTime: timestamp,
        evidenceType: 'vulnerability_finding',
        integrityStatus: 'VERIFIED',
        hashSha256: `3b4c5d${Date.now()}8899aabbccddeeff00112233445566778899aabb`,
        description:
          'Proof of concept showing tampered request parameter id=EMP-001 returning CISO confidential salary data.',
        chainOfCustody: [
          {
            time: timestamp,
            handler: 'Web Proxy Interceptor',
            action: 'TRANSACTION_REPLAY_CAPTURE',
            signature: 'SIG-PROXY-TAMPER-VERIFIED',
          },
        ],
        requiredTier: 1,
        artifactSnippet: [
          `REQUEST: GET /api/v1/employees?dept=FIN&id=EMP-001 HTTP/1.1`,
          `RESPONSE: 200 OK`,
          `{"id":"EMP-001","name":"Amina Okonjo","salaryNaira":"₦28,500,000 / year"}`,
        ],
      };

      return {
        vulnerabilityTitle: 'Broken Object Level Authorization (IDOR)',
        finding,
        evidence,
      };
    }

    // Check SQLi
    if (req.path === '/api/v1/search' && req.queryParams.q?.includes("' OR 1=1") && res.statusCode === 200) {
      const findingId = 'VULN-PROXY-SQLI-01';
      const evidenceId = 'EVD-PROXY-SQLI-001';

      const finding: FictionalVulnerabilityFinding = {
        id: findingId,
        title: 'SQL Injection in Search Query Parameter',
        targetHost: 'app-portal-01',
        targetService: 'HTTP Portal (8080)',
        cve: 'CWE-89',
        severity: 'CRITICAL',
        attackVector: 'input_injection',
        evidenceId,
        rootCause:
          'Unsanitized user search parameter concatenated directly into SQL statement, allowing boolean tautology extraction of user table.',
        remediationAdvice:
          'Adopt parameterized prepared statements or an ORM; never concatenate query strings into SQL commands.',
        discoveredAt: timestamp,
      };

      const evidence: FictionalEvidenceItem = {
        id: evidenceId,
        title: 'HTTP Tamper Evidence: SQL Injection Database Leak',
        source: 'WebProxy // /api/v1/search',
        collectionTime: timestamp,
        evidenceType: 'vulnerability_finding',
        integrityStatus: 'VERIFIED',
        hashSha256: `1a2b3c${Date.now()}445566778899aabbccddeeff0011223344556677`,
        description:
          'Proof of concept confirming SQL injection via query parameter q=\' OR 1=1-- dumping password hashes.',
        chainOfCustody: [
          {
            time: timestamp,
            handler: 'Web Proxy Interceptor',
            action: 'TRANSACTION_REPLAY_CAPTURE',
            signature: 'SIG-PROXY-TAMPER-VERIFIED',
          },
        ],
        requiredTier: 1,
        artifactSnippet: [
          `REQUEST: GET /api/v1/search?q=' OR 1=1-- HTTP/1.1`,
          `RESPONSE: 200 OK`,
          `{"username":"admin","password_hash":"$2b$12$...","role":"sec_admin"}`,
        ],
      };

      return {
        vulnerabilityTitle: 'SQL Injection in Search Endpoint',
        finding,
        evidence,
      };
    }

    // Check Header Role Tampering
    if (
      req.path === '/api/v1/reports/q4-budget' &&
      req.headers['X-User-Role'] === 'sec_admin' &&
      res.statusCode === 200
    ) {
      const findingId = 'VULN-PROXY-ROLE-TAMPER-01';
      const evidenceId = 'EVD-PROXY-ROLE-001';

      const finding: FictionalVulnerabilityFinding = {
        id: findingId,
        title: 'Privilege Escalation via Client-Controlled X-User-Role Header',
        targetHost: 'app-portal-01',
        targetService: 'HTTP Portal (8080)',
        cve: 'CWE-269',
        severity: 'HIGH',
        attackVector: 'auth_bypass',
        evidenceId,
        rootCause:
          'Endpoint authorization relies on untrusted client-supplied HTTP request header X-User-Role instead of server-verified session state.',
        remediationAdvice:
          'Derive user roles strictly from cryptographically signed server sessions, never trusting raw HTTP headers.',
        discoveredAt: timestamp,
      };

      const evidence: FictionalEvidenceItem = {
        id: evidenceId,
        title: 'HTTP Tamper Evidence: Header Privilege Escalation',
        source: 'WebProxy // /api/v1/reports/q4-budget',
        collectionTime: timestamp,
        evidenceType: 'vulnerability_finding',
        integrityStatus: 'VERIFIED',
        hashSha256: `9f8e7d${Date.now()}112233445566778899aabbccddeeff00112233`,
        description:
          'Proof of concept showing header tampering X-User-Role: sec_admin bypassing 403 Forbidden on executive budget report.',
        chainOfCustody: [
          {
            time: timestamp,
            handler: 'Web Proxy Interceptor',
            action: 'TRANSACTION_REPLAY_CAPTURE',
            signature: 'SIG-PROXY-TAMPER-VERIFIED',
          },
        ],
        requiredTier: 1,
        artifactSnippet: [
          `REQUEST: GET /api/v1/reports/q4-budget HTTP/1.1`,
          `X-User-Role: sec_admin`,
          `RESPONSE: 200 OK // Total Budget: ₦450,000,000`,
        ],
      };

      return {
        vulnerabilityTitle: 'Privilege Escalation via Header Tampering',
        finding,
        evidence,
      };
    }

    // Check Diagnostic Header Disclosure
    if (req.path === '/api/v1/health' && res.headers['X-Internal-Secret-Leak']) {
      const findingId = 'VULN-PROXY-INFO-DISCLOSE-01';
      const evidenceId = 'EVD-PROXY-INFO-001';

      const finding: FictionalVulnerabilityFinding = {
        id: findingId,
        title: 'Information Disclosure in Verbose Diagnostic Health Headers',
        targetHost: 'app-portal-01',
        targetService: 'HTTP Portal (8080)',
        cve: 'CWE-200',
        severity: 'MEDIUM',
        attackVector: 'app_security',
        evidenceId,
        rootCause:
          'Verbose diagnostic mode exposes backend filesystem secret keys and database credentials in HTTP response headers.',
        remediationAdvice:
          'Disable development debug headers (X-Debug-Trace) in production and staging builds.',
        discoveredAt: timestamp,
      };

      const evidence: FictionalEvidenceItem = {
        id: evidenceId,
        title: 'HTTP Evidence: Internal Secret Path Exposure',
        source: 'WebProxy // /api/v1/health',
        collectionTime: timestamp,
        evidenceType: 'vulnerability_finding',
        integrityStatus: 'VERIFIED',
        hashSha256: `5a6b7c${Date.now()}2233445566778899aabbccddeeff0011223344`,
        description:
          'Header inspection revealed disclosure of /opt/cedarline/secrets/master_hmac.key.backup.',
        chainOfCustody: [
          {
            time: timestamp,
            handler: 'Web Proxy Interceptor',
            action: 'TRANSACTION_REPLAY_CAPTURE',
            signature: 'SIG-PROXY-TAMPER-VERIFIED',
          },
        ],
        requiredTier: 1,
        artifactSnippet: [
          `RESPONSE HEADERS: X-Debug-Trace: /opt/cedarline/secrets/master_hmac.key.backup`,
        ],
      };

      return {
        vulnerabilityTitle: 'Information Disclosure in Health Headers',
        finding,
        evidence,
      };
    }

    return null;
  }

  // ==========================================================================
  // Findings & Evidence Accessors
  // ==========================================================================

  public getCapturedFindings(): readonly FictionalVulnerabilityFinding[] {
    return Array.from(this.capturedFindings.values());
  }

  public getEvidenceVault(): readonly FictionalEvidenceItem[] {
    return Array.from(this.evidenceVault.values());
  }
}
