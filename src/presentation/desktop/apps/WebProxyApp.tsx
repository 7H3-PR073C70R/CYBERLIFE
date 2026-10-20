/**
 * Cyberlife — Milestone 14: Web Application Security Proxy Desktop Application
 *
 * Burp Suite / OWASP ZAP-inspired intercepting HTTP proxy console.
 * Allows browsing transaction history, modifying request parameters/headers,
 * replaying requests, side-by-side diff comparison, and vulnerability capture.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model. Zero external internet connectivity.
 */

import React, { useState, useMemo } from 'react';
import { WebProxyEngine } from '../../../simulation/cyber/webproxy';
import { ProxyHttpRequest } from '../../../simulation/cyber/webproxy/types';

export const WebProxyApp: React.FC = () => {
  const [engine] = useState(() => new WebProxyEngine());
  const [selectedAppId, setSelectedAppId] = useState<string>('app_cedarline_portal');
  const [selectedTxId, setSelectedTxId] = useState<string>('tx-001');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'tamper' | 'diff' | 'original' | 'scenarios'>('tamper');
  const [tamperQueryParamKey, setTamperQueryParamKey] = useState<string>('id');
  const [tamperQueryParamVal, setTamperQueryParamVal] = useState<string>('EMP-001');
  const [tamperHeaderKey, setTamperHeaderKey] = useState<string>('X-User-Role');
  const [tamperHeaderVal, setTamperHeaderVal] = useState<string>('sec_admin');
  const [isPatchedState, setIsPatchedState] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const targets = useMemo(() => engine.getTargets(), [engine]);
  const transactions = useMemo(() => engine.getTransactions(selectedAppId), [engine, selectedAppId]);
  const scenarios = useMemo(() => engine.getScenarios(), [engine]);
  const activeTx = useMemo(
    () => engine.getTransaction(selectedTxId) ?? transactions[0],
    [engine, selectedTxId, transactions]
  );

  const handleTogglePatch = (patched: boolean) => {
    setIsPatchedState(patched);
    engine.setAppPatched(selectedAppId, patched);
    setToastMessage(
      patched
        ? 'Application defense patched: Server-side validation and authorization controls now active.'
        : 'Application set to vulnerable: Standard staging configuration restored.'
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReplay = (customTamper?: { queryKey?: string; queryVal?: string; headerKey?: string; headerVal?: string }) => {
    if (!activeTx) return;

    const queryParams = {
      ...activeTx.originalRequest.queryParams,
      ...(customTamper?.queryKey ? { [customTamper.queryKey]: customTamper.queryVal ?? '' } : { [tamperQueryParamKey]: tamperQueryParamVal }),
    };
    const qParams = new URLSearchParams(queryParams).toString();
    const newUrl = qParams ? `${activeTx.originalRequest.path}?${qParams}` : activeTx.originalRequest.path;

    const modifiedReq: ProxyHttpRequest = {
      ...activeTx.originalRequest,
      id: `req-replay-${Date.now()}`,
      timestamp: new Date().toISOString(),
      url: newUrl,
      queryParams,
      headers: {
        ...activeTx.originalRequest.headers,
        ...(customTamper?.headerKey ? { [customTamper.headerKey]: customTamper.headerVal ?? '' } : { [tamperHeaderKey]: tamperHeaderVal }),
      },
    };

    try {
      const res = engine.replayRequest(activeTx.id, modifiedReq);
      setSelectedTxId(res.transaction.id);
      setActiveInspectorTab('diff');
      setToastMessage(`Replay complete! Server responded: ${res.transaction.modifiedResponse?.statusCode} ${res.transaction.modifiedResponse?.statusText}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setToastMessage(`Error: ${msg}`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (!activeTx) return;
    if (presetName === 'IDOR') {
      setTamperQueryParamKey('id');
      setTamperQueryParamVal('EMP-001');
      handleReplay({ queryKey: 'id', queryVal: 'EMP-001' });
    } else if (presetName === 'SQLI') {
      setTamperQueryParamKey('q');
      setTamperQueryParamVal("' OR 1=1--");
      handleReplay({ queryKey: 'q', queryVal: "' OR 1=1--" });
    } else if (presetName === 'ROLE') {
      setTamperHeaderKey('X-User-Role');
      setTamperHeaderVal('sec_admin');
      handleReplay({ headerKey: 'X-User-Role', headerVal: 'sec_admin' });
    } else if (presetName === 'VALIDATION_REJECT') {
      setTamperQueryParamKey('id');
      setTamperQueryParamVal('EMP-<script>alert(1)</script>');
      handleReplay({ queryKey: 'id', queryVal: 'EMP-<script>alert(1)</script>' });
    } else if (presetName === 'DEBUG_LEAK') {
      setTamperHeaderKey('X-Debug-Mode');
      setTamperHeaderVal('verbose');
      handleReplay({ headerKey: 'X-Debug-Mode', headerVal: 'verbose' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0c1017',
        color: '#c9d1d9',
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: '13px',
      }}
    >
      {/* Top Bar: Target App and Defensive Patch Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🪤</span>
          <div>
            <div style={{ fontWeight: 600, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Web Proxy Interceptor // Burp Suite Simulator</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#388bfd33',
                  color: '#58a6ff',
                  border: '1px solid #388bfd66',
                  fontWeight: 600,
                }}
              >
                Zero-External Sandbox
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              Target: {targets.find(t => t.id === selectedAppId)?.fqdn}
            </div>
          </div>
        </div>

        {/* Controls: Target Selector & Patch Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedAppId}
            onChange={e => setSelectedAppId(e.target.value)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#21262d',
              border: '1px solid #30363d',
              borderRadius: '4px',
              color: '#f0f6fc',
              fontSize: '12px',
            }}
          >
            {targets.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.host}:{t.port})
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <span style={{ color: '#8b949e' }}>Defense Mode:</span>
            <button
              onClick={() => handleTogglePatch(false)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #30363d',
                backgroundColor: !isPatchedState ? '#da3633' : '#21262d',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: !isPatchedState ? 600 : 400,
              }}
            >
              Vulnerable
            </button>
            <button
              onClick={() => handleTogglePatch(true)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #30363d',
                backgroundColor: isPatchedState ? '#238636' : '#21262d',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: isPatchedState ? 600 : 400,
              }}
            >
              Patched
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: toastMessage.startsWith('Error') ? '#3d1618' : '#1b4d3e',
            borderBottom: '1px solid #30363d',
            color: '#f0f6fc',
            fontSize: '12px',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Main Split View: Left Transaction History, Right Inspector/Tamper */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Left Pane: Transaction History */}
        <div
          style={{
            borderRight: '1px solid #30363d',
            backgroundColor: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #30363d',
              backgroundColor: '#161b22',
              fontWeight: 600,
              fontSize: '12px',
              color: '#8b949e',
            }}
          >
            HTTP Transactions ({transactions.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(tx => {
              const isSelected = tx.id === activeTx?.id;
              const hasDiff = Boolean(tx.modifiedResponse);
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.id)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #21262d',
                    backgroundColor: isSelected ? '#1f242c' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '11px',
                          color: tx.originalRequest.method === 'GET' ? '#58a6ff' : '#d29922',
                        }}
                      >
                        {tx.originalRequest.method}
                      </span>
                      <span style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '12px' }}>
                        {tx.originalRequest.path}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: tx.originalResponse.statusCode === 200 ? '#238636' : '#da3633',
                        color: '#ffffff',
                      }}
                    >
                      {tx.originalResponse.statusCode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e' }}>
                    <span>{tx.id}</span>
                    {hasDiff && (
                      <span style={{ color: '#7ee787', fontWeight: 600 }}>
                        Replayed ({tx.modifiedResponse?.statusCode})
                      </span>
                    )}
                  </div>

                  {tx.vulnerabilityFlagged && (
                    <div style={{ fontSize: '10px', color: '#ff7b72', fontWeight: 600, marginTop: '2px' }}>
                      ⚡ {tx.vulnerabilityFlagged}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Inspector, Tamper & Diff Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117', overflow: 'hidden' }}>
          {/* Inspector Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              padding: '0 14px',
            }}
          >
            {[
              { id: 'tamper', label: 'Tamper & Replay' },
              { id: 'diff', label: 'Side-by-Side Diff' },
              { id: 'original', label: 'Original Request/Response' },
              { id: 'scenarios', label: `Preset Scenarios (${scenarios.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id as typeof activeInspectorTab)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeInspectorTab === tab.id ? '2px solid #58a6ff' : '2px solid transparent',
                  color: activeInspectorTab === tab.id ? '#58a6ff' : '#8b949e',
                  fontWeight: activeInspectorTab === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inspector Body Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {activeTx ? (
              <div>
                {/* SUBTAB: TAMPER & REPLAY */}
                {activeInspectorTab === 'tamper' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Quick Tamper Presets */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#f0f6fc', marginBottom: '8px' }}>
                        Quick Exploit & Validation Presets:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button
                          onClick={() => handleApplyPreset('IDOR')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#58a6ff',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Tamper IDOR (id=EMP-001)
                        </button>
                        <button
                          onClick={() => handleApplyPreset('SQLI')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#58a6ff',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Inject SQLi (q=' OR 1=1--)
                        </button>
                        <button
                          onClick={() => handleApplyPreset('ROLE')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#58a6ff',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Tamper Header (X-User-Role: sec_admin)
                        </button>
                        <button
                          onClick={() => handleApplyPreset('VALIDATION_REJECT')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#d29922',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Malformed Input (XSS Injection)
                        </button>
                        <button
                          onClick={() => handleApplyPreset('DEBUG_LEAK')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#d29922',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          Verbose Debug Header Leak
                        </button>
                      </div>
                    </div>

                    {/* Manual Parameter Tamper Controls */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#f0f6fc' }}>
                        Modify Query Parameter:
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          value={tamperQueryParamKey}
                          onChange={e => setTamperQueryParamKey(e.target.value)}
                          placeholder="Param Key (e.g. id)"
                          style={{
                            width: '120px',
                            padding: '6px 8px',
                            backgroundColor: '#0d1117',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#f0f6fc',
                          }}
                        />
                        <input
                          type="text"
                          value={tamperQueryParamVal}
                          onChange={e => setTamperQueryParamVal(e.target.value)}
                          placeholder="Param Value (e.g. EMP-001)"
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            backgroundColor: '#0d1117',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#f0f6fc',
                          }}
                        />
                      </div>

                      <div style={{ fontWeight: 600, color: '#f0f6fc', marginTop: '4px' }}>
                        Modify Request Header:
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          value={tamperHeaderKey}
                          onChange={e => setTamperHeaderKey(e.target.value)}
                          placeholder="Header Key (e.g. X-User-Role)"
                          style={{
                            width: '160px',
                            padding: '6px 8px',
                            backgroundColor: '#0d1117',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#f0f6fc',
                          }}
                        />
                        <input
                          type="text"
                          value={tamperHeaderVal}
                          onChange={e => setTamperHeaderVal(e.target.value)}
                          placeholder="Header Value (e.g. sec_admin)"
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            backgroundColor: '#0d1117',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#f0f6fc',
                          }}
                        />
                        <button
                          onClick={() => handleReplay()}
                          style={{
                            padding: '6px 16px',
                            backgroundColor: '#238636',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#ffffff',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Send & Replay
                        </button>
                      </div>
                    </div>

                    {/* Raw Request Preview */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        fontFamily: 'SFMono-Regular, Consolas, monospace',
                        fontSize: '11px',
                        color: '#c9d1d9',
                      }}
                    >
                      <div style={{ color: '#58a6ff', fontWeight: 600, marginBottom: '4px' }}>
                        PREVIEW: Tampered Outbound Request
                      </div>
                      <div>
                        {activeTx.originalRequest.method} {activeTx.originalRequest.path}?{tamperQueryParamKey}={encodeURIComponent(tamperQueryParamVal)} HTTP/1.1
                      </div>
                      <div>Host: {activeTx.targetHost}:{activeTx.targetPort}</div>
                      <div>{tamperHeaderKey}: {tamperHeaderVal}</div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: SIDE-BY-SIDE DIFF */}
                {activeInspectorTab === 'diff' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {activeTx.diff ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Observation Banner */}
                        <div
                          style={{
                            padding: '12px',
                            backgroundColor: activeTx.vulnerabilityFlagged ? '#3d1618' : '#1b4d3e',
                            border: `1px solid ${activeTx.vulnerabilityFlagged ? '#da3633' : '#2ea043'}`,
                            borderRadius: '6px',
                            color: '#f0f6fc',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>
                            {activeTx.vulnerabilityFlagged ?? 'Security Control Assessment'}
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            {activeTx.diff.securityObservation}
                          </div>
                        </div>

                        {/* Side by side comparison cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {/* Original Response */}
                          <div
                            style={{
                              padding: '12px',
                              backgroundColor: '#161b22',
                              border: '1px solid #30363d',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600, color: '#8b949e' }}>Original Response</span>
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: activeTx.originalResponse.statusCode === 200 ? '#238636' : '#da3633',
                                  color: '#ffffff',
                                }}
                              >
                                {activeTx.originalResponse.statusCode} {activeTx.originalResponse.statusText}
                              </span>
                            </div>
                            <pre
                              style={{
                                margin: 0,
                                padding: '8px',
                                backgroundColor: '#0d1117',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: '#c9d1d9',
                                overflowX: 'auto',
                                maxHeight: '220px',
                              }}
                            >
                              {activeTx.originalResponse.body}
                            </pre>
                          </div>

                          {/* Modified Replayed Response */}
                          <div
                            style={{
                              padding: '12px',
                              backgroundColor: '#161b22',
                              border: '1px solid #30363d',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600, color: '#7ee787' }}>Replayed Modified Response</span>
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: activeTx.modifiedResponse?.statusCode === 200 ? '#238636' : '#da3633',
                                  color: '#ffffff',
                                }}
                              >
                                {activeTx.modifiedResponse?.statusCode} {activeTx.modifiedResponse?.statusText}
                              </span>
                            </div>
                            <pre
                              style={{
                                margin: 0,
                                padding: '8px',
                                backgroundColor: '#0d1117',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: activeTx.vulnerabilityFlagged ? '#ff7b72' : '#7ee787',
                                overflowX: 'auto',
                                maxHeight: '220px',
                              }}
                            >
                              {activeTx.modifiedResponse?.body ?? '(No response)'}
                            </pre>
                          </div>
                        </div>

                        {/* Evidence & Findings summary */}
                        {activeTx.finding && (
                          <div
                            style={{
                              padding: '12px',
                              backgroundColor: '#0d1117',
                              border: '1px solid #30363d',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '13px' }}>
                              Captured Finding: {activeTx.finding.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                              Classification: {activeTx.finding.cve} • Severity: {activeTx.finding.severity}
                            </div>
                            <div style={{ fontSize: '12px', color: '#7ee787', marginTop: '6px' }}>
                              Remediation: {activeTx.finding.remediationAdvice}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e', fontStyle: 'italic' }}>
                        No modified replay executed for transaction {activeTx.id} yet. Use the "Tamper & Replay" tab to inject test parameters and observe diff analysis.
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: ORIGINAL */}
                {activeInspectorTab === 'original' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ backgroundColor: '#161b22', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#f0f6fc', marginBottom: '6px' }}>
                        Raw Request Headers
                      </div>
                      <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#58a6ff' }}>
                        {Object.entries(activeTx.originalRequest.headers)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join('\n')}
                      </pre>
                    </div>

                    <div style={{ backgroundColor: '#161b22', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#f0f6fc', marginBottom: '6px' }}>
                        Raw Response Headers
                      </div>
                      <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#7ee787' }}>
                        {Object.entries(activeTx.originalResponse.headers)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join('\n')}
                      </pre>
                    </div>
                  </div>
                )}

                {/* SUBTAB: SCENARIOS */}
                {activeInspectorTab === 'scenarios' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {scenarios.map(s => (
                      <div
                        key={s.id}
                        style={{
                          padding: '12px',
                          backgroundColor: '#161b22',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '13px' }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#c9d1d9', marginTop: '4px' }}>
                          {s.educationalObjective}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '6px' }}>
                          Expected Vulnerability: {s.expectedVulnerability}
                        </div>
                        <div style={{ fontSize: '11px', color: '#58a6ff', marginTop: '2px' }}>
                          Recommended Tamper: {s.recommendedTamperField} = {s.recommendedTamperValue}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e' }}>
                Select a transaction from the list on the left to begin inspecting.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
