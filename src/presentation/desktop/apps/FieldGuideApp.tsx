/**
 * Cyberlife — Field Guide Application Component
 *
 * Beginner-friendly reference manual explaining:
 * - What the virtual desktop & terminal are.
 * - Supported command dictionary (built-in system commands & M5 cyber tools).
 * - Comprehensive Security Tools guides (netmap, svcscan, logview, evidence).
 * - Plain-language cybersecurity analogies.
 * - Absolute safety guarantee (zero real host execution).
 *
 * STRICT INVARIANT:
 * No command-copy or auto-execution buttons. Players learn through manual command entry.
 */

import React, { useState } from 'react';

type GuideTab = 'basics' | 'commands' | 'tools' | 'concepts' | 'safety';

export const FieldGuideApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('basics');
  const [selectedToolGuide, setSelectedToolGuide] = useState<
    'netmap' | 'svcscan' | 'logview' | 'evidence' | 'aster-admin'
  >('netmap');

  return (
    <div
      className="field-guide-container"
      role="region"
      aria-label="Cyberlife Field Guide Reference"
      data-testid="field-guide-container"
    >
      {/* Navigation Tabs */}
      <div className="field-guide-nav" role="tablist">
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'basics' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'basics'}
          onClick={() => setActiveTab('basics')}
          data-testid="guide-tab-basics"
        >
          🖥️ Terminal Basics
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'commands' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'commands'}
          onClick={() => setActiveTab('commands')}
          data-testid="guide-tab-commands"
        >
          📋 Command Reference
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'tools' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'tools'}
          onClick={() => setActiveTab('tools')}
          data-testid="guide-tab-tools"
        >
          🛠️ Security Tools
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'concepts' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'concepts'}
          onClick={() => setActiveTab('concepts')}
          data-testid="guide-tab-concepts"
        >
          🔐 Security Concepts
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'safety' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'safety'}
          onClick={() => setActiveTab('safety')}
          data-testid="guide-tab-safety"
        >
          🛡️ Safety Guarantee
        </button>
      </div>

      {/* Guide Content Panels */}
      <div className="field-guide-body" tabIndex={0}>
        {/* TAB 1: Terminal Basics */}
        {activeTab === 'basics' && (
          <section className="guide-section" aria-label="Terminal Basics">
            <h2 className="guide-title">Understanding the Simulated Terminal</h2>
            <p className="guide-intro">
              Welcome to your workstation! If you have never used a computer terminal or
              command-line interface before, do not worry — every concept is simple once
              demystified.
            </p>

            <div className="guide-card">
              <h3 className="card-heading">1. What is a Terminal?</h3>
              <p>
                In standard computer apps, you click buttons with your mouse. In a{' '}
                <strong>terminal</strong>, you communicate with programs by typing specific words
                (called <em>commands</em>) and pressing <kbd>Enter</kbd>.
              </p>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">2. Command vs. Output</h3>
              <p>
                A <strong>command</strong> is the instruction you give to the computer.
                <br />
                The <strong>output</strong> is the computer&apos;s answer printed directly beneath
                your command.
              </p>
              <div className="example-block">
                <span className="ex-prompt">tade@cedarline:~$ </span>
                <span className="ex-cmd">whoami</span>
                <div className="ex-output">tade_adebayo (Security Analyst Intern)</div>
              </div>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">3. Quick Navigation &amp; History</h3>
              <ul>
                <li>
                  Press the <strong>Up Arrow (↑)</strong> to automatically bring back the last
                  command you typed so you don&apos;t have to retype it.
                </li>
                <li>
                  Click the <strong>command guide chips</strong> above the prompt to inspect syntax
                  reminders. Typing manually builds muscle memory!
                </li>
                <li>
                  Type <code>clear</code> or press <kbd>Ctrl+L</kbd> to wipe previous text and start
                  fresh.
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* TAB 2: Command Reference */}
        {activeTab === 'commands' && (
          <section className="guide-section" aria-label="Command Reference">
            <h2 className="guide-title">Command Dictionary</h2>
            <p className="guide-intro">
              Here are all the simulated commands currently supported by your virtual terminal:
            </p>

            <h3 style={{ color: 'var(--color-accent-cyan)', margin: '1rem 0 0.5rem 0' }}>
              System &amp; Environment Commands
            </h3>
            <div className="command-grid">
              <div className="command-card">
                <div className="command-header">
                  <code>help [command]</code>
                  <span className="cmd-badge">Guidance</span>
                </div>
                <p className="cmd-desc">
                  Lists all supported commands or provides details on a specific tool.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>help netmap</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>whoami</code>
                  <span className="cmd-badge">Identity</span>
                </div>
                <p className="cmd-desc">
                  Displays your active persona, security role, and organizational unit.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>whoami</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>date</code>
                  <span className="cmd-badge">Time</span>
                </div>
                <p className="cmd-desc">
                  Displays the authoritative in-game simulation clock in West Africa Time (WAT).
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>date</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>status</code>
                  <span className="cmd-badge">System</span>
                </div>
                <p className="cmd-desc">
                  Shows workstation name, virtual IP, simulated kernel, and network node health.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>status</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>history</code>
                  <span className="cmd-badge">Audit</span>
                </div>
                <p className="cmd-desc">
                  Lists all commands entered during the current terminal session in order.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>history</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>clear</code>
                  <span className="cmd-badge">Display</span>
                </div>
                <p className="cmd-desc">
                  Wipes the visible terminal buffer to give you a clean screen.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>clear</code>
                </div>
              </div>
            </div>

            <h3 style={{ color: 'var(--color-accent-emerald)', margin: '1.5rem 0 0.5rem 0' }}>
              Simulated Cybersecurity Tools (Milestone 5)
            </h3>
            <div className="command-grid">
              <div className="command-card">
                <div className="command-header">
                  <code>netmap hosts</code>
                  <span className="cmd-badge" style={{ backgroundColor: '#0284c7' }}>
                    Network
                  </span>
                </div>
                <p className="cmd-desc">
                  Discovers reachable synthetic nodes across the 10.0.4.0/24 subnet.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>netmap hosts</code> or{' '}
                  <code>netmap inspect ws-finance-02</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>svcscan inspect &lt;host&gt;</code>
                  <span className="cmd-badge" style={{ backgroundColor: '#059669' }}>
                    Services
                  </span>
                </div>
                <p className="cmd-desc">
                  Scans open port listeners and application version banners on a host.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>svcscan inspect filesrv-01</code> or{' '}
                  <code>svcscan list</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>logview recent</code>
                  <span className="cmd-badge" style={{ backgroundColor: '#d97706' }}>
                    Telemetry
                  </span>
                </div>
                <p className="cmd-desc">
                  Queries and filters structured auth, firewall, and system event logs.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>logview recent</code> or{' '}
                  <code>logview filter --source=auth</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>evidence list</code>
                  <span className="cmd-badge" style={{ backgroundColor: '#7c3aed' }}>
                    Forensics
                  </span>
                </div>
                <p className="cmd-desc">
                  Catalogs digital evidence objects, SHA-256 hashes, and custody logs.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>evidence list</code> or{' '}
                  <code>evidence inspect EVD-2026-001</code> or{' '}
                  <code>
                    evidence preserve EVD-2026-004 --reason=&quot;Pre-containment snapshot&quot;
                  </code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>aster-admin &lt;command&gt;</code>
                  <span className="cmd-badge" style={{ backgroundColor: '#ef4444' }}>
                    Incident IR
                  </span>
                </div>
                <p className="cmd-desc">
                  Administrative console for Aster AI assistant runtime status, containment, IAM
                  remediation, and verification.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>aster-admin status</code>,{' '}
                  <code>aster-admin contain</code>, or{' '}
                  <code>aster-admin remediate --role=kb-assistant</code>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: Security Tools Deep-Dive */}
        {activeTab === 'tools' && (
          <section className="guide-section" aria-label="Security Tools Deep Dive">
            <h2 className="guide-title">Interactive Cybersecurity Toolset</h2>
            <p className="guide-intro">
              Select a tool below to view its purpose, syntax, interpretation guidance, and common
              beginner mistakes.
            </p>

            <div
              className="tool-selector-bar"
              style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
            >
              <button
                type="button"
                className={`guide-tab-btn ${selectedToolGuide === 'netmap' ? 'tab-active' : ''}`}
                onClick={() => setSelectedToolGuide('netmap')}
              >
                🌐 netmap (Discovery)
              </button>
              <button
                type="button"
                className={`guide-tab-btn ${selectedToolGuide === 'svcscan' ? 'tab-active' : ''}`}
                onClick={() => setSelectedToolGuide('svcscan')}
              >
                🔌 svcscan (Services)
              </button>
              <button
                type="button"
                className={`guide-tab-btn ${selectedToolGuide === 'logview' ? 'tab-active' : ''}`}
                onClick={() => setSelectedToolGuide('logview')}
              >
                📜 logview (Logs)
              </button>
              <button
                type="button"
                className={`guide-tab-btn ${selectedToolGuide === 'evidence' ? 'tab-active' : ''}`}
                onClick={() => setSelectedToolGuide('evidence')}
              >
                💼 evidence (Forensics)
              </button>
              <button
                type="button"
                className={`guide-tab-btn ${selectedToolGuide === 'aster-admin' ? 'tab-active' : ''}`}
                onClick={() => setSelectedToolGuide('aster-admin')}
                data-testid="tool-guide-aster-admin"
              >
                🤖 aster-admin (IR Console)
              </button>
            </div>

            {/* NETMAP GUIDE */}
            {selectedToolGuide === 'netmap' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: 'var(--color-accent-cyan)' }}>
                  🌐 Network Discovery Tool (<code>netmap</code>)
                </h3>
                <p>
                  <strong>What is it for?</strong> Discovers virtual computer hosts active on your
                  organization&apos;s subnet (<code>10.0.4.0/24</code>). Before investigating any
                  incident, analysts must map which devices exist.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Supported Syntax:</h4>
                <ul style={{ lineHeight: 1.6 }}>
                  <li>
                    <code>netmap hosts</code> — Lists all discovered nodes on the subnet.
                  </li>
                  <li>
                    <code>netmap inspect &lt;host-id&gt;</code> — Inspects a specific host by its ID
                    (e.g. <code>netmap inspect filesrv-01</code>) or IP address (
                    <code>netmap inspect 10.0.4.50</code>).
                  </li>
                  <li>
                    <code>netmap filter &lt;role&gt;</code> — Filters by role (
                    <code>workstation</code>, <code>file_server</code>,{' '}
                    <code>application_server</code>
                    ).
                  </li>
                </ul>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Key Terms to Know:</h4>
                <p>
                  • <strong>IP Address:</strong> A numerical label like <code>10.0.4.15</code>{' '}
                  assigned to each device.
                  <br />• <strong>Subnet:</strong> A logical division of an IP network. Cedarline
                  uses <code>10.0.4.0/24</code> for Marina Tower.
                  <br />• <strong>Reachability (UP):</strong> The device responds to network polling
                  packets.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Common Beginner Mistakes:</h4>
                <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.85rem' }}>
                  ⚠️ <em>Mistake:</em> Assuming a host is compromised just because it appears on{' '}
                  <code>netmap</code>.<br />
                  💡 <em>Correction:</em> A host inventory merely reveals what exists on the
                  network. It is completely normal for servers and workstations to be active.
                </div>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Next Learning Step:</h4>
                <p>
                  After finding a host with <code>netmap hosts</code>, type{' '}
                  <code>svcscan inspect &lt;host-id&gt;</code> to inspect what services are running.
                </p>
              </div>
            )}

            {/* SVCSCAN GUIDE */}
            {selectedToolGuide === 'svcscan' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: 'var(--color-accent-emerald)' }}>
                  🔌 Service Inventory Tool (<code>svcscan</code>)
                </h3>
                <p>
                  <strong>What is it for?</strong> Identifies open network ports, protocols
                  (TCP/UDP), software applications, and version banners running on fictional hosts.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Supported Syntax:</h4>
                <ul style={{ lineHeight: 1.6 }}>
                  <li>
                    <code>svcscan inspect &lt;host-id&gt;</code> — Inspects open listeners on a host
                    (e.g. <code>svcscan inspect app-portal-01</code>).
                  </li>
                  <li>
                    <code>svcscan list</code> — Displays all known services across the entire
                    subnet.
                  </li>
                  <li>
                    <code>svcscan filter &lt;approved|review&gt;</code> — Filters services by
                    operational security approval status.
                  </li>
                </ul>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Key Terms to Know:</h4>
                <p>
                  • <strong>Port Number:</strong> A numerical channel (0–65535). For example, web
                  traffic uses port <code>80</code> (HTTP) and <code>443</code> (HTTPS).
                  <br />• <strong>Version Banner:</strong> The software identity announced by a
                  server (e.g. <code>nginx 1.24.0</code>).
                  <br />• <strong>Requires Review:</strong> A service configuration that violates
                  hardening guidelines (e.g. unencrypted HTTP on port 8080).
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Common Beginner Mistakes:</h4>
                <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.85rem' }}>
                  ⚠️ <em>Mistake:</em> Thinking every open port is a security flaw.
                  <br />
                  💡 <em>Correction:</em> Servers exist to provide services! Port 443 allows secure
                  web access, and port 445 allows file sharing. Only flag services that are
                  unnecessary or improperly configured.
                </div>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Next Learning Step:</h4>
                <p>
                  Once you know what services are listening, use <code>logview</code> to see if any
                  suspicious connections or authentication errors occurred on that service.
                </p>
              </div>
            )}

            {/* LOGVIEW GUIDE */}
            {selectedToolGuide === 'logview' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#d97706' }}>
                  📜 Simulated Log Analysis (<code>logview</code>)
                </h3>
                <p>
                  <strong>What is it for?</strong> Queries chronological security and operational
                  telemetry from authentication servers, firewalls, and application daemons.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Supported Syntax:</h4>
                <ul style={{ lineHeight: 1.6 }}>
                  <li>
                    <code>logview recent [--limit=N]</code> — Displays recent logs (default 10).
                  </li>
                  <li>
                    <code>logview filter --source=&lt;source&gt;</code> — Filters by source (
                    <code>auth</code>, <code>system</code>, <code>firewall</code>,{' '}
                    <code>app-portal</code>, <code>file-server</code>).
                  </li>
                  <li>
                    <code>logview filter --severity=&lt;INFO|WARN|ERROR&gt;</code> — Filters by
                    severity rating.
                  </li>
                  <li>
                    <code>logview inspect &lt;log-id&gt;</code> — Inspects full message details for
                    an event (e.g. <code>logview inspect LOG-2026-104</code>).
                  </li>
                </ul>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Severity Interpretation:</h4>
                <p>
                  • <strong style={{ color: '#38bdf8' }}>[INFO]</strong>: Routine operational event
                  (e.g. backup unmounted, successful login).
                  <br />• <strong style={{ color: '#fbbf24' }}>[WARN]</strong>: An unexpected or
                  irregular condition (e.g. failed password retry, rejected anonymous bind).
                  <br />• <strong style={{ color: '#f87171' }}>[ERROR]</strong>: Service failure or
                  resource starvation (e.g. database timeout).
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Common Beginner Mistakes:</h4>
                <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.85rem' }}>
                  ⚠️ <em>Mistake:</em> Jumping to conclusions on a single <code>AUTH_FAILURE</code>.
                  <br />
                  💡 <em>Correction:</em> People mistype passwords every day. Notice that in
                  LOG-2026-104, Folake mistyped her password, then successfully logged in 40 seconds
                  later (LOG-2026-105). Always correlate events across time!
                </div>
              </div>
            )}

            {/* EVIDENCE GUIDE */}
            {selectedToolGuide === 'evidence' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#a855f7' }}>
                  💼 Forensic Evidence Inspection (<code>evidence</code>)
                </h3>
                <p>
                  <strong>What is it for?</strong> Inspects digital evidence items preserved in the
                  Cedarline Security Operations Center vault with cryptographic verification.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Supported Syntax:</h4>
                <ul style={{ lineHeight: 1.6 }}>
                  <li>
                    <code>evidence list</code> — Catalogs all preserved forensic evidence objects.
                  </li>
                  <li>
                    <code>evidence inspect &lt;evidence-id&gt;</code> — Inspects SHA-256 hash, chain
                    of custody ledger, and artifact data (e.g.{' '}
                    <code>evidence inspect EVD-2026-001</code>).
                  </li>
                </ul>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Forensic Principles:</h4>
                <p>
                  • <strong>Cryptographic Hash (SHA-256):</strong> A unique mathematical fingerprint
                  of the file. If even one character changes, the hash changes completely.
                  <br />• <strong>Chain of Custody:</strong> A chronological paper trail recording
                  who collected, transferred, and analyzed the evidence.
                  <br />• <strong>Read-Only Access:</strong> Forensic evidence must never be altered
                  or executed on live systems.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Access Control Note:</h4>
                <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.85rem' }}>
                  ℹ️ Some high-value evidence items (like <code>EVD-2026-RESTRICTED</code>) require
                  Tier 2 Clearance. If your persona is Tier 1, access control will reject the
                  request to enforce least privilege.
                </div>
              </div>
            )}

            {/* ASTER-ADMIN GUIDE */}
            {selectedToolGuide === 'aster-admin' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#ef4444' }}>
                  🤖 Incident Response Administration Console (<code>aster-admin</code>)
                </h3>
                <p>
                  <strong>What is it for?</strong> Provides authorized administrative control over
                  internal AI assistant Aster on host <code>app-portal-01:5050</code>. Enables
                  status inspection, network containment, IAM permission remediation, and empirical
                  verification.
                </p>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Supported Syntax:</h4>
                <ul style={{ lineHeight: 1.6 }}>
                  <li>
                    <code>aster-admin status</code> — Shows runtime status, active IAM role, granted
                    scopes, and network isolation state.
                  </li>
                  <li>
                    <code>aster-admin policy</code> — Displays Aster&apos;s active JSON IAM access
                    policy manifest.
                  </li>
                  <li>
                    <code>aster-admin contain</code> — Immediately severs SMB Port 445 network route
                    and places Aster in restricted operating mode.
                  </li>
                  <li>
                    <code>aster-admin remediate --role=kb-assistant</code> — Replaces overprivileged
                    wildcard role with least-privilege knowledge-base search permissions.
                  </li>
                  <li>
                    <code>aster-admin verify</code> — Runs automated end-to-end verification tests
                    against actual simulated service boundaries.
                  </li>
                </ul>

                <h4 style={{ margin: '0.75rem 0 0.25rem 0' }}>Incident Response Golden Rule:</h4>
                <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.85rem' }}>
                  ⚠️ <em>Order of Operations:</em> Always preserve relevant evidence (such as{' '}
                  <code>EVD-2026-004</code> and security logs) before executing containment or
                  remediation. Once system state changes, unpreserved volatile evidence can be lost!
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 4: Security Concepts */}
        {activeTab === 'concepts' && (
          <section className="guide-section" aria-label="Security Concepts">
            <h2 className="guide-title">Plain-English Cybersecurity Principles</h2>
            <p className="guide-intro">
              Cyberlife uses real-world metaphors to make complex digital security concepts
              intuitive:
            </p>

            <div className="guide-card">
              <h3 className="card-heading">🚨 Incident Response Lifecycle</h3>
              <p>
                When a security breach or suspicious anomaly is detected, professional incident
                responders follow a disciplined lifecycle rather than making ad-hoc changes:
              </p>
              <ul
                style={{
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>1. Assessment &amp; Scope:</strong> Confirm the alert, identify affected
                  systems (e.g. <code>app-portal-01</code>, <code>filesrv-01</code>), and verify
                  authorization.
                </li>
                <li>
                  <strong>2. Evidence Preservation:</strong> Snapshot relevant logs and manifests
                  before altering configuration.
                </li>
                <li>
                  <strong>3. Containment:</strong> Halt ongoing harm (sever SMB route) without
                  unnecessarily crashing legitimate services.
                </li>
                <li>
                  <strong>4. Remediation:</strong> Fix the underlying root weakness (apply Least
                  Privilege: <code>role:kb-assistant</code>).
                </li>
                <li>
                  <strong>5. Verification:</strong> Prove empirically that legitimate features work
                  while unauthorized actions are blocked.
                </li>
                <li>
                  <strong>6. Post-Mortem &amp; Reporting:</strong> Document timeline, root cause,
                  and recommendations to prevent recurrence.
                </li>
              </ul>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">🔑 IAM &amp; Least Privilege</h3>
              <p>
                <strong>Think of it like:</strong> An office keycard system.
                <br />
                Just because you work in a building does not mean your keycard opens the vault or
                the server room. In digital security, <em>least privilege</em> means every account
                should only have access to what it strictly needs.
              </p>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">🌐 IP Addresses &amp; Subnets</h3>
              <p>
                <strong>Think of it like:</strong> Office room numbers on a floor.
                <br />
                Every computer on a network has a unique number like <code>10.0.4.15</code> so other
                computers know where to send digital messages.
              </p>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">📜 Audit Logs &amp; SIEM</h3>
              <p>
                <strong>Think of it like:</strong> A visitor sign-in book at building reception.
                <br />
                Every time someone opens a door, uses an elevator, or logs in, a timestamped record
                is written down. Security analysts inspect these logs to investigate suspicious
                activity.
              </p>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">🔏 Cryptographic Hashes</h3>
              <p>
                <strong>Think of it like:</strong> A tamper-evident wax seal on an official letter.
                <br />A hash function converts an entire file into a 64-character code like{' '}
                <code>7f83b165...</code>. If anyone tampers with a single character, the seal
                breaks.
              </p>
            </div>
          </section>
        )}

        {/* TAB 5: Safety Guarantee */}
        {activeTab === 'safety' && (
          <section className="guide-section" aria-label="Safety Guarantee">
            <h2 className="guide-title">The Non-Negotiable Safety Guarantee</h2>
            <div className="safety-callout">
              <div className="safety-icon">🛡️</div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-accent-emerald)' }}>
                  100% Simulated Sandboxed Environment
                </h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Cyberlife is purely an educational game. All terminals, commands, network hosts,
                  files, and data are simulated inside your browser memory.
                </p>
              </div>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">Strict Architectural Guarantees:</h3>
              <ul style={{ lineHeight: 1.7 }}>
                <li>
                  <strong>No Host OS Execution:</strong> Commands entered in the terminal never
                  execute on your actual computer (Mac, Windows, or Linux).
                </li>
                <li>
                  <strong>No External Network Requests:</strong> The game never scans, connects to,
                  or interacts with real internet servers or your home Wi-Fi network.
                </li>
                <li>
                  <strong>No File Access:</strong> Cyberlife cannot read, edit, or delete any files
                  on your physical computer.
                </li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
