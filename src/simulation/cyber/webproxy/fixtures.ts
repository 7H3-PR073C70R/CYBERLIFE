/**
 * Cyberlife — Milestone 14: Simulated Web Proxy Fixtures
 *
 * Seeded synthetic applications, HTTP request/response transactions,
 * and vulnerability tampering scenarios.
 *
 * Strictly fictional hosts, domains, and mock data. Zero external networking.
 */

import { ProxyAppTarget, ProxyTransaction, WebProxyScenario } from './types';

// ============================================================================
// 1. Fictional Simulated Web Applications
// ============================================================================

export const PROXY_APP_TARGETS: readonly ProxyAppTarget[] = [
  {
    id: 'app_cedarline_portal',
    name: 'Cedarline Intranet & Employee Portal',
    host: 'app-portal-01',
    port: 8080,
    protocol: 'http',
    fqdn: 'app-portal-01.cedarline.corp.local:8080',
    description:
      'Internal enterprise portal hosting employee directory, HR memos, and Aster search.',
    isPatched: false,
    endpoints: [
      '/api/v1/employees',
      '/api/v1/search',
      '/api/v1/auth/session',
      '/api/v1/reports/q4-budget',
      '/api/v1/health',
    ],
  },
  {
    id: 'app_health_services',
    name: 'Cedarline Health Claims Microservice',
    host: 'health-portal-01',
    port: 8443,
    protocol: 'https',
    fqdn: 'health-portal-01.cedarline.corp.local:8443',
    description:
      'Staging medical claims and health insurance records processing endpoint.',
    isPatched: false,
    endpoints: ['/api/v1/claims', '/api/v1/patient/records', '/api/v1/diagnostics'],
  },
  {
    id: 'app_identity_gateway',
    name: 'Cedarline SSO & IAM Gateway',
    host: 'auth-sso-01',
    port: 9000,
    protocol: 'https',
    fqdn: 'auth-sso-01.cedarline.corp.local:9000',
    description:
      'Central authentication gateway issuing synthetic JSON Web Tokens (JWT).',
    isPatched: false,
    endpoints: ['/oauth/token', '/oauth/verify', '/oauth/keys'],
  },
];

// ============================================================================
// 2. Initial Synthetic Transactions
// ============================================================================

