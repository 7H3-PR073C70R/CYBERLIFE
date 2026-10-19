/**
 * Cyberlife — Notes & Findings Application Component
 *
 * Displays fictional in-game IT security onboarding memo, orientation checklist,
 * and an interactive local scratchpad for player investigation findings.
 *
 * SAFETY INVARIANT:
 * Does not read or write to the player's physical computer file system.
 */

import React, { useState } from 'react';

export interface NotesAppProps {
  workstationId?: string;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
}) => {
  const isCedarline = workstationId.includes('cedarline');

  const [notesText, setNotesText] = useState<string>(
    '# Investigation Scratchpad & Findings\n- Initial workstation node checked via status\n- Terminal online and synchronized with simulation clock\n'
  );

  const insertTemplate = (template: string) => {
    setNotesText(prev => prev + '\n' + template + '\n');
  };

  return (
    <div
      className="notes-app-container"
      role="region"
      aria-label="Security Notes and Memos"
      data-testid="notes-app-container"
    >
      {/* Onboarding Memo Header */}
      <div className="notes-memo-card">
        <div className="memo-header">
          <span className="memo-tag">INTERNAL MEMO</span>
          <span className="memo-date">Oct 12, 2026 // 08:00 WAT</span>
        </div>
        <div className="memo-fields">
          <div>
            <strong>To:</strong> Tade Adebayo (Security Analyst Intern)
          </div>
          <div>
            <strong>From:</strong> Chidi Okafor (Lead Incident Response, Cedarline)
          </div>
          <div>
            <strong>Subject:</strong> Workstation Onboarding &amp; Toolset Reference
          </div>
        </div>
        <div className="memo-body">
          <p>
            {isCedarline
              ? 'Welcome to the Cedarline Security Operations Center at Marina Tower. Use your terminal to practice network discovery (netmap), service scanning (svcscan), log filtering (logview), and evidence review (evidence).'
              : 'Welcome to your private cybersecurity lab on Broad Street. Use this terminal environment to practice defensive tools, explore simulated logs, and conduct independent investigations.'}
          </p>
          <p>
            Record any unusual observations or baseline notes in the scratchpad below. If you need
            clarification on command syntax or security concepts, consult the{' '}
            <strong>Field Guide</strong>.
          </p>
        </div>
      </div>

      {/* Interactive Local Scratchpad */}
      <div className="notes-scratchpad-area">
        <div className="scratchpad-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="player-scratchpad-input" className="scratchpad-title">
              📝 Investigation Findings Scratchpad
            </label>
            <span className="scratchpad-note">(In-game memory only)</span>
          </div>

          {/* Quick Note Templates */}
          <div className="scratchpad-actions" style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-scratchpad-action"
              onClick={() =>
                insertTemplate(
                  '### Host Finding\n- Host ID: ws-finance-02 (10.0.4.22)\n- Role: Finance Desktop\n- Open Ports: 445/tcp (SMB), 3389/tcp (RDP)\n- Observation: Standard approved configuration'
                )
              }
              title="Add Host Finding Template"
              data-testid="btn-add-host-note"
            >
              + Host Note
            </button>
            <button
              type="button"
              className="btn-scratchpad-action"
              onClick={() =>
                insertTemplate(
                  '### Log Observation\n- Log ID: LOG-2026-104 & 105\n- Source: auth (app-portal-01)\n- Assessment: Password retry succeeded; normal user typo.'
                )
              }
              title="Add Log Finding Template"
              data-testid="btn-add-log-note"
            >
              + Log Note
            </button>
            <button
              type="button"
              className="btn-scratchpad-action"
              onClick={() =>
                insertTemplate(
                  '### Evidence Record\n- Evidence ID: EVD-2026-001\n- Integrity: VERIFIED (SHA-256 match)\n- Chain of Custody: Handled by Chidi Okafor'
                )
              }
              title="Add Evidence Finding Template"
              data-testid="btn-add-evidence-note"
            >
              + Evidence Note
            </button>
            <button
              type="button"
              className="btn-scratchpad-action"
              onClick={() =>
                insertTemplate(
                  '## Incident Report Draft: The Aster Incident\n1. Executive Summary: \n2. Timeline: \n3. Affected Systems: app-portal-01, filesrv-01\n4. Root Cause: Overprivileged role:corporate-admin [*]\n5. Containment: Severed SMB port 445\n6. Remediation: Replaced role with role:kb-assistant\n7. Verification: PASSED (200 OK on search, 403 Forbidden on SMB)'
                )
              }
              title="Add Incident Report Template"
              data-testid="btn-add-report-note"
            >
              + Incident Report
            </button>
            <button
              type="button"
              className="btn-scratchpad-clear"
              onClick={() => setNotesText('')}
              title="Clear Scratchpad"
              data-testid="btn-clear-notes"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          id="player-scratchpad-input"
          className="scratchpad-textarea"
          value={notesText}
          onChange={e => setNotesText(e.target.value)}
          aria-label="Session scratchpad notes"
          placeholder="Type notes, command outputs, or observations here..."
          data-testid="notes-scratchpad-input"
        />
      </div>
    </div>
  );
};
