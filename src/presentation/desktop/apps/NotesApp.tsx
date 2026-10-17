/**
 * Cyberlife — Notes & Activity Application Component
 *
 * Displays fictional in-game IT security onboarding memo, orientation checklist,
 * and a temporary local scratchpad for player notes.
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
    '# Investigation Scratchpad\n- Reviewed initial workstation environment\n- Terminal online and responsive\n'
  );

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
            <strong>Subject:</strong> Workstation Onboarding &amp; Environment Setup
          </div>
        </div>
        <div className="memo-body">
          <p>
            {isCedarline
              ? 'Welcome to the Cedarline Security Operations Center at Marina Tower. Before accessing company production networks or investigating security alerts, please verify that your local terminal node is communicating properly with the simulation clock.'
              : 'Welcome to your private cybersecurity lab on Broad Street. Use this terminal environment to practice defensive tools, explore simulated logs, and conduct independent investigations.'}
          </p>
          <p>
            Start by running <code>status</code> and <code>date</code> in your terminal. If you need
            clarification on any syntax, review the <strong>Field Guide</strong> application.
          </p>
        </div>
      </div>

      {/* Interactive Local Scratchpad */}
      <div className="notes-scratchpad-area">
        <div className="scratchpad-header">
          <label htmlFor="player-scratchpad-input" className="scratchpad-title">
            📝 Local Session Scratchpad
          </label>
          <span className="scratchpad-note">(Temporary session memory only)</span>
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
