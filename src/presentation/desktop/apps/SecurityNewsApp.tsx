/**
 * Cyberlife — ParrotSec / Orion Threat Dispatch & Security News Component
 *
 * Real-time threat intelligence portal styled in standard Heron OS fashion.
 * Displays dynamically updating security bulletins, CVE advisories, and Lagos Island
 * telemetry that evolves day-by-day based on player investigation milestones.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { getArticlesForState, NewsCategory, ThreatSeverity } from '@/simulation/cyber/news';
import { OsIcon } from '../icons/OsIcons';

export interface SecurityNewsAppProps {
  onOpenApp?: (appId: string) => void;
}

const CATEGORY_LABELS: Record<NewsCategory | 'ALL', string> = {
  ALL: 'All Feeds',
  VULNERABILITY: 'CVE Advisories',
  REGIONAL_ALERT: 'Regional Telemetry',
  CEDARLINE_INTERNAL: 'Cedarline SOC',
  DARK_WEB: 'Dark Web Dispatches',
  DEFENSE_TOOLING: 'Tool Releases',
};

const SEVERITY_COLORS: Record<ThreatSeverity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' },
  HIGH: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#f59e0b' },
  MEDIUM: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' },
  INFO: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '#10b981' },
};

export const SecurityNewsApp: React.FC<SecurityNewsAppProps> = () => {
  const sim = useOptionalSimulation();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('news-001');
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  const calendar = sim?.state.time.calendar ?? {
    timeString: '08:00 AM',
    dateString: 'Monday, Oct 12, 2026',
    day: 12,
  };

  // Retrieve articles dynamically reflecting player progress, world flags, and simulation calendar
  const articles = useMemo(() => {
    return getArticlesForState(sim?.state);
  }, [sim?.state]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (selectedCategory !== 'ALL' && article.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.cve?.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.affectedSystems?.some(s => s.toLowerCase().includes(q)) ||
        article.iocs?.some(i => i.toLowerCase().includes(q))
      );
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleCopyIoc = (ioc: string) => {
    navigator.clipboard?.writeText(ioc).catch(() => {});
    setCopiedIoc(ioc);
    setTimeout(() => setCopiedIoc(null), 1800);
  };

  return (
    <div
      className="security-news-container"
      data-testid="security-news-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#070b13',
        color: '#e2e8f0',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner / Feed Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          backgroundColor: '#0c1220',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
            }}
          >
            <OsIcon name="securityNews" size={16} color="#00e5ff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  color: '#38bdf8',
                }}
              >
                PARROTSEC / Orion THREAT DISPATCH
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Standard Threat Intelligence &amp; CVE Advisory Terminal
            </div>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '0.2rem 0.5rem',
              borderRadius: 4,
              letterSpacing: '0.03em',
            }}
          >
            WEST AFRICA CERT FEED
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#cbd5e1' }}>{calendar.dateString}</span>
          <span style={{ color: '#00e5ff', fontWeight: 600, fontFamily: 'monospace' }}>
            {calendar.timeString} WAT
          </span>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: '#090e1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(Object.keys(CATEGORY_LABELS) as Array<NewsCategory | 'ALL'>).map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? '#0284c7' : 'rgba(30, 41, 59, 0.5)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 4,
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', minWidth: 220, flex: 1, maxWidth: 320 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '8px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#64748b',
              }}
            >
              <OsIcon name="search" size={13} color="#64748b" />
            </span>
            <input
              type="text"
              placeholder="Search CVE, IOCs, hosts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 4,
                padding: '0.35rem 0.6rem 0.35rem 1.8rem',
                color: '#f8fafc',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Articles Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {filteredArticles.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            No threat intelligence bulletins match current filters or search query.
          </div>
        ) : (
          filteredArticles.map(article => {
            const isExpanded = expandedArticleId === article.id;
            const sev = SEVERITY_COLORS[article.severity];

            return (
              <article
                key={article.id}
                onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                style={{
                  backgroundColor: '#0d1526',
                  border: `1px solid ${isExpanded ? sev.border : 'rgba(56, 189, 248, 0.15)'}`,
                  borderRadius: 8,
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isExpanded ? `0 4px 16px ${sev.bg}` : '0 2px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.45rem',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: sev.bg,
                        color: sev.text,
                        border: `1px solid ${sev.border}`,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 3,
                        letterSpacing: '0.04em',
                        fontFamily: 'monospace',
                      }}
                    >
                      {article.severity}
                    </span>

                    {article.cve && (
                      <span
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#38bdf8',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 3,
                          fontFamily: 'monospace',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                        }}
                      >
                        {article.cve}
                      </span>
                    )}

                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{article.source}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {article.publishedDate}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                      {isExpanded ? '▴ Less' : '▾ More'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: '0 0 0.4rem 0',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    lineHeight: 1.4,
                  }}
                >
                  {article.title}
                </h3>

                {/* Summary */}
                <p
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.84rem',
                    color: '#94a3b8',
                    lineHeight: 1.5,
                  }}
                >
                  {article.summary}
                </p>

                {/* Expanded Detailed Writeup */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#38bdf8',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: '0.45rem',
                        }}
                      >
                        TACTICAL ANALYSIS &amp; DISPATCH DETAILS:
                      </div>
                      {article.content.map((p, idx) => (
                        <p
                          key={idx}
                          style={{
                            margin: '0 0 0.45rem 0',
                            fontSize: '0.82rem',
                            color: '#cbd5e1',
                            lineHeight: 1.55,
                          }}
                        >
                          {p}
                        </p>
                      ))}
                    </div>

                    {/* Affected Systems */}
                    {article.affectedSystems && article.affectedSystems.length > 0 && (
                      <div style={{ marginBottom: '0.65rem' }}>
                        <span
                          style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}
                        >
                          Target Endpoints:
                        </span>
                        {article.affectedSystems.map(sys => (
                          <span
                            key={sys}
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#1e293b',
                              color: '#38bdf8',
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 3,
                              marginRight: '0.35rem',
                              marginBottom: '0.25rem',
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                            }}
                          >
                            {sys}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* IoCs & Hashes */}
                    {article.iocs && article.iocs.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.35rem',
                          }}
                        >
                          INDICATORS OF COMPROMISE (IoCs):
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {article.iocs.map(ioc => (
                            <button
                              key={ioc}
                              type="button"
                              onClick={() => handleCopyIoc(ioc)}
                              title="Click to copy IoC indicator"
                              style={{
                                backgroundColor: copiedIoc === ioc ? 'rgba(16, 185, 129, 0.2)' : '#0f172a',
                                color: copiedIoc === ioc ? '#34d399' : '#a7f3d0',
                                border: `1px solid ${copiedIoc === ioc ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                                borderRadius: 4,
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontFamily: 'monospace',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>{copiedIoc === ioc ? '✓ Copied' : '📋'}</span>
                              <code>{ioc}</code>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Reporter: <strong style={{ color: '#94a3b8' }}>{article.author}</strong></span>
                      <span>Verified: <strong style={{ color: '#38bdf8' }}>Orion CERT Security Pipeline</strong></span>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
