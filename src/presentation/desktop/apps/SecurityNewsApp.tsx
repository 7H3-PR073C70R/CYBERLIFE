/**
 * Cyberlife — ParrotSec / Heron Threat Dispatch & Security News Component
 *
 * Real-time threat intelligence portal styled in classical ParrotSec / MATE security fashion.
 * Displays dynamically updating security bulletins, CVE advisories, and Lagos Island
 * telemetry that evolves day-by-day based on player investigation milestones.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { getArticlesForState, NewsCategory, ThreatSeverity } from '@/simulation/cyber/news';

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
        backgroundColor: '#090d16',
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
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
          backgroundColor: '#0d1526',
          borderBottom: '1px solid #1e293b',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.05em',
              color: '#38bdf8',
            }}
          >
            PARROTSEC / HERON THREAT DISPATCH
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              backgroundColor: '#1e293b',
              padding: '0.15rem 0.45rem',
              borderRadius: 4,
            }}
          >
            WEST AFRICA CERT FEED
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.75rem' }}>
          <span>{calendar.dateString}</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{calendar.timeString} WAT</span>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: '#0a101f',
          borderBottom: '1px solid #1e293b',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(Object.keys(CATEGORY_LABELS) as Array<NewsCategory | 'ALL'>).map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? '#0284c7' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: 'none',
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

        <div
          style={{ display: 'flex', alignItems: 'center', minWidth: 200, flex: 1, maxWidth: 300 }}
        >
          <input
            type="text"
            placeholder="Search CVE, IOCs, hosts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 4,
              padding: '0.35rem 0.6rem',
              color: '#f8fafc',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          />
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
                  backgroundColor: '#0f172a',
                  border: `1px solid ${isExpanded ? sev.border : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '0.9rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, transform 0.1s ease',
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
                      }}
                    >
                      {article.severity}
                    </span>

                    {article.cve && (
                      <span
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 3,
                        }}
                      >
                        {article.cve}
                      </span>
                    )}

                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{article.source}</span>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {article.publishedDate}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: '0 0 0.4rem 0',
                    fontSize: '0.92rem',
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
                    fontSize: '0.82rem',
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
                      borderTop: '1px solid #1e293b',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          marginBottom: '0.35rem',
                        }}
                      >
                        TACTICAL ANALYSIS & DISPATCH DETAILS:
                      </div>
                      {article.content.map((p, idx) => (
                        <p
                          key={idx}
                          style={{
                            margin: '0 0 0.45rem 0',
                            fontSize: '0.8rem',
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
                          style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: '0.4rem' }}
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
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 3,
                              marginRight: '0.35rem',
                              marginBottom: '0.25rem',
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
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
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
                                backgroundColor: copiedIoc === ioc ? '#065f46' : '#111827',
                                color: copiedIoc === ioc ? '#34d399' : '#a7f3d0',
                                border: '1px solid #1e293b',
                                borderRadius: 4,
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
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
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Reporter: {article.author}</span>
                      <span>Verified: Heron CERT Security Pipeline</span>
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
