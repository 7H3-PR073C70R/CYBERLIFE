/**
 * Cyberlife — EkoSec File Manager Application
 *
 * Graphical interface for the synthetic in-memory virtual filesystem.
 * Provides sidebar navigation, directory browsing, permissions display,
 * file previews, and isolated virtual file creation in /home/analyst.
 */

import React, { useState } from 'react';
import {
  virtualFilesystem,
  resolveVirtualPath,
  VirtualFileEntry,
} from '@/simulation/cyber/filesystem';

export const FileManagerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/home/analyst');
  const [selectedEntry, setSelectedEntry] = useState<VirtualFileEntry | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [pathInput, setPathInput] = useState<string>('/home/analyst');
  const [newFileName, setNewFileName] = useState<string>('');
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Quick navigation bookmarks
  const bookmarks = [
    { name: 'Home (/home/analyst)', path: '/home/analyst', icon: '🏠' },
    { name: 'System Logs (/var/log)', path: '/var/log', icon: '📜' },
    { name: 'Evidence Vault (/mnt/evidence)', path: '/mnt/evidence', icon: '🔒' },
    { name: 'Security Config (/etc/security)', path: '/etc/security', icon: '⚙️' },
    { name: 'Security Tools (/opt/tools)', path: '/opt/tools', icon: '🛠️' },
  ];

  // List current directory contents
  const [currentEntries, setCurrentEntries] = useState<VirtualFileEntry[]>(() => {
    return virtualFilesystem.listDirectory('/home/analyst') ?? [];
  });

  const handleNavigate = (targetPath: string) => {
    const entry = virtualFilesystem.getEntry(targetPath);
    if (!entry) {
      setStatusMessage(`Error: Path '${targetPath}' not found.`);
      return;
    }
    if (entry.type !== 'directory') {
      handleSelectFile(entry);
      return;
    }
    setCurrentPath(targetPath);
    setPathInput(targetPath);
    setSelectedEntry(null);
    setPreviewContent(null);
    setStatusMessage(null);
    setCurrentEntries(virtualFilesystem.listDirectory(targetPath) ?? []);
  };

  const handleSelectFile = (entry: VirtualFileEntry) => {
    setSelectedEntry(entry);
    if (entry.type === 'file') {
      const file = virtualFilesystem.readFile(entry.path);
      setPreviewContent(file ? file.content : '(empty file or unreadable)');
    } else {
      setPreviewContent(null);
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    handleNavigate(parentPath);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const sanitizedName = newFileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = resolveVirtualPath(currentPath, sanitizedName);

    const result = virtualFilesystem.writeFile(
      filePath,
      `# Cyberlife Synthetic Analyst Note\nCreated: ${new Date().toISOString()}\nPath: ${filePath}\n\n[Findings and hypotheses go here]\n`
    );

    if (result.success) {
      setNewFileName('');
      setIsCreatingFile(false);
      setSelectedEntry(null);
      setPreviewContent(null);
      setStatusMessage(`Created virtual file: ${filePath}`);
      setCurrentEntries(virtualFilesystem.listDirectory(currentPath) ?? []);
    } else {
      setStatusMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div
      className="file-manager-container"
      role="region"
      aria-label="EkoSec Virtual File Manager"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.85rem',
      }}
    >
      {/* Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <button
          type="button"
          onClick={handleGoUp}
          disabled={currentPath === '/'}
          style={{
            padding: '4px 8px',
            backgroundColor: currentPath === '/' ? '#21262d' : '#238636',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPath === '/' ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
          title="Parent Directory"
        >
          ⬆ Up
        </button>

        <span style={{ color: '#8b949e' }}>Path:</span>
        <input
          type="text"
          value={pathInput}
          onChange={e => setPathInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleNavigate(pathInput);
          }}
          style={{
            flex: 1,
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '4px',
            color: '#58a6ff',
            padding: '4px 8px',
            fontFamily: 'monospace',
          }}
        />
        <button
          type="button"
          onClick={() => handleNavigate(pathInput)}
          style={{
            padding: '4px 10px',
            backgroundColor: '#1f6feb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go
        </button>

        {currentPath.startsWith('/home/analyst') && (
          <button
            type="button"
            onClick={() => setIsCreatingFile(!isCreatingFile)}
            style={{
              padding: '4px 10px',
              backgroundColor: '#30363d',
              color: '#3fb950',
              border: '1px solid #3fb950',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + New File
          </button>
        )}
      </div>

      {/* New File Inline Form */}
      {isCreatingFile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#1f242c',
            borderBottom: '1px solid #30363d',
          }}
        >
          <span style={{ color: '#3fb950' }}>Filename:</span>
          <input
            type="text"
            placeholder="my_notes.txt"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            style={{
              padding: '2px 8px',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#fff',
              borderRadius: '4px',
            }}
          />
          <button
            type="button"
            onClick={handleCreateFile}
            style={{
              padding: '2px 8px',
              backgroundColor: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFile(false)}
            style={{
              padding: '2px 8px',
              backgroundColor: '#30363d',
              color: '#c9d1d9',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Bookmarks Sidebar */}
        <div
          style={{
            width: '200px',
            backgroundColor: '#161b22',
            borderRight: '1px solid #30363d',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8b949e',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Locations
          </div>
          {bookmarks.map(bm => {
            const isActive = currentPath === bm.path;
            return (
              <button
                key={bm.path}
                type="button"
                onClick={() => handleNavigate(bm.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  backgroundColor: isActive ? '#1f6feb' : 'transparent',
                  color: isActive ? '#fff' : '#c9d1d9',
                  border: 'none',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <span>{bm.icon}</span>
                <span
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {bm.name}
                </span>
              </button>
            );
          })}

          <div
            style={{
              marginTop: 'auto',
              padding: '6px',
              backgroundColor: '#0d1117',
              borderRadius: '4px',
              border: '1px solid #21262d',
              fontSize: '0.7rem',
              color: '#8b949e',
            }}
          >
            <div style={{ color: '#58a6ff', fontWeight: 600 }}>🛡️ Isolated Sandbox</div>
            <div>Read-only system directories (/var, /etc, /mnt, /opt).</div>
          </div>
        </div>

        {/* Center File List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {currentEntries.length === 0 ? (
            <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '12px' }}>
              (Empty directory)
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    color: '#8b949e',
                    borderBottom: '1px solid #30363d',
                    fontSize: '0.75rem',
                  }}
                >
                  <th style={{ padding: '6px' }}>Name</th>
                  <th style={{ padding: '6px' }}>Permissions</th>
                  <th style={{ padding: '6px' }}>Size</th>
                  <th style={{ padding: '6px' }}>Owner</th>
                  <th style={{ padding: '6px' }}>Modified</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map(entry => {
                  const isSelected = selectedEntry?.path === entry.path;
                  const isDir = entry.type === 'directory';

                  return (
                    <tr
                      key={entry.path}
                      onClick={() => handleSelectFile(entry)}
                      onDoubleClick={() => {
                        if (isDir) handleNavigate(entry.path);
                      }}
                      style={{
                        backgroundColor: isSelected ? '#1f6feb22' : 'transparent',
                        borderBottom: '1px solid #21262d',
                        cursor: 'pointer',
                      }}
                    >
                      <td
                        style={{
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{isDir ? '📁' : '📄'}</span>
                        <span
                          style={{
                            color: isDir ? '#58a6ff' : '#c9d1d9',
                            fontWeight: isDir ? 600 : 400,
                          }}
                        >
                          {entry.name}
                        </span>
                        {entry.readOnly && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              backgroundColor: '#21262d',
                              color: '#8b949e',
                              padding: '1px 4px',
                              borderRadius: '3px',
                            }}
                          >
                            RO
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px', fontFamily: 'monospace', color: '#8b949e' }}>
                        {entry.permissions}
                      </td>
                      <td style={{ padding: '6px', color: '#8b949e' }}>
                        {isDir ? '-' : `${entry.sizeBytes} B`}
                      </td>
                      <td style={{ padding: '6px', color: '#8b949e' }}>{entry.owner}</td>
                      <td style={{ padding: '6px', color: '#8b949e', fontSize: '0.75rem' }}>
                        {entry.modifiedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Preview Pane (if file selected) */}
        {selectedEntry && (
          <div
            style={{
              width: '320px',
              backgroundColor: '#161b22',
              borderLeft: '1px solid #30363d',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#58a6ff' }}>Preview</span>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b949e',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
              <div>
                <strong>Name:</strong> {selectedEntry.name}
              </div>
              <div>
                <strong>Path:</strong> {selectedEntry.path}
              </div>
              <div>
                <strong>Type:</strong> {selectedEntry.type}
              </div>
              <div>
                <strong>Permissions:</strong> {selectedEntry.permissions}
              </div>
              <div>
                <strong>Size:</strong> {selectedEntry.sizeBytes} bytes
              </div>
            </div>

            {selectedEntry.type === 'file' && (
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto',
                  color: '#e6edf3',
                  maxHeight: '260px',
                }}
              >
                {previewContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div
        style={{
          padding: '4px 12px',
          backgroundColor: '#161b22',
          borderTop: '1px solid #30363d',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#8b949e',
        }}
      >
        <span>{statusMessage ?? `${currentEntries.length} items in ${currentPath}`}</span>
        <span>EkoSec Linux Virtual VFS</span>
      </div>
    </div>
  );
};