export const INITIAL_PROXY_TRANSACTIONS: readonly ProxyTransaction[] = [
  {
    id: 'tx-001',
    appId: 'app_cedarline_portal',
    targetHost: 'app-portal-01.cedarline.corp.local',
    targetPort: 8080,
    originalRequest: {
      id: 'req-001',
      timestamp: '2026-10-20T10:15:02Z',
      method: 'GET',
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/employees?dept=FIN&id=EMP-104',
      path: '/api/v1/employees',
      queryParams: { dept: 'FIN', id: 'EMP-104' },
      headers: {
        Host: 'app-portal-01.cedarline.corp.local:8080',
        'User-Agent': 'EkoSec-WebBrowser/1.0',
        Accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaW9kdW4uYWRlIiwicm9sZSI6ImFjY291bnRhbnQifQ.synthetic_sig_001',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Express/4.18.2',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(
        {
          id: 'EMP-104',
          name: 'Biodun Adebayo',
          title: 'Junior Accounts Associate',
          department: 'Finance',
          email: 'biodun.ade@cedarline.corp.local',
          grade: 'L3',
          salaryNaira: '₦4,800,000 / year',
          manager: 'Blessing',
        },
        null,
        2
      ),
      responseTimeMs: 38,
      isSynthetic: true,
    },
    tags: ['hr', 'employees', 'idor_target'],
  },
  {
    id: 'tx-002',
    appId: 'app_cedarline_portal',
    targetHost: 'app-portal-01.cedarline.corp.local',
    targetPort: 8080,
    originalRequest: {
      id: 'req-002',
      timestamp: '2026-10-20T10:15:20Z',
      method: 'GET',
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/search?q=invoice',
      path: '/api/v1/search',
      queryParams: { q: 'invoice' },
      headers: {
        Host: 'app-portal-01.cedarline.corp.local:8080',
        'User-Agent': 'EkoSec-WebBrowser/1.0',
        Accept: 'application/json',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Database-Engine': 'PostgreSQL 14.2 (Simulated)',
      },
      body: JSON.stringify(
        {
          query: 'invoice',
          resultsCount: 2,
          records: [
            { docId: 'DOC-8812', title: 'October 2026 Broad Street Chiller Maintenance' },
            { docId: 'DOC-8819', title: 'Q3 Fibre Lease Payment Invoice' },
          ],
        },
        null,
        2
      ),
      responseTimeMs: 44,
      isSynthetic: true,
    },
    tags: ['search', 'sqli_target'],
  },
  {
    id: 'tx-003',
    appId: 'app_cedarline_portal',
    targetHost: 'app-portal-01.cedarline.corp.local',
    targetPort: 8080,
    originalRequest: {
      id: 'req-003',
      timestamp: '2026-10-20T10:15:45Z',
      method: 'GET',
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/reports/q4-budget',
      path: '/api/v1/reports/q4-budget',
      queryParams: {},
      headers: {
        Host: 'app-portal-01.cedarline.corp.local:8080',
        'User-Agent': 'EkoSec-WebBrowser/1.0',
        'X-User-Role': 'employee',
        'X-Client-Id': 'client-portal-web',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          error: 'ACCESS_DENIED',
          message: 'Viewing Q4 Executive Budget requires role: sec_admin or executive.',
          currentRole: 'employee',
        },
        null,
        2
      ),
      responseTimeMs: 22,
      isSynthetic: true,
    },
    tags: ['auth', 'headers', 'role_tamper_target'],
  },
  {
    id: 'tx-004',
    appId: 'app_cedarline_portal',
    targetHost: 'app-portal-01.cedarline.corp.local',
    targetPort: 8080,
    originalRequest: {
      id: 'req-004',
      timestamp: '2026-10-20T10:16:10Z',
      method: 'POST',
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/auth/session',
      path: '/api/v1/auth/session',
      queryParams: {},
      headers: {
        Host: 'app-portal-01.cedarline.corp.local:8080',
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsInJvbGUiOiJndWVzdCJ9.sig123',
      },
      body: JSON.stringify({ action: 'validate_token' }),
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authenticated: true,
        user: 'guest',
        role: 'guest',
        permissions: ['read:announcements'],
      }),
      responseTimeMs: 29,
      isSynthetic: true,
    },
    tags: ['auth', 'jwt', 'alg_none_target'],
  },
  {
    id: 'tx-005',
    appId: 'app_cedarline_portal',
    targetHost: 'app-portal-01.cedarline.corp.local',
    targetPort: 8080,
    originalRequest: {
      id: 'req-005',
      timestamp: '2026-10-20T10:16:30Z',
      method: 'GET',
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/health',
      path: '/api/v1/health',
      queryParams: {},
      headers: {
        Host: 'app-portal-01.cedarline.corp.local:8080',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Trace': '/opt/cedarline/secrets/master_hmac.key.backup',
        'X-Node-Cluster': 'marina-staging-node-03',
      },
      body: JSON.stringify({
        status: 'UP',
        uptimeSeconds: 84920,
        cluster: 'healthy',
      }),
      responseTimeMs: 15,
      isSynthetic: true,
    },
    tags: ['diagnostics', 'misleading_decoy'],
  },
  {
    id: 'tx-006',
    appId: 'app_health_services',
    targetHost: 'health-portal-01.cedarline.corp.local',
    targetPort: 8443,
    originalRequest: {
      id: 'req-006',
      timestamp: '2026-10-20T10:17:05Z',
      method: 'GET',
      url: 'https://health-portal-01.cedarline.corp.local:8443/api/v1/claims?claimantId=CLM-9901',
      path: '/api/v1/claims',
      queryParams: { claimantId: 'CLM-9901' },
      headers: {
        Host: 'health-portal-01.cedarline.corp.local:8443',
        'User-Agent': 'EkoSec-WebBrowser/1.0',
        Accept: 'application/json',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'Cedarline-Health-API',
      },
      body: JSON.stringify(
        {
          claimId: 'CLM-9901',
          provider: 'Broad Street Specialist Hospital, Lagos',
          diagnosis: 'Routine Medical Clearance',
          amountNaira: '₦75,000',
          status: 'SETTLED',
        },
        null,
        2
      ),
      responseTimeMs: 42,
      isSynthetic: true,
    },
    tags: ['healthcare', 'claims'],
  },
  {
    id: 'tx-007',
    appId: 'app_identity_gateway',
    targetHost: 'auth-sso-01.cedarline.corp.local',
    targetPort: 9000,
    originalRequest: {
      id: 'req-007',
      timestamp: '2026-10-20T10:17:30Z',
      method: 'GET',
      url: 'https://auth-sso-01.cedarline.corp.local:9000/oauth/keys',
      path: '/oauth/keys',
      queryParams: {},
      headers: {
        Host: 'auth-sso-01.cedarline.corp.local:9000',
        Accept: 'application/json',
      },
      isSynthetic: true,
    },
    originalResponse: {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          keys: [
            {
              kty: 'RSA',
              use: 'sig',
              kid: 'cedarline-key-2026-1',
              n: 'synthetic_rsa_modulus_string',
              e: 'AQAB',
            },
          ],
        },
        null,
        2
      ),
      responseTimeMs: 18,
      isSynthetic: true,
    },
    tags: ['oauth', 'jwks'],
  },
];

