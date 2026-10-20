/**
 * Cyberlife — Milestone 14: Simulated Web Application Proxy Types
 *
 * Defines the authoritative contracts for the Burp Suite / OWASP ZAP-inspired
 * intercepting proxy simulation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model.
 * Zero external network access · Zero real HTTP sockets · Zero real cookies or private data.
 */

import { FictionalEvidenceItem, FictionalVulnerabilityFinding } from '../range/types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ProxyHttpRequest {
  readonly id: string;
  readonly timestamp: string;
  readonly method: HttpMethod;
  readonly url: string;
  readonly path: string;
  readonly queryParams: Record<string, string>;
  readonly headers: Record<string, string>;
  readonly body?: string;
  readonly isSynthetic: true;
}

export interface ProxyHttpResponse {
  readonly statusCode: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly body: string;
  readonly responseTimeMs: number;
  readonly isSynthetic: true;
}

export interface ProxyTransactionDiff {
  readonly statusChanged: boolean;
  readonly oldStatus: number;
  readonly newStatus: number;
  readonly bodyChanged: boolean;
  readonly lengthDeltaBytes: number;
  readonly headerChanges: readonly string[];
  readonly securityObservation: string;
}

export interface ProxyTransaction {
  readonly id: string;
  readonly appId: string;
  readonly targetHost: string;
  readonly targetPort: number;
  readonly originalRequest: ProxyHttpRequest;
  readonly originalResponse: ProxyHttpResponse;
  readonly modifiedRequest?: ProxyHttpRequest;
  readonly modifiedResponse?: ProxyHttpResponse;
  readonly diff?: ProxyTransactionDiff;
  readonly vulnerabilityFlagged?: string;
  readonly finding?: FictionalVulnerabilityFinding;
  readonly evidenceItem?: FictionalEvidenceItem;
  readonly tags: readonly string[];
}

export interface ProxyAppTarget {
  readonly id: string;
  readonly name: string;
  readonly host: string;
  readonly port: number;
  readonly protocol: 'http' | 'https';
  readonly fqdn: string;
  readonly description: string;
  readonly isPatched: boolean;
  readonly endpoints: readonly string[];
}

export type WebProxyScenarioType =
  | 'INPUT_VALIDATION_REJECTION'
  | 'IDOR_VULNERABILITY'
  | 'SQLI_SIMULATION'
  | 'SESSION_ROLE_TAMPERING'
  | 'MISLEADING_DECOY_RESPONSE'
  | 'PATCHED_ENDPOINT_REJECTION';

export interface WebProxyScenario {
  readonly id: string;
  readonly title: string;
  readonly type: WebProxyScenarioType;
  readonly targetAppId: string;
  readonly initialTransactionId: string;
  readonly educationalObjective: string;
  readonly recommendedTamperField: string;
  readonly recommendedTamperValue: string;
  readonly expectedVulnerability: string;
  readonly remediationAdvice: string;
}
