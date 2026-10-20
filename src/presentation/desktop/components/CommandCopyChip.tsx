import React, { useState } from 'react';

export interface CommandCopyChipProps {
  command: string;
  label?: string;
  description?: string;
}

export const CommandCopyChip: React.FC<CommandCopyChipProps> = ({
  command,
  label,
  description,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [pasted, setPasted] = useState<boolean>(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(command);
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteToTerminal = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(command);
      }
    } catch {
      // Fallback
    }

    // Open & focus Terminal window
    window.dispatchEvent(
      new CustomEvent('cyberlife:desktop:open-app', {
        detail: { appId: 'terminal' },
      })
    );

    // Paste command into active terminal tab input
    window.dispatchEvent(
      new CustomEvent('cyberlife:terminal:paste', {
        detail: { command, execute: false },
      })
    );

    setPasted(true);
    setTimeout(() => setPasted(false), 2000);
  };

  return (
    <div
      className="command-copy-chip"
      data-testid={`command-chip-${command.replace(/[^a-z0-9]/gi, '_')}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
        {label && (
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
            {label}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#00ff66', fontWeight: 700, userSelect: 'none' }}>$</span>
          <code className="command-text" title={command}>
            {command}
          </code>
        </div>
        {description && (
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
            {description}
          </span>
        )}
      </div>

      <div className="command-copy-actions">
        <button
          type="button"
          className={`btn-command-action btn-command-copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy command to clipboard"
          aria-label={`Copy command ${command}`}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>

        <button
          type="button"
          className="btn-command-action btn-command-terminal"
          onClick={handlePasteToTerminal}
          title="Paste into Terminal window"
          aria-label={`Paste command ${command} in Terminal`}
        >
          {pasted ? '✓ Pasted!' : '▶ Paste in Terminal'}
        </button>
      </div>
    </div>
  );
};
