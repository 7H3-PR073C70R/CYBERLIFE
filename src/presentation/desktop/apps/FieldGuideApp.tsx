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
import { OsIcon } from '../icons/OsIcons';

type GuideTab = 'basics' | 'commands' | 'tools' | 'concepts' | 'career' | 'safety';

export const FieldGuideApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('basics');
  const [selectedToolGuide, setSelectedToolGuide] = useState<
    'netmap' | 'svcscan' | 'logview' | 'evidence' | 'aster-admin'
  >('netmap');
  const [guideSearch, setGuideSearch] = useState('');

  return (
    <div
      className="field-guide-container"
      role="region"
      aria-label="Cyberlife Field Guide Reference"
      data-testid="field-guide-container"
    >
      {/* Search Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem 0.8rem',
          background: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '0.5rem',
        }}
      >
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
          <OsIcon name="search" size={14} color="#64748b" />
        </span>
        <input
          type="search"
          placeholder="Filter Field Guide topics or commands..."
          value={guideSearch}
          onChange={e => setGuideSearch(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '4px',
            color: '#fff',
            padding: '0.3rem 0.6rem',
            fontSize: '0.8rem',
            outline: 'none',
          }}
          data-testid="field-guide-search-input"
        />
        {guideSearch && (
          <button
            type="button"
            onClick={() => setGuideSearch('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

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
          Terminal Basics
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'commands' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'commands'}
          onClick={() => setActiveTab('commands')}
          data-testid="guide-tab-commands"
        >
          Command Reference
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'tools' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'tools'}
          onClick={() => setActiveTab('tools')}
          data-testid="guide-tab-tools"
        >
          Security Tools
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'concepts' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'concepts'}
          onClick={() => setActiveTab('concepts')}
          data-testid="guide-tab-concepts"
        >
          Security Concepts
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'career' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'career'}
          onClick={() => setActiveTab('career')}
          data-testid="guide-tab-career"
        >
          Career Skills
        </button>
        <button
          type="button"
          className={`guide-tab-btn ${activeTab === 'safety' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'safety'}
          onClick={() => setActiveTab('safety')}
          data-testid="guide-tab-safety"
        >
          Safety Guarantee
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
                <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  <li>
                    <strong>What it does in Cyberlife:</strong> Inspects the simulated local network
                    (10.0.4.0/24 subnet) in memory to discover active nodes, hostnames, IP
                    addresses, and device roles.
                  </li>
                  <li>
                    <strong>When to use:</strong> At the start of an investigation to identify
                    target infrastructure and confirm which systems are online before scanning
                    services.
                  </li>
                  <li>
                    <strong>Syntax:</strong> <code>netmap hosts</code> |{' '}
                    <code>netmap inspect &lt;host-id&gt;</code> |{' '}
                    <code>netmap filter &lt;role&gt;</code>
                  </li>
                  <li>
                    <strong>Arguments:</strong> <code>&lt;host-id&gt;</code> is a fictional host
                    identifier (e.g. <code>app-portal-01</code> or IP <code>10.0.4.15</code>).{' '}
                    <code>&lt;role&gt;</code> filters by <code>workstation</code>,{' '}
                    <code>file_server</code>, or <code>application_server</code>.
                  </li>
                  <li>
                    <strong>Fictional Example:</strong> <code>netmap inspect filesrv-01</code>
                  </li>
                  <li>
                    <strong>Expected Output:</strong> A formatted tabular report showing Host ID, IP
                    address, device role, online status (UP), and MAC address.
                  </li>
                  <li>
                    <strong>How to interpret:</strong> Verifies device reachability. A status of UP
                    confirms the simulated node is reachable from your virtual workstation.
                  </li>
                  <li>
                    <strong>Common Mistakes:</strong> Assuming an active host is compromised simply
                    because it appears in the network map. Normal corporate servers are supposed to
                    be active.
                  </li>
                  <li>
                    <strong>Error Recovery:</strong> If you see <em>&quot;Host not found&quot;</em>,
                    run <code>netmap hosts</code> to view the list of valid simulated host
                    identifiers.
                  </li>
                  <li>
                    <strong>What it does NOT do:</strong> It does NOT ping, ARP-scan, or
                    packet-probe your physical home or office network. It queries an in-memory
                    fictional state model exclusively.
                  </li>
                </ol>
              </div>
            )}

            {/* SVCSCAN GUIDE */}
            {selectedToolGuide === 'svcscan' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: 'var(--color-accent-emerald)' }}>
                  🔌 Service Inventory Tool (<code>svcscan</code>)
                </h3>
                <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  <li>
                    <strong>What it does in Cyberlife:</strong> Probes simulated listening network
                    ports, running protocols, daemon banners, and security approval states on
                    fictional hosts.
                  </li>
                  <li>
                    <strong>When to use:</strong> When you know which host you want to investigate
                    and need to see which software services and network ports are exposed.
                  </li>
                  <li>
                    <strong>Syntax:</strong> <code>svcscan inspect &lt;host-id&gt;</code> |{' '}
                    <code>svcscan list</code> | <code>svcscan filter &lt;status&gt;</code>
                  </li>
                  <li>
                    <strong>Arguments:</strong> <code>&lt;host-id&gt;</code> is the target machine
                    (e.g. <code>app-portal-01</code>). <code>&lt;status&gt;</code> filters by{' '}
                    <code>approved</code> or <code>review</code>.
                  </li>
                  <li>
                    <strong>Fictional Example:</strong> <code>svcscan inspect app-portal-01</code>
                  </li>
                  <li>
                    <strong>Expected Output:</strong> Port table listing Port, Transport Protocol,
                    Service Name, Version Banner, and Security Compliance Tag.
                  </li>
                  <li>
                    <strong>How to interpret:</strong> Check for ports tagged{' '}
                    <em>requires_review</em> (e.g. SMB 445 on a public portal) or unexpected version
                    mismatches.
                  </li>
                  <li>
                    <strong>Common Mistakes:</strong> Flagging legitimate standard ports (e.g., port
                    443 HTTPS or port 80 HTTP) as security incidents.
                  </li>
                  <li>
                    <strong>Error Recovery:</strong> If the host ID is unrecognized, verify spelling
                    against <code>netmap hosts</code>.
                  </li>
                  <li>
                    <strong>What it does NOT do:</strong> It does NOT send real TCP SYN/ACK packets
                    or interact with Nmap or real-world port scanners.
                  </li>
                </ol>
              </div>
            )}

            {/* LOGVIEW GUIDE */}
            {selectedToolGuide === 'logview' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#d97706' }}>
                  📜 Simulated Log Analysis (<code>logview</code>)
                </h3>
                <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  <li>
                    <strong>What it does in Cyberlife:</strong> Queries the central simulated log
                    journal for authentication records, firewall drops, and application runtime
                    events.
                  </li>
                  <li>
                    <strong>When to use:</strong> To correlate timestamps, trace attacker lateral
                    movement, and verify which user accounts or services initiated connections.
                  </li>
                  <li>
                    <strong>Syntax:</strong> <code>logview recent [--limit=N]</code> |{' '}
                    <code>logview filter --source=&lt;src&gt;</code> |{' '}
                    <code>logview inspect &lt;log-id&gt;</code>
                  </li>
                  <li>
                    <strong>Arguments:</strong> <code>--source</code> targets <code>auth</code>,{' '}
                    <code>system</code>, <code>firewall</code>, <code>app-portal</code>, or{' '}
                    <code>file-server</code>. <code>--limit</code> controls row count (default 10).
                  </li>
                  <li>
                    <strong>Fictional Example:</strong> <code>logview filter --source=auth</code>
                  </li>
                  <li>
                    <strong>Expected Output:</strong> Chronological log feed showing Log ID, WAT
                    Timestamp, Source Daemon, Severity (INFO/WARN/ERROR), and Event Summary.
                  </li>
                  <li>
                    <strong>How to interpret:</strong> Look for anomalous spikes in authentication
                    failures followed by unauthorized privilege elevation or unexpected data
                    transfers.
                  </li>
                  <li>
                    <strong>Common Mistakes:</strong> Assuming a single failed login is a
                    brute-force attack without checking if the user logged in successfully a moment
                    later.
                  </li>
                  <li>
                    <strong>Error Recovery:</strong> If zero logs match your filter, try widening
                    your criteria using <code>logview recent</code>.
                  </li>
                  <li>
                    <strong>What it does NOT do:</strong> It does NOT read your operating
                    system&apos;s <code>/var/log/</code>, Windows Event Viewer, or real syslog
                    daemons.
                  </li>
                </ol>
              </div>
            )}

            {/* EVIDENCE GUIDE */}
            {selectedToolGuide === 'evidence' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#a855f7' }}>
                  💼 Forensic Evidence Inspection (<code>evidence</code>)
                </h3>
                <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  <li>
                    <strong>What it does in Cyberlife:</strong> Manages the cryptographic evidence
                    vault, ensuring tamper-evident chain of custody for artifacts collected during
                    incident response.
                  </li>
                  <li>
                    <strong>When to use:</strong> Before taking disruptive actions (like containment
                    or remediation) to preserve forensically sound copies of suspicious
                    configurations.
                  </li>
                  <li>
                    <strong>Syntax:</strong> <code>evidence list</code> |{' '}
                    <code>evidence inspect &lt;id&gt;</code> |{' '}
                    <code>evidence preserve &lt;id&gt; --reason=&quot;...&quot;</code>
                  </li>
                  <li>
                    <strong>Arguments:</strong> <code>&lt;id&gt;</code> is an evidence artifact
                    identifier (e.g. <code>EVD-2026-001</code>). <code>--reason</code> provides the
                    legal/operational justification for preservation.
                  </li>
                  <li>
                    <strong>Fictional Example:</strong>{' '}
                    <code>
                      evidence preserve EVD-2026-004 --reason=&quot;Pre-containment snapshot of
                      Aster IAM policy&quot;
                    </code>
                  </li>
                  <li>
                    <strong>Expected Output:</strong> Evidence ledger entry showing Evidence ID,
                    Artifact Type, SHA-256 Digest, Collector Persona, and Chain of Custody History.
                  </li>
                  <li>
                    <strong>How to interpret:</strong> The SHA-256 hash guarantees the artifact was
                    not altered after preservation, providing indisputable proof for audit reports.
                  </li>
                  <li>
                    <strong>Common Mistakes:</strong> Modifying systems before preserving evidence,
                    which ruins forensic integrity and makes post-incident audits inconclusive.
                  </li>
                  <li>
                    <strong>Error Recovery:</strong> If access is denied due to clearance, check
                    your current rank with <code>whoami</code> or complete prerequisite career
                    certifications.
                  </li>
                  <li>
                    <strong>What it does NOT do:</strong> It does NOT hash or upload files from your
                    actual hard drive or interact with cloud storage buckets.
                  </li>
                </ol>
              </div>
            )}

            {/* ASTER-ADMIN GUIDE */}
            {selectedToolGuide === 'aster-admin' && (
              <div className="tool-guide-card">
                <h3 className="card-heading" style={{ color: '#ef4444' }}>
                  🤖 Incident Response Administration Console (<code>aster-admin</code>)
                </h3>
                <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  <li>
                    <strong>What it does in Cyberlife:</strong> Controls the simulated Aster AI
                    service on host <code>app-portal-01:5050</code>, providing containment controls,
                    IAM policy remediation, and operational verification.
                  </li>
                  <li>
                    <strong>When to use:</strong> During Milestone 6 Aster Incident containment,
                    policy tightening, and post-incident verification phases.
                  </li>
                  <li>
                    <strong>Syntax:</strong> <code>aster-admin status</code> |{' '}
                    <code>aster-admin contain</code> |{' '}
                    <code>aster-admin remediate --role=&lt;role&gt;</code> |{' '}
                    <code>aster-admin verify</code>
                  </li>
                  <li>
                    <strong>Arguments:</strong> <code>--role</code> specifies the target IAM role
                    definition (e.g. <code>kb-assistant</code> to enforce least privilege).
                  </li>
                  <li>
                    <strong>Fictional Example:</strong>{' '}
                    <code>aster-admin remediate --role=kb-assistant</code>
                  </li>
                  <li>
                    <strong>Expected Output:</strong> Structured service response showing Previous
                    Role, New Role, Policy Scopes Applied, and Daemon Reload Status.
                  </li>
                  <li>
                    <strong>How to interpret:</strong> Containment severs dangerous SMB file routes;
                    remediation locks down granted permissions to strictly search knowledge bases.
                  </li>
                  <li>
                    <strong>Common Mistakes:</strong> Running containment before preserving forensic
                    evidence, or forgetting to run <code>aster-admin verify</code> to validate that
                    normal services still function.
                  </li>
                  <li>
                    <strong>Error Recovery:</strong> If a command is rejected because Aster is in an
                    incompatible state, check <code>aster-admin status</code> first to see the
                    current lifecycle stage.
                  </li>
                  <li>
                    <strong>What it does NOT do:</strong> It does NOT manage real AI models,
                    external APIs, cloud IAM policies, or live Docker/Kubernetes containers.
                  </li>
                </ol>
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

        {/* TAB 5: Career Skills */}
        {activeTab === 'career' && (
          <section
            className="guide-section"
            aria-label="Career & Economy Skills"
            data-testid="guide-section-career"
          >
            <h2 className="guide-title">Career Progression &amp; Life Economy</h2>
            <p className="guide-intro">
              Cyberlife is not just about typing commands — you are living as an aspiring
              cybersecurity professional in Lagos Island. Here is how your career, skills, and
              finances work:
            </p>

            <div className="guide-card">
              <h3 className="card-heading">💼 1. Finding &amp; Evaluating Jobs</h3>
              <p>
                Open the <strong>Job Board</strong> application on your workstation desktop.
                Available assignments are listed with their client, difficulty rating, estimated
                completion time, and payout.
              </p>
              <ul
                style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>Entry Roles:</strong> Start with Cedarline Security Operations Center
                  intern assignments (e.g. host discovery, log triage).
                </li>
                <li>
                  <strong>Requirements:</strong> Advanced jobs require minimum skill levels (e.g.
                  Network Analysis Level 2) or security clearances. You cannot accept assignments if
                  your credentials don&apos;t meet requirements.
                </li>
                <li>
                  <strong>Job Inspection:</strong> Inspect the full brief before accepting to verify
                  that you understand what evidence or reports the client expects.
                </li>
              </ul>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">🎯 2. Completing Objectives &amp; Earning Rewards</h3>
              <p>
                Once an assignment is accepted, its tasks appear in your Active Objectives HUD
                panel.
              </p>
              <ul
                style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>Authoritative Validation:</strong> Objectives are validated against real
                  simulation state (e.g. discovering a specific node with <code>netmap</code> or
                  inspecting an audit log with <code>logview</code>).
                </li>
                <li>
                  <strong>Payouts &amp; XP:</strong> Completing all assignment objectives
                  immediately awards cash (₦ Naira) directly to your balance and adds experience
                  points to your skill attributes.
                </li>
                <li>
                  <strong>Promotions:</strong> Opening the career dashboard does not award
                  promotions; promotions are earned strictly by reaching milestone reputation and
                  skill thresholds.
                </li>
              </ul>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">📊 3. The 7 Core Professional Skills</h3>
              <p>Your persona develops mastery across 7 recognized cybersecurity domains:</p>
              <ul
                style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>Network Analysis:</strong> Subnet mapping, port auditing, and protocol
                  behavior.
                </li>
                <li>
                  <strong>Forensic Triage:</strong> Cryptographic hashing, artifact preservation,
                  and custody integrity.
                </li>
                <li>
                  <strong>Incident Response:</strong> Containment, lateral movement disruption, and
                  service recovery.
                </li>
                <li>
                  <strong>Log Correlation:</strong> Multi-source SIEM log telemetry and anomaly
                  detection.
                </li>
                <li>
                  <strong>Threat Intelligence:</strong> IOC classification, attacker TTP
                  attribution, and threat feeds.
                </li>
                <li>
                  <strong>System Hardening:</strong> IAM least privilege, service minimization, and
                  firewall rules.
                </li>
                <li>
                  <strong>Scripting &amp; Automation:</strong> Workflow efficiency and terminal
                  operational speed.
                </li>
              </ul>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">💰 4. Economy, Inventory &amp; Daily Living</h3>
              <p>Living in Lagos requires balancing income against living costs:</p>
              <ul
                style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>Cash Balance &amp; Ledger:</strong> Every job payout, shop purchase, and
                  living expense is recorded in your financial ledger with an authoritative
                  timestamp.
                </li>
                <li>
                  <strong>Lagos Tech Market:</strong> Visit vendors or the hardware app to purchase
                  workstation upgrades (RAM, monitors, network cards) and forensics tools.
                </li>
                <li>
                  <strong>Inventory Management:</strong> Purchased physical items reside in your
                  personal inventory and provide tangible bonuses to workstation throughput or
                  investigation capabilities.
                </li>
                <li>
                  <strong>Daily Living Expenses:</strong> Periodic rent and subsistence costs are
                  automatically deducted from your balance as simulation days advance.
                </li>
              </ul>
            </div>

            <div className="guide-card">
              <h3 className="card-heading">⚖️ 5. Professional Ethics &amp; Legal Boundaries</h3>
              <p>
                All cybersecurity practice within Cyberlife is strictly governed by legal
                authorization and ethical standards:
              </p>
              <ul
                style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  margin: '0.4rem 0 0',
                  paddingLeft: '1.2rem',
                }}
              >
                <li>
                  <strong>Scope of Engagement:</strong> Only probe systems for which you have
                  explicit client authorization.
                </li>
                <li>
                  <strong>Data Privacy:</strong> Treat all client logs and employee records with
                  strict confidentiality.
                </li>
                <li>
                  <strong>Integrity:</strong> Never fabricate evidence or alter system timestamps to
                  match a preconceived theory.
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* TAB 6: Safety Guarantee */}
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
