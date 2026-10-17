/**
 * Cyberlife — Field Guide Application Component
 *
 * Beginner-friendly reference manual explaining:
 * - What the virtual desktop & terminal are.
 * - How to submit commands and interpret output.
 * - Supported command dictionary with plain-language security analogies.
 * - Absolute safety guarantee (zero real host execution).
 */

import React, { useState } from 'react';

type GuideTab = 'basics' | 'commands' | 'concepts' | 'safety';

export const FieldGuideApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('basics');

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
                  Click the <strong>quick command buttons</strong> (like <code>[help]</code>) above
                  the prompt to insert them in one click.
                </li>
                <li>
                  Type <code>clear</code> to wipe previous text and start fresh.
                </li>
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'commands' && (
          <section className="guide-section" aria-label="Command Reference">
            <h2 className="guide-title">Supported Commands in Milestone 4</h2>
            <p className="guide-intro">
              Here are the commands currently available on your virtual workstation:
            </p>

            <div className="command-grid">
              <div className="command-card">
                <div className="command-header">
                  <code>help</code>
                  <span className="cmd-badge">Guidance</span>
                </div>
                <p className="cmd-desc">
                  Displays the list of all available commands and practical beginner tips.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>help</code> or <code>help status</code>
                </div>
              </div>

              <div className="command-card">
                <div className="command-header">
                  <code>whoami</code>
                  <span className="cmd-badge">Identity</span>
                </div>
                <p className="cmd-desc">
                  Displays the active in-game user account, name, role, and organization.
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
                  Displays the current in-game simulation date, time, and timezone (WAT).
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
                  Shows workstation name, virtual IP address, operating system, and network health.
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
                  Lists all commands entered during the current terminal session in chronological
                  order.
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
                  Clears the terminal output area to give you a clean screen.
                </p>
                <div className="cmd-usage">
                  <strong>Example:</strong> <code>clear</code>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'concepts' && (
          <section className="guide-section" aria-label="Security Concepts">
            <h2 className="guide-title">Plain-English Cybersecurity Principles</h2>
            <p className="guide-intro">
              Cyberlife uses real-world metaphors to make complex digital security concepts
              intuitive:
            </p>

            <div className="guide-card">
              <h3 className="card-heading">🔑 IAM (Identity and Access Management)</h3>
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
              <h3 className="card-heading">📜 Audit Logs (SIEM)</h3>
              <p>
                <strong>Think of it like:</strong> A visitor sign-in book at building reception.
                <br />
                Every time someone opens a door, uses an elevator, or logs in, a timestamped record
                is written down. Security analysts inspect these logs to investigate suspicious
                activity.
              </p>
            </div>
          </section>
        )}

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
