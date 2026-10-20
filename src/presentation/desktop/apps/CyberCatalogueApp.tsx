/**
 * Cyberlife — Milestone 11: Cyber Catalogue Application
 *
 * Provides a comprehensive, beginner-accessible cybersecurity learning hub
 * spanning:
 * 1. Blue Team — Defenders (SOC, Incident Response, Detection, IAM)
 * 2. Red Team — Authorized Attack Simulators (RoE, Recon, Identity Paths, Findings)
 * 3. Purple Team — Collaborative Security Improvement (Detection Engineering Loop)
 * 4. Shared Foundations — Networking, OS, Web, Crypto, Ethics & Legal Authorization
 *
 * Fully integrated with authoritative simulation state, career pathways,
 * and persistent progress.
 */

import React, { useState, useMemo } from 'react';
import { useSimulation } from '@/application/simulation/SimulationContext';
import {
  CATALOGUE_ENTRIES,
  PRACTICAL_EXERCISES,
} from '@/simulation/catalogue/catalogueDefinitions';
import {
  CatalogueEntry,
  CyberTrack,
  DifficultyLevel,
  PracticalExercise,
  DetectionRuleField,
  DetectionRuleOperator,
} from '@/simulation/catalogue/types';
import { AppId } from '../types';
import { CyberArsenalView } from './CyberArsenalView';
import { GLOBAL_CYBER_ARSENAL_REGISTRY } from '@/simulation/cyber/arsenal';

export interface CyberCatalogueAppProps {
  readonly onOpenApp?: (appId: AppId) => void;
  readonly initialMode?: 'modules' | 'arsenal';
}

