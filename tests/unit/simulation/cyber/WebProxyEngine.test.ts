/**
 * Cyberlife — Milestone 14: Web Proxy Engine Unit Tests
 *
 * Verifies Burp/ZAP-style synthetic HTTP request inspection, parameter & header tampering,
 * side-by-side diff comparison, vulnerability capture, and strict security isolation invariants.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  WebProxyEngine,
  PROXY_APP_TARGETS,
  WEB_PROXY_SCENARIOS,
} from '@/simulation/cyber/webproxy';
import { ProxyHttpRequest } from '@/simulation/cyber/webproxy/types';

describe('WebProxyEngine', () => {
  let engine: WebProxyEngine;

  beforeEach(() => {
    engine = new WebProxyEngine();
  });

  it('initializes with default fictional targets, scenarios, and initial transactions', () => {
    expect(engine.getTargets().length).toBe(PROXY_APP_TARGETS.length);
    expect(engine.getScenarios().length).toBe(WEB_PROXY_SCENARIOS.length);
    expect(engine.getTransactions().length).toBeGreaterThanOrEqual(5);
  });

  it('retrieves transactions filtered by application ID', () => {
    const portalTxs = engine.getTransactions('app_cedarline_portal');
    expect(portalTxs.length).toBeGreaterThanOrEqual(3);
    expect(portalTxs.every(tx => tx.appId === 'app_cedarline_portal')).toBe(true);

    const healthTxs = engine.getTransactions('app_health_services');
    expect(healthTxs.length).toBeGreaterThanOrEqual(1);
    expect(healthTxs.every(tx => tx.appId === 'app_health_services')).toBe(true);
  });

  it('replays request with IDOR parameter tampering and detects unauthorized data leak', () => {
    const originalTx = engine.getTransaction('tx-001')!;
    expect(originalTx.originalRequest.queryParams.id).toBe('EMP-104');

    const tamperedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-idor-test',
      timestamp: new Date().toISOString(),
      url: 'http://app-portal-01.cedarline.corp.local:8080/api/v1/employees?dept=EXEC&id=EMP-001',
      queryParams: { dept: 'EXEC', id: 'EMP-001' },
    };

    const result = engine.replayRequest('tx-001', tamperedReq);
    expect(result.transaction.modifiedResponse).toBeDefined();
    expect(result.transaction.modifiedResponse?.statusCode).toBe(200);

    const responseJson = JSON.parse(result.transaction.modifiedResponse?.body ?? '{}');
    expect(responseJson.id).toBe('EMP-001');
    expect(responseJson.name).toContain('Amina Okonjo');

    expect(result.transaction.finding).toBeDefined();
    expect(result.transaction.finding?.cve).toBe('CWE-639');
    expect(result.transaction.vulnerabilityFlagged).toContain('Broken Object Level Authorization (IDOR)');
  });

  it('replays request with SQL injection tampering and observes backend authentication bypass', () => {
    const originalTx = engine.getTransaction('tx-002')!;
    const tamperedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-sqli-test',
      timestamp: new Date().toISOString(),
      url: "/api/v1/search?q=' OR 1=1--",
      queryParams: { q: "' OR 1=1--" },
    };

    const result = engine.replayRequest('tx-002', tamperedReq);
    expect(result.transaction.modifiedResponse?.statusCode).toBe(200);

    const responseJson = JSON.parse(result.transaction.modifiedResponse?.body ?? '{}');
    expect(responseJson.resultsCount).toBeGreaterThan(1);
    expect(result.transaction.finding?.cve).toBe('CWE-89');
  });

  it('replays request with role header tampering and captures administrative escalation', () => {
    const originalTx = engine.getTransaction('tx-003')!;
    const tamperedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-role-test',
      timestamp: new Date().toISOString(),
      url: '/api/v1/reports/q4-budget',
      headers: {
        ...originalTx.originalRequest.headers,
        'X-User-Role': 'sec_admin',
      },
    };

    const result = engine.replayRequest('tx-003', tamperedReq);
    expect(result.transaction.modifiedResponse?.statusCode).toBe(200);

    const responseJson = JSON.parse(result.transaction.modifiedResponse?.body ?? '{}');
    expect(responseJson.title).toContain('Budget Allocation');
    expect(result.transaction.vulnerabilityFlagged).toContain('Privilege Escalation via Header Tampering');
  });

  it('properly validates input and rejects malformed characters with 400 Bad Request', () => {
    const originalTx = engine.getTransaction('tx-001')!;
    const malformedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-bad-input',
      timestamp: new Date().toISOString(),
      url: '/api/v1/employees?dept=FIN&id=<script>alert(1)</script>',
      queryParams: { dept: 'FIN', id: '<script>alert(1)</script>' },
    };

    const result = engine.replayRequest('tx-001', malformedReq);
    expect(result.transaction.modifiedResponse?.statusCode).toBe(400);
    expect(result.transaction.modifiedResponse?.body).toContain('ERR_MALFORMED_INPUT');
  });

  it('calculates side-by-side diff comparing original and modified responses', () => {
    const originalTx = engine.getTransaction('tx-001')!;
    const tamperedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-diff-test',
      timestamp: new Date().toISOString(),
      url: '/api/v1/employees?dept=FIN&id=EMP-001',
      queryParams: { dept: 'FIN', id: 'EMP-001' },
    };

    const result = engine.replayRequest('tx-001', tamperedReq);
    expect(result.transaction.diff).toBeDefined();
    expect(result.transaction.diff?.bodyChanged).toBe(true);
    expect(result.transaction.diff?.oldStatus).toBe(200);
    expect(result.transaction.diff?.newStatus).toBe(200);
  });

  it('blocks exploit replay when application defense patch is toggled active', () => {
    engine.setAppPatched('app_cedarline_portal', true);

    const originalTx = engine.getTransaction('tx-001')!;
    const tamperedReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-patched-test',
      timestamp: new Date().toISOString(),
      url: '/api/v1/employees?dept=FIN&id=EMP-001',
      queryParams: { dept: 'FIN', id: 'EMP-001' },
    };

    const result = engine.replayRequest('tx-001', tamperedReq);
    expect(result.transaction.modifiedResponse?.statusCode).toBe(403);
    expect(result.transaction.modifiedResponse?.body).toContain('ERR_OBJECT_AUTHZ_FAILED');
    expect(result.transaction.finding).toBeUndefined();
  });

  it('strictly rejects external non-fictional URL destinations as a security boundary invariant', () => {
    const originalTx = engine.getTransaction('tx-001')!;

    // Non-fictional external real domain
    const dangerousReq: ProxyHttpRequest = {
      ...originalTx.originalRequest,
      id: 'req-external-bad',
      url: 'https://evil.external-attacker.com/steal',
    };

    expect(() => {
      engine.replayRequest('tx-001', dangerousReq);
    }).toThrow(/SECURITY VIOLATION.*External destination/);
  });
});
