/**
 * Cyberlife — Milestone 10: Searchable Help Center & Knowledge Base
 *
 * Provides a searchable, categorized in-game knowledge base covering:
 * - Controls reference
 * - Terminal commands & syntax
 * - Aster Incident investigation workflow
 * - Career progression & economy rules
 * - Save & recovery guidelines
 * - Troubleshooting & technical FAQ
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

type HelpCategory =
  'all' | 'controls' | 'commands' | 'mission' | 'career' | 'persistence' | 'troubleshooting';

interface HelpTopic {
  id: string;
  category: HelpCategory;
  title: string;
  keywords: readonly string[];
  summary: string;
  details: string;
  relatedCommand?: string;
}

const HELP_TOPICS: readonly HelpTopic[] = [
  {
    id: 'help_controls_movement',
    category: 'controls',
    title: '3D Movement & Exploration',
    keywords: ['wasd', 'movement', 'walk', 'arrows', 'keys', 'navigation'],
    summary: 'Navigate Lagos Island streets using WASD or Arrow Keys.',
    details:
      'Walk forward with [W], left with [A], backward with [S], and right with [D]. Press [V] to switch between 3rd-Person and 1st-Person perspective. In 1st-Person mode, click the canvas to look around with your mouse; press [Esc] to release pointer lock.',
  },
  {
    id: 'help_controls_interaction',
    category: 'controls',
    title: 'Interacting with Objects & People',
    keywords: ['interact', 'npc', 'dialogue', 'workstation', 'door', 'e'],
    summary: 'Press [E] when near an interactive person, computer, door, or noticeboard.',
    details:
      'Interactive locations glow with circular floor beacons. When within range, a center-screen prompt indicates what will happen. Press [E] to talk, boot your workstation, read community bulletins, or enter buildings.',
  },
  {
    id: 'help_controls_workstation_orientation',
    category: 'controls',
    title: 'Workstation Operations & Field Tips',
    keywords: ['workstation', 'terminal', 'hotkeys', 'orientation', 'sandbox', 'desktop', 'keyboard'],
    summary: 'Orientation guide for operating the physical cybersecurity workstation.',
    details:
      'All terminal commands execute manually in the sandboxed virtual shell — zero commands run on your real machine. Type help, pwd, or ls -l to explore the virtual filesystem. Launch Packet Lens, Rev Lens, or Rule Tuner from the Applications menu or desktop icons. Press [Alt+F1] for the application menu, [Ctrl+Alt+T] for terminal, or [Esc] to stand up from the workstation.',
  },
  {
    id: 'help_cmd_netmap',
    category: 'commands',
    title: 'netmap — Subnet Host Discovery',
    keywords: ['netmap', 'hosts', 'scan', 'network', 'ip', 'discovery'],
    summary: 'Discovers reachable virtual hosts, IP addresses, and device roles on the subnet.',
    details:
      'Usage: "netmap hosts" or "netmap inspect <host-id>". Netmap catalogues nodes on the simulated 10.0.4.0/24 network. Note: In Cyberlife, network discovery examines the game\'s synthetic host inventory and NEVER sends real network packets.',
    relatedCommand: 'netmap hosts',
  },
  {
    id: 'help_cmd_svcscan',
    category: 'commands',
    title: 'svcscan — Port & Service Inspector',
    keywords: ['svcscan', 'services', 'ports', 'banners', 'inspect'],
    summary: 'Inspects open ports, running applications, and version banners on a target host.',
    details:
      'Usage: "svcscan inspect <host-id>" or "svcscan list". Educational Note: Open ports indicate software programs listening for connections. Discovering an open port does NOT prove an exploit exists; legitimate business services must remain online.',
    relatedCommand: 'svcscan inspect filesrv-01',
  },
  {
    id: 'help_cmd_logview',
    category: 'commands',
    title: 'logview — Event Log & Telemetry Query',
    keywords: ['logview', 'logs', 'telemetry', 'events', 'audit', 'auth'],
    summary: 'Queries structured authentication, firewall, and system event telemetry.',
    details:
      'Usage: "logview recent" or "logview filter --source=auth". Correlate timestamps and usernames across hosts to identify anomalous access spikes without relying on assumptions.',
    relatedCommand: 'logview recent',
  },
  {
    id: 'help_cmd_evidence',
    category: 'commands',
    title: 'evidence — Forensic Evidence Vault',
    keywords: ['evidence', 'hash', 'sha256', 'custody', 'forensics'],
    summary: 'Catalogues digital evidence objects, SHA-256 hashes, and chain-of-custody ledgers.',
    details:
      'Usage: "evidence list" or "evidence inspect <evidence-id>". Forensic evidence is strictly read-only and verified cryptographically to guarantee tamper-proof integrity for audits.',
    relatedCommand: 'evidence list',
  },
  {
    id: 'help_cmd_aster_admin',
    category: 'commands',
    title: 'aster-admin — Incident Response Console',
    keywords: ['aster-admin', 'contain', 'remediate', 'verify', 'policy', 'ir'],
    summary:
      'Manages Aster AI assistant containment, least-privilege IAM, and recovery verification.',
    details:
      'Usage: "aster-admin status", "aster-admin contain", "aster-admin remediate --role=kb-assistant", "aster-admin verify". Strictly adhere to the IR order of operations: contain lateral spread first, remediate IAM policy second, and verify recovery third.',
    relatedCommand: 'aster-admin status',
  },
  {
    id: 'help_mission_aster_flow',
    category: 'mission',
    title: 'The Aster Incident Lifecycle',
    keywords: ['aster', 'mission', 'incident', 'investigation', 'containment'],
    summary: 'Structured 6-phase incident response process.',
    details:
      '1. Briefing: Interview Lead Investigator Blessing. 2. Assessment: Inventory hosts and services. 3. Evidence: Snapshot memory dumps and auth logs. 4. Containment: Sever SMB port 445 network paths. 5. Remediation: Apply role:kb-assistant. 6. Verification & Report: Run automated tests and submit structured post-mortem.',
  },
  {
    id: 'help_career_advancement',
    category: 'career',
    title: 'Career Progression & Job Board',
    keywords: ['career', 'jobs', 'promotion', 'level', 'xp', 'tickets'],
    summary: 'How to accept jobs, earn experience points, and qualify for career promotion.',
    details:
      'Visit the Career app on your desktop. Browse open tickets, verify skill requirements, and complete objectives. Once you achieve sufficient total XP, complete required jobs, and raise core skills, click "Request Promotion" to advance your tier and salary.',
  },
  {
    id: 'help_economy_finances',
    category: 'career',
    title: 'Money, Purchases & Living Expenses',
    keywords: ['money', 'shop', 'kobo', 'naira', 'rent', 'expenses'],
    summary: 'Managing your financial balance and recurring expenses.',
    details:
      'Money is tracked in kobo (100 kobo = ₦1.00). Completing jobs awards direct deposits to your financial ledger. Purchase hardware upgrades in the Hardware Shop to boost analysis efficiency. Pay recurring living expenses (apartment rent, internet) on time to maintain focus.',
  },
  {
    id: 'help_persistence_slots',
    category: 'persistence',
    title: 'Persistent Saves & System Recovery',
    keywords: ['save', 'load', 'backup', 'slots', 'persistence', 'indexeddb'],
    summary: 'How your game progress is safely stored in local browser IndexedDB.',
    details:
      'Cyberlife stores saves locally in your browser with multi-slot support. The top HUD indicator pulses green on successful save. Two-phase shadow backups protect your data against accidental corruption. If a write fails, use the "Restore Backup" option in the Save Vault.',
  },
  {
    id: 'help_troubleshooting_webgl',
    category: 'troubleshooting',
    title: '3D Viewport or Keyboard Focus Issues',
    keywords: ['troubleshooting', 'stuck', 'focus', 'webgl', 'error', 'mouse'],
    summary: 'Resolving common browser rendering or keyboard input issues.',
    details:
      'If character movement is unresponsive, click the 3D canvas once to regain keyboard focus. If typing in a terminal or form, hotkeys are isolated to prevent accidental movement. Press [Esc] anytime to release pointer lock.',
  },
];

export const HelpCenterApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const [showOrientationNote, setShowOrientationNote] = useState(true);
  const currentTicket = sim?.state.episode?.activeTickets[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(HELP_TOPICS[0]!.id);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return HELP_TOPICS.filter(topic => {
      // Category filter
      if (selectedCategory !== 'all' && topic.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!q) return true;

      const titleMatch = topic.title.toLowerCase().includes(q);
      const summaryMatch = topic.summary.toLowerCase().includes(q);
      const detailsMatch = topic.details.toLowerCase().includes(q);
      const keywordMatch = topic.keywords.some(k => k.toLowerCase().includes(q));

      return titleMatch || summaryMatch || detailsMatch || keywordMatch;
    });
  }, [searchQuery, selectedCategory]);

  const activeTopic = useMemo(() => {
    return (
      filteredTopics.find(t => t.id === selectedTopicId) ?? filteredTopics[0] ?? HELP_TOPICS[0]!
    );
  }, [filteredTopics, selectedTopicId]);

  return (
    <div
      className="help-center-container"
      role="region"
      aria-label="Cyberlife Help Center & Knowledge Base"
      data-testid="help-center-app"
    >
      {/* Search Header */}
      <div className="help-search-bar">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          className="help-search-input"
          placeholder="Search controls, commands, incident steps, career rules..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search help topics"
          data-testid="help-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search query"
          >
            ✕
          </button>
        )}
      </div>

      {/* Skippable 'What To Do Now' Note for Active Episode */}
      {showOrientationNote && currentTicket && (
        <div
          style={{
            margin: '0 1rem 0.8rem',
            padding: '0.8rem 1rem',
            backgroundColor: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
          data-testid="help-what-to-do-now"
        >
          <div>
            <div style={{ color: '#00e5ff', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              Current Mission Briefing // {currentTicket.ticketId}
            </div>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.3rem' }}>
              {currentTicket.title}
            </div>
            <div style={{ color: '#94a3b8', lineHeight: '1.4' }}>
              {currentTicket.instructions[0] ?? currentTicket.description}
            </div>
          </div>
          <button
            onClick={() => setShowOrientationNote(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '2px 6px',
            }}
            title="Dismiss note"
          >
            ✕
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="help-category-bar" role="tablist">
        {(
          [
            { id: 'all', label: 'All Topics' },
            { id: 'controls', label: '🎮 Controls' },
            { id: 'commands', label: '💻 Commands' },
            { id: 'mission', label: '🚨 Aster Incident' },
            { id: 'career', label: '💼 Career & Money' },
            { id: 'persistence', label: '💾 Save & Backup' },
            { id: 'troubleshooting', label: '❓ FAQ & Fixes' },
          ] as const
        ).map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`help-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            data-testid={`help-cat-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Split Pane Body: Topic List on Left, Detail Viewer on Right */}
      <div className="help-split-body">
        {/* Topic List */}
        <div className="help-topic-list" role="list" tabIndex={0}>
          {filteredTopics.length === 0 ? (
            <div className="help-no-results">
              <p>No help articles matched &quot;{searchQuery}&quot;.</p>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredTopics.map(topic => (
              <div
                key={topic.id}
                className={`help-topic-item ${activeTopic?.id === topic.id ? 'active' : ''}`}
                role="listitem"
                tabIndex={0}
                onClick={() => setSelectedTopicId(topic.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedTopicId(topic.id);
                  }
                }}
                data-testid={`help-item-${topic.id}`}
              >
                <div className="help-item-title">{topic.title}</div>
                <div className="help-item-summary">{topic.summary}</div>
              </div>
            ))
          )}
        </div>

        {/* Topic Detail View */}
        <div className="help-topic-detail" tabIndex={0} data-testid="help-topic-detail">
          {activeTopic && (
            <div className="help-article">
              <div className="help-article-header">
                <span className="help-article-badge">{activeTopic.category.toUpperCase()}</span>
                <h2 className="help-article-title">{activeTopic.title}</h2>
              </div>

              <div className="help-article-summary-card">
                <strong>Overview: </strong>
                <span>{activeTopic.summary}</span>
              </div>

              <div className="help-article-body">
                <p>{activeTopic.details}</p>
              </div>

              {activeTopic.relatedCommand && (
                <div className="help-related-command-card">
                  <span className="related-cmd-label">Command Example:</span>
                  <code className="related-cmd-code">{activeTopic.relatedCommand}</code>
                  <span className="related-cmd-hint">
                    Type this command manually into your terminal prompt to run it.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