export const CyberCatalogueApp: React.FC<CyberCatalogueAppProps> = ({
  onOpenApp,
  initialMode = 'modules',
}) => {
  const { state, dispatch } = useSimulation();
  const catalogueState = state.catalogue;

  // View Mode: Learning Modules & Scenarios vs Cybersecurity Arsenal
  const [viewMode, setViewMode] = useState<'modules' | 'arsenal'>(initialMode);

  // UI state
  const [selectedTrack, setSelectedTrack] = useState<CyberTrack | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'available' | 'completed' | 'planned'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string>('cat_blue_soc_monitoring');

  // Exercise interactive state for Red Team finding form
  const [redFindingTitle, setRedFindingTitle] = useState(
    'Over-permissioned Domain Share Lateral Movement'
  );
  const [redFindingHost, setRedFindingHost] = useState('filesrv-01');
  const [redFindingService, setRedFindingService] = useState('SMB (Port 445)');
  const [redFindingSeverity, setRedFindingSeverity] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  >('HIGH');
  const [redFindingVector, setRedFindingVector] = useState(
    'Stolen service account session ticket reused on unrestricted internal file share.'
  );
  const [redFindingRemediation, setRedFindingRemediation] = useState(
    'Enforce strict SMB signing, restrict svc-aster logon rights to app-portal-01 only, and segment subnet 10.0.4.0/24.'
  );

  // Detection rule editor state (Purple Team)
  const [editedRuleField, setEditedRuleField] = useState<DetectionRuleField>('source');
  const [editedRuleOperator, setEditedRuleOperator] = useState<DetectionRuleOperator>('EQUALS');
  const [editedRuleValue, setEditedRuleValue] = useState<string>('file-server');
  const [editedRuleSeverity, setEditedRuleSeverity] = useState<'INFO' | 'WARN' | 'CRITICAL'>(
    'CRITICAL'
  );
  const [editedRuleEnabled, setEditedRuleEnabled] = useState<boolean>(true);
  const [tuningMessage, setTuningMessage] = useState<string | null>(null);

  // Active completed entries & exercises from authoritative simulation state
  const completedEntries = useMemo(
    () => catalogueState?.completedEntryIds ?? [],
    [catalogueState?.completedEntryIds]
  );
  const completedExercises = catalogueState?.completedExerciseIds ?? [];
  const activeExId = catalogueState?.activeExerciseId ?? null;
  const purpleHistory = catalogueState?.purpleRunHistory ?? [];
  const redFindings = catalogueState?.redFindings ?? [];

  // Filtered catalogue entries
  const filteredEntries = useMemo(() => {
    return CATALOGUE_ENTRIES.filter(entry => {
      // Track filter
      if (selectedTrack !== 'all' && entry.track !== selectedTrack) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && entry.difficulty !== selectedDifficulty) {
        return false;
      }
      // Status filter
      const isCompleted = completedEntries.includes(entry.id);
      if (selectedStatus === 'completed' && !isCompleted) return false;
      if (selectedStatus === 'available' && (isCompleted || entry.status === 'planned'))
        return false;
      if (selectedStatus === 'planned' && entry.status !== 'planned') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesDesc = entry.description.toLowerCase().includes(query);
        const matchesDiscipline = entry.discipline.toLowerCase().includes(query);
        const matchesTools = entry.relevantTools.some(t => t.toLowerCase().includes(query));
        const matchesRoles = entry.relatedRoleIds.some(r => r.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesDiscipline && !matchesTools && !matchesRoles) {
          return false;
        }
      }
      return true;
    });
  }, [selectedTrack, selectedDifficulty, selectedStatus, searchQuery, completedEntries]);

  // Selected entry definition
  const selectedEntry = useMemo<CatalogueEntry>(() => {
    return CATALOGUE_ENTRIES.find(e => e.id === selectedEntryId) ?? CATALOGUE_ENTRIES[0]!;
  }, [selectedEntryId]);

  // Associated practical exercise if present
  const associatedExercise = useMemo<PracticalExercise | undefined>(() => {
    if (!selectedEntry?.exerciseId) return undefined;
    return PRACTICAL_EXERCISES.find(ex => ex.id === selectedEntry.exerciseId);
  }, [selectedEntry]);

  const isExerciseActive = activeExId === associatedExercise?.id;
  const isExerciseCompleted = associatedExercise
    ? completedExercises.includes(associatedExercise.id)
    : false;

  // Active exercise runtime state
  const exerciseState = (catalogueState?.activeExerciseState ?? {}) as Record<string, unknown>;
  const completedObjectiveIds = Array.isArray(exerciseState.completedObjectiveIds)
    ? (exerciseState.completedObjectiveIds as string[])
    : [];
  const acceptedRoe = Boolean(exerciseState.acceptedRoe);

  // Purple Team current rule
  const smbRule = catalogueState?.detectionRules.find(r => r.id === 'RULE-DET-SMB-LATERAL');
  const latestPurpleRun = purpleHistory[0];

  // Handlers
  const handleStartExercise = (exId: string) => {
    dispatch({ type: 'StartCatalogueExercise', exerciseId: exId });
  };

  const handleResetExercise = (exId: string) => {
    dispatch({ type: 'ResetCatalogueExercise', exerciseId: exId });
  };

  const handleCompleteExercise = (exId: string) => {
    dispatch({ type: 'CompleteCatalogueExercise', exerciseId: exId });
  };

  const handleAcceptRoe = () => {
    dispatch({
      type: 'SubmitExerciseAction',
      actionType: 'ACCEPT_ROE',
    });
  };

  const handleBlueAction = (objId: string) => {
    dispatch({
      type: 'SubmitExerciseAction',
      actionType: 'RECORD_OBJECTIVE',
      payload: { objectiveId: objId },
    });
  };

  const handleSubmitRedFinding = () => {
    dispatch({
      type: 'SubmitRedTeamFinding',
      findingData: {
        title: redFindingTitle,
        targetHost: redFindingHost,
        targetService: redFindingService,
        severity: redFindingSeverity,
        attackVector: redFindingVector,
        evidenceId: 'EV-SMB-AUTH-TICKET-01',
        rootCause: 'Privileged service account tokens accepted without host-origin verification.',
        remediationAdvice: redFindingRemediation,
      },
    });
  };

  const handleSaveTunedRule = () => {
    dispatch({
      type: 'TuneDetectionRule',
      ruleId: 'RULE-DET-SMB-LATERAL',
      updates: {
        matchField: editedRuleField,
        operator: editedRuleOperator,
        matchValue: editedRuleValue,
        alertSeverity: editedRuleSeverity,
        enabled: editedRuleEnabled,
      },
    });
    setTuningMessage('Detection rule parameters updated and compiled into SIEM engine.');
    setTimeout(() => setTuningMessage(null), 4000);
  };

  const handleRunPurple = (runType: 'baseline' | 'replay') => {
    dispatch({
      type: 'RunPurpleScenario',
      runType,
    });
  };

  const getTrackColor = (track: CyberTrack) => {
    switch (track) {
      case 'blue':
        return '#3b82f6';
      case 'red':
        return '#ef4444';
      case 'purple':
        return '#a855f7';
      case 'shared':
        return '#10b981';
    }
  };

  return (
    <div
      className="cyber-catalogue-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top Header & Search Bar */}
      <header
        className="catalogue-header"
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🛡️</span> Cyber Catalogue
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--color-accent-cyan)',
                }}
              >
                Milestone 11 Edition
              </span>
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.82rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Blue Team Defenders · Red Team Attack Simulators · Purple Team Collaborative
              Validation · Shared Foundations
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
              <div style={{ color: 'var(--color-text-muted)' }}>Progress</div>
              <div style={{ fontWeight: 600, color: 'var(--color-accent-emerald)' }}>
                {completedExercises.length} / {PRACTICAL_EXERCISES.length} Exercises Completed
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Modules vs Arsenal */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 12 }}>
          <button
            type="button"
            className={`catalogue-mode-tab ${viewMode === 'modules' ? 'active' : ''}`}
            onClick={() => setViewMode('modules')}
            data-testid="tab-catalogue-modules"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border:
                viewMode === 'modules'
                  ? '1px solid var(--color-accent-cyan)'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                viewMode === 'modules'
                  ? 'rgba(56, 189, 248, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color:
                viewMode === 'modules' ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🛡️</span> Modules &amp; Scenarios
          </button>
          <button
            type="button"
            className={`catalogue-mode-tab ${viewMode === 'arsenal' ? 'active' : ''}`}
            onClick={() => setViewMode('arsenal')}
            data-testid="tab-catalogue-arsenal"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border:
                viewMode === 'arsenal'
                  ? '1px solid var(--color-accent-cyan)'
                  : '1px solid var(--color-border-subtle)',
              backgroundColor:
                viewMode === 'arsenal'
                  ? 'rgba(56, 189, 248, 0.2)'
                  : 'var(--color-bg-surface-elevated)',
              color:
                viewMode === 'arsenal' ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⚔️</span> Cybersecurity Arsenal (
            {GLOBAL_CYBER_ARSENAL_REGISTRY.getAllTools().length})
          </button>
        </div>

        {viewMode === 'modules' && (
          <>
            {/* Track Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className={`track-tab ${selectedTrack === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    selectedTrack === 'all'
                      ? '1px solid var(--color-accent-cyan)'
                      : '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    selectedTrack === 'all'
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'var(--color-bg-surface-elevated)',
                  color:
                    selectedTrack === 'all'
                      ? 'var(--color-accent-cyan)'
                      : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                All Tracks ({CATALOGUE_ENTRIES.length})
              </button>

              <button
                className={`track-tab ${selectedTrack === 'blue' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('blue')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    selectedTrack === 'blue'
                      ? '1px solid #3b82f6'
                      : '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    selectedTrack === 'blue'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'var(--color-bg-surface-elevated)',
                  color: selectedTrack === 'blue' ? '#60a5fa' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                🔵 Blue Team — Defenders
              </button>

              <button
                className={`track-tab ${selectedTrack === 'red' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('red')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    selectedTrack === 'red'
                      ? '1px solid #ef4444'
                      : '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    selectedTrack === 'red'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'var(--color-bg-surface-elevated)',
                  color: selectedTrack === 'red' ? '#f87171' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                🔴 Red Team — Attack Simulators
              </button>

              <button
                className={`track-tab ${selectedTrack === 'purple' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('purple')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    selectedTrack === 'purple'
                      ? '1px solid #a855f7'
                      : '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    selectedTrack === 'purple'
                      ? 'rgba(168, 85, 247, 0.2)'
                      : 'var(--color-bg-surface-elevated)',
                  color: selectedTrack === 'purple' ? '#c084fc' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                🟣 Purple Team — Detection Loop
              </button>

              <button
                className={`track-tab ${selectedTrack === 'shared' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('shared')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    selectedTrack === 'shared'
                      ? '1px solid #10b981'
                      : '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    selectedTrack === 'shared'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'var(--color-bg-surface-elevated)',
                  color: selectedTrack === 'shared' ? '#34d399' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                🟢 Shared Foundations
              </button>
            </div>

            {/* Filter Controls & Search */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  placeholder="Search by topic, discipline, tool, or role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Difficulty:
                </span>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: 'var(--color-bg-surface-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.78rem',
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={e =>
                    setSelectedStatus(
                      e.target.value as 'all' | 'available' | 'completed' | 'planned'
                    )
                  }
                  style={{
                    padding: '5px 8px',
                    backgroundColor: 'var(--color-bg-surface-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.78rem',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>
          </>
        )}
      </header>

      {viewMode === 'arsenal' ? (
        <CyberArsenalView onOpenApp={onOpenApp} />
      ) : (
        /* Main Split Layout: Left List, Right Detail */
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Side: Scrollable Catalogue Cards */}
          <div
            className="catalogue-list-pane"
            style={{
              width: 380,
              borderRight: '1px solid var(--color-border-subtle)',
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              backgroundColor: 'var(--color-bg-base)',
            }}
          >
            {filteredEntries.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                No catalogue entries found matching your filter criteria.
              </div>
            ) : (
              filteredEntries.map(entry => {
                const isSelected = entry.id === selectedEntry.id;
                const isCompleted = completedEntries.includes(entry.id);
                const trackColor = getTrackColor(entry.track);
                const hasPlayableExercise = Boolean(entry.exerciseId);

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? `1px solid ${trackColor}`
                        : '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected
                        ? 'var(--color-bg-surface-elevated)'
                        : 'var(--color-bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: `4px solid ${trackColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: trackColor,
                        }}
                      >
                        {entry.track} · {entry.discipline.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--color-text-secondary)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {entry.difficulty}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 4px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {entry.title}
                    </h4>

                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: '0.78rem',
                        color: 'var(--color-text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {entry.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.72rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 4 }}>
                        {hasPlayableExercise ? (
                          <span style={{ color: 'var(--color-accent-emerald)', fontWeight: 600 }}>
                            ⚡ Playable Exercise
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            📖 Informational Module
                          </span>
                        )}
                      </div>

                      {isCompleted ? (
                        <span style={{ color: 'var(--color-status-success)', fontWeight: 600 }}>
                          ✓ Completed
                        </span>
                      ) : entry.status === 'planned' ? (
                        <span style={{ color: 'var(--color-text-muted)' }}>Planned</span>
                      ) : (
                        <span style={{ color: 'var(--color-accent-cyan)' }}>Available</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Side: Detail & Exercise Workspace */}
          <div
            className="catalogue-detail-pane"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              backgroundColor: 'var(--color-bg-surface)',
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: `${getTrackColor(selectedEntry.track)}22`,
                      color: getTrackColor(selectedEntry.track),
                      border: `1px solid ${getTrackColor(selectedEntry.track)}44`,
                    }}
                  >
                    {selectedEntry.track.toUpperCase()} TRACK
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ID: <code>{selectedEntry.id}</code>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {completedEntries.includes(selectedEntry.id) && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        borderRadius: 12,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: 'var(--color-status-success)',
                        fontWeight: 600,
                      }}
                    >
                      ✓ Mastery Achieved
                    </span>
                  )}
                </div>
              </div>

              <h1 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 700 }}>
                {selectedEntry.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {selectedEntry.description}
              </p>
            </div>

            {/* Why it Matters */}
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-amber)',
                  marginBottom: 4,
                }}
              >
                💡 Why This Discipline Matters
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {selectedEntry.whyItMatters}
              </p>
            </div>

            {/* Fictional Scenario */}
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-cyan)',
                  marginBottom: 4,
                }}
              >
                🏢 Realistic Lagos Scenario
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {selectedEntry.fictionalScenario}
              </p>
            </div>

            {/* Learning Objectives & Guidance */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: 6,
                  }}
                >
                  🎯 Learning Objectives
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {selectedEntry.learningObjectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: 6,
                  }}
                >
                  🛠️ Relevant Tools & Career Pathways
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Tools:{' '}
                  </span>
                  {selectedEntry.relevantTools.map(tool => (
                    <code
                      key={tool}
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        margin: '0 3px',
                        backgroundColor: 'var(--color-bg-surface-elevated)',
                        borderRadius: 4,
                        color: 'var(--color-accent-cyan)',
                      }}
                    >
                      {tool}
                    </code>
                  ))}
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Careers:{' '}
                  </span>
                  {selectedEntry.relatedRoleIds.map(role => (
                    <span
                      key={role}
                      style={{
                        fontSize: '0.75rem',
                        margin: '0 3px',
                        color: 'var(--color-accent-emerald)',
                      }}
                    >
                      • {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Practical Exercise Console */}
            {associatedExercise ? (
              <div
                className="exercise-workspace"
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  border: isExerciseActive
                    ? '2px solid var(--color-accent-cyan)'
                    : '1px solid var(--color-border-active)',
                  boxShadow: isExerciseActive ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: 'var(--color-accent-cyan)',
                      }}
                    >
                      PRACTICAL LEARNING EXERCISE
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                      {associatedExercise.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isExerciseCompleted && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: 'var(--color-status-success)',
                          fontWeight: 600,
                        }}
                      >
                        ✓ Completed (+₦{(associatedExercise.rewardKobo / 100).toFixed(2)})
                      </span>
                    )}

                    {!isExerciseActive ? (
                      <button
                        onClick={() => handleStartExercise(associatedExercise.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-status-info)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                        }}
                      >
                        {isExerciseCompleted ? 'Replay Exercise' : 'Start Exercise'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResetExercise(associatedExercise.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                        }}
                      >
                        Reset State
                      </button>
                    )}
                  </div>
                </div>

                {/* Scope of Authorization */}
                <div
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.78rem',
                    color: 'var(--color-accent-rose)',
                  }}
                >
                  <strong>Authorization & Scope:</strong> {associatedExercise.scopeOfAuthorization}
                </div>

                {/* Dynamic Exercise Body based on Track */}
                {associatedExercise.id === 'ex_blue_soc_log_triage' && (
                  <div className="exercise-blue-content">
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 12,
                      }}
                    >
                      <strong>Scenario Context:</strong> {associatedExercise.scenarioContext}
                    </p>

                    <div
                      style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        Simulation Objectives:
                      </div>
                      {associatedExercise.objectives.map(obj => {
                        const isObjDone = completedObjectiveIds.includes(obj.id);
                        return (
                          <div
                            key={obj.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: isObjDone
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'var(--color-bg-base)',
                              border: isObjDone
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid var(--color-border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 500,
                                  color: isObjDone
                                    ? 'var(--color-status-success)'
                                    : 'var(--color-text-primary)',
                                }}
                              >
                                {isObjDone ? '✓ ' : '○ '} {obj.description}
                              </div>
                              {obj.hint && (
                                <div
                                  style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}
                                >
                                  Hint: {obj.hint}
                                </div>
                              )}
                            </div>

                            {isExerciseActive && !isObjDone && (
                              <button
                                onClick={() => handleBlueAction(obj.id)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: 4,
                                  backgroundColor: 'var(--color-bg-surface-elevated)',
                                  border: '1px solid var(--color-border-focus)',
                                  color: 'var(--color-accent-cyan)',
                                  cursor: 'pointer',
                                }}
                              >
                                Inspect & Verify
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {associatedExercise.id === 'ex_red_authorized_recon_path' && (
                  <div className="exercise-red-content">
                    {/* RoE Acceptance Banner */}
                    <div
                      style={{
                        marginBottom: 14,
                        padding: 12,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: acceptedRoe
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(239, 68, 68, 0.15)',
                        border: acceptedRoe ? '1px solid #10b981' : '1px solid #ef4444',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              color: acceptedRoe
                                ? 'var(--color-status-success)'
                                : 'var(--color-accent-rose)',
                            }}
                          >
                            {acceptedRoe
                              ? '✓ Rules of Engagement Acknowledged & Signed'
                              : '⚠️ Rules of Engagement Agreement Required'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.76rem',
                              color: 'var(--color-text-secondary)',
                              marginTop: 2,
                            }}
                          >
                            Scope: Subnet 10.0.4.0/24 (filesrv-01) only. Do not exceed authorized
                            port diagnostics.
                          </div>
                        </div>

                        {isExerciseActive && !acceptedRoe && (
                          <button
                            onClick={handleAcceptRoe}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              border: 'none',
                              color: '#fff',
                              borderRadius: 4,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                            }}
                          >
                            Sign & Accept RoE
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Red Team Finding Submission Form */}
                    {acceptedRoe && (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-subtle)',
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            marginBottom: 8,
                            color: '#f87171',
                          }}
                        >
                          📝 Submit Authorized Red Team Finding Report
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Finding Title:
                          </label>
                          <input
                            type="text"
                            value={redFindingTitle}
                            onChange={e => setRedFindingTitle(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div>
                            <label
                              style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}
                            >
                              Target Host:
                            </label>
                            <input
                              type="text"
                              value={redFindingHost}
                              onChange={e => setRedFindingHost(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                backgroundColor: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border-subtle)',
                                color: '#fff',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}
                            >
                              Target Service:
                            </label>
                            <input
                              type="text"
                              value={redFindingService}
                              onChange={e => setRedFindingService(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                backgroundColor: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border-subtle)',
                                color: '#fff',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Vulnerability / Attack Vector:
                          </label>
                          <input
                            type="text"
                            value={redFindingVector}
                            onChange={e => setRedFindingVector(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Severity Level:
                          </label>
                          <select
                            value={redFindingSeverity}
                            onChange={e =>
                              setRedFindingSeverity(
                                e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
                              )
                            }
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Remediation Recommendation:
                          </label>
                          <textarea
                            rows={2}
                            value={redFindingRemediation}
                            onChange={e => setRedFindingRemediation(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Findings Recorded: {redFindings.length}
                          </div>
                          <button
                            onClick={handleSubmitRedFinding}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#ef4444',
                              border: 'none',
                              color: '#fff',
                              borderRadius: 4,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                            }}
                          >
                            Submit Finding
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {associatedExercise.id === 'ex_purple_detection_tuning_replay' && (
                  <div className="exercise-purple-content">
                    {/* Purple Team Loop Controls */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      {/* Step 1: Baseline Execution */}
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--color-accent-amber)',
                            marginBottom: 4,
                          }}
                        >
                          STEP 1: BASELINE EXECUTION
                        </div>
                        <p
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--color-text-secondary)',
                            margin: '0 0 10px',
                          }}
                        >
                          Simulate SMB lateral movement scenario against default unconfigured SIEM
                          rule.
                        </p>
                        <button
                          onClick={() => handleRunPurple('baseline')}
                          style={{
                            width: '100%',
                            padding: '6px',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid #f59e0b',
                            color: '#fbbf24',
                            borderRadius: 4,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          ▶ Run Baseline Scenario
                        </button>
                      </div>

                      {/* Step 2: Replay & Comparative Metrics */}
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--color-status-success)',
                            marginBottom: 4,
                          }}
                        >
                          STEP 3: REPLAY & BENCHMARK
                        </div>
                        <p
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--color-text-secondary)',
                            margin: '0 0 10px',
                          }}
                        >
                          Replay scenario with tuned rule and measure false positive rates on benign
                          noise.
                        </p>
                        <button
                          onClick={() => handleRunPurple('replay')}
                          style={{
                            width: '100%',
                            padding: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid #10b981',
                            color: '#34d399',
                            borderRadius: 4,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          🔄 Replay Scenario & Compare
                        </button>
                      </div>
                    </div>

                    {/* Step 2: SIEM Detection Rule Editor */}
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border-subtle)',
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--color-accent-cyan)',
                          }}
                        >
                          ⚙️ STEP 2: SIEM DETECTION RULE EDITOR — <code>RULE-DET-SMB-LATERAL</code>
                        </div>
                        <label
                          style={{
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editedRuleEnabled}
                            onChange={e => setEditedRuleEnabled(e.target.checked)}
                          />
                          Rule Enabled
                        </label>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 1fr',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Match Field:
                          </label>
                          <select
                            value={editedRuleField}
                            onChange={e => setEditedRuleField(e.target.value as DetectionRuleField)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.76rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          >
                            <option value="source">source</option>
                            <option value="eventType">eventType</option>
                            <option value="hostId">hostId</option>
                            <option value="user">user</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Operator:
                          </label>
                          <select
                            value={editedRuleOperator}
                            onChange={e =>
                              setEditedRuleOperator(e.target.value as DetectionRuleOperator)
                            }
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.76rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          >
                            <option value="EQUALS">EQUALS</option>
                            <option value="CONTAINS">CONTAINS</option>
                            <option value="STARTS_WITH">STARTS_WITH</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Match Value:
                          </label>
                          <input
                            type="text"
                            value={editedRuleValue}
                            onChange={e => setEditedRuleValue(e.target.value)}
                            placeholder="file-server"
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.76rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Severity:
                          </label>
                          <select
                            value={editedRuleSeverity}
                            onChange={e =>
                              setEditedRuleSeverity(e.target.value as 'INFO' | 'WARN' | 'CRITICAL')
                            }
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.76rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              color: '#fff',
                              borderRadius: 4,
                            }}
                          >
                            <option value="INFO">INFO</option>
                            <option value="WARN">WARN</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          MITRE: <code>{smbRule?.mitreTechnique ?? 'T1021.002'}</code>
                        </span>
                        <button
                          onClick={handleSaveTunedRule}
                          style={{
                            padding: '5px 14px',
                            backgroundColor: 'var(--color-status-info)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: 4,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          Save & Tune Detection Rule
                        </button>
                      </div>

                      {tuningMessage && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: '0.75rem',
                            color: 'var(--color-status-success)',
                          }}
                        >
                          ✓ {tuningMessage}
                        </div>
                      )}
                    </div>

                    {/* Telemetry & Metrics Display */}
                    {latestPurpleRun && (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-subtle)',
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: 6,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            LATEST RUN EVALUATION ({latestPurpleRun.runType.toUpperCase()})
                          </span>
                          <span
                            style={{
                              color: latestPurpleRun.detected
                                ? 'var(--color-status-success)'
                                : 'var(--color-accent-rose)',
                            }}
                          >
                            {latestPurpleRun.detected
                              ? '✓ DETECTED'
                              : '⚠️ GAP IDENTIFIED (0 / 1 DETECTED)'}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 8,
                            fontSize: '0.76rem',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 6,
                          }}
                        >
                          <div>
                            <strong>False Positives:</strong> {latestPurpleRun.falsePositiveCount}
                          </div>
                          <div>
                            <strong>Time to Detect:</strong>{' '}
                            {latestPurpleRun.timeToDetectSeconds !== null
                              ? `T+${latestPurpleRun.timeToDetectSeconds}s`
                              : 'N/A'}
                          </div>
                          <div>
                            <strong>Telemetry Inspected:</strong>{' '}
                            {latestPurpleRun.telemetryRecordsInspected} records
                          </div>
                        </div>

                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          {latestPurpleRun.details}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Exercise Button */}
                {isExerciseActive && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button
                      onClick={() => handleCompleteExercise(associatedExercise.id)}
                      style={{
                        padding: '8px 18px',
                        backgroundColor: 'var(--color-status-success)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>✓</span> Complete Exercise & Finalize Assessment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px dashed var(--color-border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  📖 Informational Learning Module
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  This catalogue entry provides theoretical foundations, policy guidance, and
                  architectural context. Hands-on practical exercise is planned for subsequent
                  training tiers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
