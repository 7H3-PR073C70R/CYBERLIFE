/**
 * Cyberlife — Encrypted Journal Desktop Application Component
 *
 * Diegetic desktop reader for ~/.vault/journal.enc:
 * - Reads authoritative unlocked journal entries and claims.
 * - Addressed directly to the player ('you') in gender-neutral voice.
 * - Renders forensic assertions with status badges and evidence links.
 * - Hardware enclave seal indicator.
 */

import React, { useState } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { EPISODE_01_JOURNAL_ENTRIES } from '@/simulation/narrative/episodeData';
import { JournalEntry, JournalClaim } from '@/simulation/narrative/episodeTypes';

export const JournalApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const entryParam = urlParams?.get('entry');
  const unlockedIds = entryParam === 'ep01_journal_02'
    ? ['ep01_journal_01', 'ep01_journal_02']
    : (sim?.state.episode?.unlockedJournalEntryIds ?? ['ep01_journal_01']);

  // All authored entries across episodes
  const allEntries: JournalEntry[] = EPISODE_01_JOURNAL_ENTRIES;

  // Filter only unlocked entries
  const unlockedEntries = allEntries.filter(e => unlockedIds.includes(e.id));
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    entryParam ?? unlockedEntries[0]?.id ?? ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedEntry =
    unlockedEntries.find(e => e.id === selectedEntryId) ?? unlockedEntries[0];

  const filteredClaims = (selectedEntry?.claims ?? []).filter(claim => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      claim.claimId.toLowerCase().includes(q) ||
      claim.statement.toLowerCase().includes(q) ||
      (claim.evidenceRef && claim.evidenceRef.toLowerCase().includes(q))
    );
  });

  const getClaimBadge = (claim: JournalClaim) => {
    switch (claim.truthfulness) {
      case 'TRUE':
        return {
          label: 'VERIFIED TRUE',
          bg: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
          border: 'rgba(34, 197, 94, 0.4)',
        };
      case 'CONTRADICTED':
        return {
          label: 'CONTRADICTED BY EVIDENCE',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.4)',
        };
      case 'FALSE':
        return {
          label: 'REFUTED FALSE',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.4)',
        };
      default:
        return {
          label: 'UNVERIFIED ASSERTION',
          bg: 'rgba(148, 163, 184, 0.12)',
          color: '#94a3b8',
          border: 'rgba(148, 163, 184, 0.3)',
        };
    }
  };

  return (
    <div
      data-testid="journal-app"
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: '#0a0f1d',
        color: '#f1f5f9',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar: Entry Index */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#070b14',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Encrypted Vault Journal
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            ~/.vault/journal.enc // AES-256-GCM
          </div>
        </div>

        {/* Entry List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {unlockedEntries.length === 0 ? (
            <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
              No decrypted journal entries unlocked yet. Progress through episodes to unlock reflections.
            </div>
          ) : (
            unlockedEntries.map(entry => {
              const isSelected = entry.id === selectedEntry?.id;
              return (
                <div
                  key={entry.id}
                  data-testid={`journal-entry-${entry.id}`}
                  onClick={() => setSelectedEntryId(entry.id)}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.35rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? 'rgba(56, 189, 248, 0.12)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(56, 189, 248, 0.35)'
                      : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isSelected ? '#38bdf8' : '#e2e8f0',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {entry.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {entry.timestampString}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Seal */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>🔒</span>
          <span>HARDWARE ENCLAVE VERIFIED</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0b1120',
          overflowY: 'auto',
          padding: '2rem',
        }}
      >
        {!selectedEntry ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: '#64748b',
              maxWidth: '400px',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📓</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No Entry Selected</div>
            <div style={{ fontSize: '0.85rem' }}>
              Select a decrypted journal entry from the index to inspect your reflection and forensic assertions.
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Entry Header */}
            <div
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 600,
                  }}
                >
                  DECRYPTED ENTRY // {selectedEntry.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {selectedEntry.timestampString}
                </span>
              </div>
              <h1
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {selectedEntry.title}
              </h1>
            </div>

            {/* Entry Text */}
            <div
              style={{
                lineHeight: 1.8,
                fontSize: '0.95rem',
                color: '#cbd5e1',
                marginBottom: '2.5rem',
                whiteSpace: 'pre-line',
              }}
            >
              {selectedEntry.text}
            </div>

            {/* Forensic Assertions & Claims Section */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#e2e8f0',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>🔍</span>
                  <span>Forensic Assertions & Claims ({filteredClaims.length})</span>
                </div>
                <input
                  type="text"
                  data-testid="journal-search-input"
                  placeholder="Filter assertions or evidence..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    padding: '0.35rem 0.65rem',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '220px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredClaims.map(claim => {
                  const badge = getClaimBadge(claim);
                  return (
                    <div
                      key={claim.claimId}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem',
                          gap: '1rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            color: '#94a3b8',
                          }}
                        >
                          {claim.claimId}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: '#e2e8f0',
                          lineHeight: 1.5,
                          marginBottom: claim.evidenceRef ? '0.5rem' : 0,
                        }}
                      >
                        "{claim.statement}"
                      </div>

                      {claim.evidenceRef && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#f59e0b',
                            fontFamily: '"JetBrains Mono", monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <span>📁</span>
                          <span>Evidence Reference: {claim.evidenceRef}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
