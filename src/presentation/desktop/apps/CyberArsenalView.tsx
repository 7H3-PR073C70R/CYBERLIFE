/**
 * Cyberlife — Cyber Arsenal & Shared Tool Architecture View
 *
 * Integrated into CyberCatalogueApp. Displays the complete registry of cybersecurity tools
 * across Blue Team, Red Team, Purple Team, Threat Intelligence, Forensics, and Shared Fundamentals.
 *
 * Enforces honest capability statuses:
 * - 'playable': Real, tested workflow with deterministic execution.
 * - 'partial': Interactive GUI viewer or basic command; missing dynamic engine.
 * - 'reference_only': Educational theory and reference documentation only.
 * - 'planned': Scoped for future milestones (M14–M18).
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GLOBAL_CYBER_ARSENAL_REGISTRY,
  CyberToolDefinition,
  TeamTrack,
  CapabilityStatus,
  ToolCategory,
} from '@/simulation/cyber/arsenal';
import { AppId } from '../types';

export interface CyberArsenalViewProps {
  readonly onOpenApp?: (appId: AppId) => void;
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  network_discovery: 'Network Discovery',
  traffic_analysis: 'Traffic Analysis',
  intelligence_recon: 'Intelligence & OSINT',
  attack_simulation: 'Offensive Simulation',
  app_security: 'Application Security',
  blue_team_siem: 'Blue Team SIEM',
  network_detection: 'Network Detection',
  endpoint_telemetry: 'Endpoint Telemetry',
  digital_forensics: 'Digital Forensics',
  reverse_engineering: 'Reverse Engineering',
  detection_engineering: 'Detection Engineering',
  purple_team: 'Purple Team Engineering',
  learning_reporting: 'Reporting & Fundamentals',
  system_utilities: 'System Utilities',
};

export const CyberArsenalView: React.FC<CyberArsenalViewProps> = ({ onOpenApp }) => {
  const [selectedTeam, setSelectedTeam] = useState<TeamTrack | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<CapabilityStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>('tool_netmap');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter tools using registry search
  const filteredTools = useMemo(() => {
    return GLOBAL_CYBER_ARSENAL_REGISTRY.searchTools({
      team: selectedTeam,
      status: selectedStatus,
      category: selectedCategory,
      searchQuery,
    });
  }, [selectedTeam, selectedStatus, selectedCategory, searchQuery]);

  // Selected tool definition
  const selectedTool = useMemo<CyberToolDefinition>(() => {
    return (
      GLOBAL_CYBER_ARSENAL_REGISTRY.getTool(selectedToolId) ??
      filteredTools[0] ??
      GLOBAL_CYBER_ARSENAL_REGISTRY.getAllTools()[0]!
    );
  }, [selectedToolId, filteredTools]);

  const relatedTools = useMemo(() => {
    return GLOBAL_CYBER_ARSENAL_REGISTRY.getRelatedTools(selectedTool.id);
  }, [selectedTool.id]);

  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setActionNotice(null), 5000);
  };

  const getTeamBadgeColor = (team: TeamTrack) => {
    switch (team) {
      case 'blue':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' };
      case 'red':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: '#a855f7' };
      case 'intelligence':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#f59e0b' };
      case 'shared':
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '#10b981' };
    }
  };

  const getStatusBadge = (status: CapabilityStatus) => {
    switch (status) {
      case 'playable':
        return {
          label: 'PLAYABLE',
          icon: '🟢',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        };
      case 'partial':
        return {
          label: 'PARTIAL',
          icon: '🟡',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        };
      case 'reference_only':
        return {
          label: 'REFERENCE ONLY',
          icon: '🔵',
          bg: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        };
      case 'planned':
      default:
        return {
          label: 'PLANNED',
          icon: '⚪',
          bg: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.4)',
        };
    }
  };

  const handleToolAction = () => {
    if (selectedTool.status === 'playable') {
      if (selectedTool.linkedAppId && selectedTool.linkedAppId !== 'terminal') {
        if (onOpenApp) {
          onOpenApp(selectedTool.linkedAppId as AppId);
          showNotification(`Opened application '${selectedTool.shortName}' on EkoSec OS desktop.`);
        } else {
          showNotification(
            `Tool is available as desktop application '${selectedTool.linkedAppId}'.`
          );
        }
      } else if (selectedTool.commandSpec) {
        if (onOpenApp) {
          onOpenApp('terminal');
        }
        showNotification(
          `Terminal tool ready! Type '${selectedTool.commandSpec.canonicalCommand}' into the terminal prompt.`
        );
      }
    } else if (selectedTool.status === 'partial') {
      if (selectedTool.linkedAppId && onOpenApp) {
        onOpenApp(selectedTool.linkedAppId as AppId);
        showNotification(
          `Opened partial viewer '${selectedTool.shortName}'. Note: dynamic capture/parsing is limited.`
        );
      } else {
        showNotification(
          `This tool has partial implementation. Check the Field Guide or available commands.`
        );
      }
    } else if (selectedTool.status === 'reference_only') {
      if (onOpenApp) {
        onOpenApp('fieldGuide');
      }
      showNotification(`Viewing theoretical reference material for '${selectedTool.shortName}'.`);
    } else {
      showNotification(
        `This tool is planned for ${selectedTool.targetMilestone}. Live execution is not yet implemented.`
      );
    }
  };

  return (
    <div
      className="cyber-arsenal-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {/* Arsenal Filter Bar */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Team Track Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setSelectedTeam('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'all'
                  ? '1px solid var(--color-accent-cyan)'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'all'
                  ? 'rgba(56, 189, 248, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color:
                selectedTeam === 'all' ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            All Tracks ({GLOBAL_CYBER_ARSENAL_REGISTRY.getAllTools().length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('blue')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'blue'
                  ? '1px solid #3b82f6'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'blue'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color: selectedTeam === 'blue' ? '#60a5fa' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🔵 Blue Team
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('red')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'red'
                  ? '1px solid #ef4444'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'red'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color: selectedTeam === 'red' ? '#f87171' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🔴 Red Team
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('purple')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'purple'
                  ? '1px solid #a855f7'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'purple'
                  ? 'rgba(168, 85, 247, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color: selectedTeam === 'purple' ? '#c084fc' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🟣 Purple Team
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('intelligence')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'intelligence'
                  ? '1px solid #f59e0b'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'intelligence'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color: selectedTeam === 'intelligence' ? '#fbbf24' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🟡 Threat Intel
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('shared')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedTeam === 'shared'
                  ? '1px solid #10b981'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                selectedTeam === 'shared'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color: selectedTeam === 'shared' ? '#34d399' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🟢 Shared Fundamentals
          </button>
        </div>

        {/* Search, Status & Category Row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search tools by name, command, capability, inspiration..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="arsenal-search-input"
              style={{
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: '0.82rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as CapabilityStatus | 'all')}
              data-testid="arsenal-status-filter"
              style={{
                padding: '6px 8px',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8rem',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="playable">🟢 Playable (Verified)</option>
              <option value="partial">🟡 Partial (Viewer/CLI)</option>
              <option value="reference_only">🔵 Reference Only</option>
              <option value="planned">⚪ Planned (M14–M18)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as ToolCategory | 'all')}
              style={{
                padding: '6px 8px',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8rem',
              }}
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <option key={cat} value={cat}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          data-testid="arsenal-action-notice"
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--color-accent-cyan)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>ℹ️ {actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Two-Column View */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Column: Tools List */}
        <div
          style={{
            width: '320px',
            borderRight: '1px solid var(--color-border-subtle)',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-text-muted)',
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Showing {filteredTools.length} tool(s)
          </div>

          {filteredTools.map(tool => {
            const isSelected = tool.id === selectedTool.id;
            const statusInfo = getStatusBadge(tool.status);
            const teamBadge = getTeamBadgeColor(tool.primaryTeam);

            return (
              <div
                key={tool.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedToolId(tool.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedToolId(tool.id);
                  }
                }}
                data-testid={`tool-item-${tool.id}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected
                    ? 'var(--color-bg-surface-elevated)'
                    : 'var(--color-bg-surface)',
                  borderLeft: isSelected
                    ? `3px solid ${teamBadge.border}`
                    : '3px solid transparent',
                  border: isSelected
                    ? `1px solid ${teamBadge.border}`
                    : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{tool.icon}</span>
                    <span
                      style={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: '0.86rem',
                        color: isSelected
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      {tool.shortName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 10,
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      border: statusInfo.border,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  {tool.categoryLabel}
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tool.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Tool Detail Pane */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedTool.icon}</span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                    data-testid="selected-tool-name"
                  >
                    {selectedTool.name}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-accent-cyan)',
                      marginTop: 2,
                    }}
                  >
                    💡 Inspired by {selectedTool.realWorldInspiration}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 12,
                  ...getTeamBadgeColor(selectedTool.primaryTeam),
                  border: `1px solid ${getTeamBadgeColor(selectedTool.primaryTeam).border}`,
                  textTransform: 'uppercase',
                }}
              >
                {selectedTool.primaryTeam} Team
              </span>
              <span
                data-testid="selected-tool-status-badge"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 12,
                  ...getStatusBadge(selectedTool.status),
                }}
              >
                {getStatusBadge(selectedTool.status).icon}{' '}
                {getStatusBadge(selectedTool.status).label}
              </span>
            </div>
          </div>

          {/* Overview & Description */}
          <div style={{ marginBottom: 18 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-muted)',
                marginBottom: 6,
              }}
            >
              Overview & Architecture
            </h4>
            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
              }}
            >
              {selectedTool.description}
            </p>
            <p
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.5,
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              {selectedTool.extendedOverview}
            </p>
          </div>

          {/* Learning Objectives */}
          <div style={{ marginBottom: 18 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-muted)',
                marginBottom: 8,
              }}
            >
              Educational Objectives (Bloom&apos;s Taxonomy)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedTool.learningObjectives.map(obj => (
                <div
                  key={obj.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                      {obj.title}
                    </strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                      {obj.description}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--color-accent-cyan)',
                    }}
                  >
                    {obj.bloomsLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites & Requirements */}
          <div style={{ marginBottom: 18 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-muted)',
                marginBottom: 8,
              }}
            >
              Prerequisites & Access Clearance
            </h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '0.78rem',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Clearance Tier: </span>
                <strong style={{ color: 'var(--color-accent-emerald)' }}>
                  Tier {selectedTool.requiredClearanceTier} (
                  {selectedTool.requiredClearanceTier === 1 ? 'Analyst / Intern' : 'Lead / Admin'})
                </strong>
              </div>

              {selectedTool.prerequisites.length > 0 ? (
                selectedTool.prerequisites.map(prereq => (
                  <div
                    key={prereq}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>Required: </span>
                    <code>{prereq}</code>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  ✓ No previous tools required (Foundational Entrypoint)
                </div>
              )}
            </div>
          </div>

          {/* Command Specification (if applicable) */}
          {selectedTool.commandSpec && (
            <div style={{ marginBottom: 18 }}>
              <h4
                style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 8,
                }}
              >
                Terminal Command Specification
              </h4>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ color: 'var(--color-accent-cyan)', marginBottom: 4 }}>
                  $ {selectedTool.commandSpec.syntax}
                </div>
                {selectedTool.commandSpec.aliases.length > 0 && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                    Aliases: {selectedTool.commandSpec.aliases.join(', ')}
                  </div>
                )}
                {selectedTool.commandSpec.examples.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                      Examples:
                    </div>
                    {selectedTool.commandSpec.examples.map(ex => (
                      <div key={ex} style={{ color: '#34d399', fontSize: '0.76rem' }}>
                        &gt; {ex}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Known Limitations & Roadmap Reality */}
          <div style={{ marginBottom: 20 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-muted)',
                marginBottom: 6,
              }}
            >
              Simulation Boundaries & Known Limitations
            </h4>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor:
                  selectedTool.status === 'playable'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                border:
                  selectedTool.status === 'playable'
                    ? '1px solid rgba(16, 185, 129, 0.25)'
                    : '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              {selectedTool.knownLimitations.length > 0 ? (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: '0.78rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {selectedTool.knownLimitations.map(lim => (
                    <li key={lim}>{lim}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  ✓ Core simulated workflow is verified and fully operational.
                </div>
              )}
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 8,
                }}
              >
                Related Security Tools
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {relatedTools.map(rel => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setSelectedToolId(rel.id)}
                    data-testid={`related-tool-${rel.id}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-accent-cyan)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{rel.icon}</span>
                    <span>{rel.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Launch / Action CTA */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              Target Milestone: <strong>{selectedTool.targetMilestone}</strong>
            </div>

            <button
              type="button"
              onClick={handleToolAction}
              data-testid="btn-arsenal-tool-action"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor:
                  selectedTool.status === 'playable'
                    ? 'var(--color-accent-cyan)'
                    : selectedTool.status === 'partial'
                      ? '#f59e0b'
                      : 'var(--color-bg-surface-elevated)',
                color:
                  selectedTool.status === 'playable'
                    ? '#05090f'
                    : selectedTool.status === 'partial'
                      ? '#05090f'
                      : 'var(--color-text-secondary)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {selectedTool.status === 'playable' && (
                <>
                  <span>🚀</span> Launch {selectedTool.shortName}
                </>
              )}
              {selectedTool.status === 'partial' && (
                <>
                  <span>🔍</span> Inspect Partial Viewer
                </>
              )}
              {selectedTool.status === 'reference_only' && (
                <>
                  <span>📖</span> Study Reference Guide
                </>
              )}
              {selectedTool.status === 'planned' && (
                <>
                  <span>🔒</span> Roadmap Item ({selectedTool.targetMilestone})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