// ============================================================================
// 3. Web Proxy Pre-Configured Scenarios
// ============================================================================

export const WEB_PROXY_SCENARIOS: readonly WebProxyScenario[] = [
  {
    id: 'scen_proxy_idor',
    title: 'Broken Object Level Authorization (IDOR) on Employee Directory',
    type: 'IDOR_VULNERABILITY',
    targetAppId: 'app_cedarline_portal',
    initialTransactionId: 'tx-001',
    educationalObjective:
      'Learn how tampering object identifiers (id parameter) in REST APIs exposes unauthorized records when server-side access control is missing.',
    recommendedTamperField: 'queryParams.id',
    recommendedTamperValue: 'EMP-001',
    expectedVulnerability: 'CWE-639: Insecure Direct Object Reference (IDOR)',
    remediationAdvice:
      'Enforce session-backed ownership verification in employee controller before returning confidential salary fields.',
  },
  {
    id: 'scen_proxy_sqli',
    title: 'SQL Injection via Search Parameter Tampering',
    type: 'SQLI_SIMULATION',
    targetAppId: 'app_cedarline_portal',
    initialTransactionId: 'tx-002',
    educationalObjective:
      'Understand how unescaped user input concatenated into relational queries alters query logic and leaks database contents.',
    recommendedTamperField: 'queryParams.q',
    recommendedTamperValue: "' OR 1=1--",
    expectedVulnerability: 'CWE-89: SQL Injection (SQLi)',
    remediationAdvice:
      'Adopt parameterized prepared statements or an ORM; never concatenate query strings into SQL commands.',
  },
  {
    id: 'scen_proxy_role_tamper',
    title: 'Privilege Escalation via HTTP Request Header Tampering',
    type: 'SESSION_ROLE_TAMPERING',
    targetAppId: 'app_cedarline_portal',
    initialTransactionId: 'tx-003',
    educationalObjective:
      'Demonstrate the severe danger of relying on client-supplied headers (e.g. X-User-Role) for authorization decisions.',
    recommendedTamperField: 'headers.X-User-Role',
    recommendedTamperValue: 'sec_admin',
    expectedVulnerability: 'CWE-269: Improper Privilege Management',
    remediationAdvice:
      'Derive user roles strictly from cryptographically signed server sessions, never trusting raw HTTP headers.',
  },
  {
    id: 'scen_proxy_validation_rejection',
    title: 'Input Validation & Overflow Boundary Rejection',
    type: 'INPUT_VALIDATION_REJECTION',
    targetAppId: 'app_cedarline_portal',
    initialTransactionId: 'tx-001',
    educationalObjective:
      'Observe how well-designed input validation rejects malformed, oversized, or illegal characters with a clean 400 Bad Request.',
    recommendedTamperField: 'queryParams.id',
    recommendedTamperValue: 'EMP-<script>alert(1)</script>',
    expectedVulnerability: 'Proper Input Validation (Safe Behavior)',
    remediationAdvice:
      'Input validation is successfully rejecting illegal characters. Maintain strict schema filters on all API inputs.',
  },
  {
    id: 'scen_proxy_misleading_header',
    title: 'Information Disclosure via Misleading Decoy Header',
    type: 'MISLEADING_DECOY_RESPONSE',
    targetAppId: 'app_cedarline_portal',
    initialTransactionId: 'tx-005',
    educationalObjective:
      'Detect sensitive information leaks in response headers (e.g. debug file paths) that seem innocent at first glance.',
    recommendedTamperField: 'headers.X-Debug-Mode',
    recommendedTamperValue: 'verbose',
    expectedVulnerability: 'CWE-200: Exposure of Sensitive Information in Debug Headers',
    remediationAdvice:
      'Disable development debug headers (X-Debug-Trace) in production and staging builds.',
  },
];
