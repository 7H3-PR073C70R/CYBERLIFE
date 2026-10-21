/**
 * Cyberlife — Milestone 20: Activity Director & Career Progression Application Component
 *
 * Implements the core gameplay loop presentation:
 * 1. Active Mission: Inspect objectives, track live progress, review evidence, and resolve activities.
 * 2. Opportunity Director: Prioritized recommendation feed with transparent reasoning and procedural contracts.
 * 3. Career & Goals: Multi-stage career progression, skill tree XP, and long-term milestones.
 * 4. Audit Log & History: Immutable settlement ledger and workstation activity telemetry.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory presentation. Zero host system commands or real network calls.
 */

import React, { useState, useEffect } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import type { SimulationEvent } from '@/simulation';
import { AUTHORED_ACTIVITIES, generateProceduralContract } from '@/simulation/activities/activityCatalogue';
import type { ActivityDefinition, ActivityType } from '@/simulation/activities/types';
import { SKILL_DEFINITIONS, XP_PER_LEVEL } from '@/simulation/career/skillDefinitions';
import type { SkillId } from '@/simulation/career/types';

export type ActivityAppTab = 'active' | 'opportunities' | 'goals' | 'audit';

export interface ActivityAppProps {
  workstationId?: string;
  initialTab?: ActivityAppTab;
}

export interface WorkstationLogItem {
  id: string;
  timestamp: string;
  category: 'TOOL' | 'SYSTEM' | 'SECURITY';
  status: 'SUCCESS' | 'INFO' | 'NOTICE' | 'DENIED' | 'ERROR';
  title: string;
  details: string;
  tool?: string;
}

export const ActivityApp: React.FC<ActivityAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
  initialTab = 'active',
}) => {
  const sim = useOptionalSimulation();
  const state = sim?.state;
  const director = state?.activityDirector;

  // URL query param detection for tab & activity selection
  const [activeTab, setActiveTab] = useState<ActivityAppTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('activityTab') as ActivityAppTab;
      if (tabParam && ['active', 'opportunities', 'goals', 'audit'].includes(tabParam)) {
        return tabParam;
      }
    }
    return initialTab;
  });

  const [opportunityFilter, setOpportunityFilter] = useState<'ALL' | 'PRIMARY' | 'RECOMMENDED' | 'CAREER' | 'OPTIONAL'>('ALL');
  const [expandedObjectiveIds, setExpandedObjectiveIds] = useState<Set<string>>(new Set());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [logFilterCategory, setLogFilterCategory] = useState<string>('ALL');

  // Baseline simulated activities for the Audit Log tab
  const [workstationLogs, setWorkstationLogs] = useState<WorkstationLogItem[]>(() => [
    {
      id: 'act-init-01',
      timestamp: '07:35:45 AM',
      category: 'SECURITY',
      status: 'INFO',
      title: 'Console Session Established',
      details: 'User tade_adebayo authenticated to terminal on ws-sec-04 (Marina Tower).',
    },
    {
      id: 'act-init-02',
      timestamp: '07:48:19 AM',
      category: 'SYSTEM',
      status: 'NOTICE',
      title: 'Perimeter Egress Drop Logged',
      details: 'Gateway gw-core-01 dropped connection attempt to unroutable address 198.51.100.99.',
    },
    {
      id: 'act-init-03',
      timestamp: '07:55:00 AM',
      category: 'SECURITY',
      status: 'SUCCESS',
      title: 'Audit Baseline Synchronized',
      details: 'SIEM collector mon-siem-01 verified SHA-256 hash on morning evidence snapshot EVD-2026-001.',
    },
  ]);

  // Sync simulation events for real-time workstation log
  useEffect(() => {
    if (!sim) return;

    const handleCyberActivity = (event: SimulationEvent) => {
      if (event.type === 'CYBER_ACTIVITY_RECORDED') {
        const payload = event.payload;
        const simTime = sim.state.time.calendar.timeString ?? '08:00 AM';

        const newItem: WorkstationLogItem = {
          id: payload.activityId ?? `act-${Date.now()}`,
          timestamp: simTime,
          category: 'TOOL',
          status: payload.success ? 'SUCCESS' : 'DENIED',
          title: `Tool Executed: ${payload.tool.toUpperCase()}`,
          details: payload.summary ?? `Executed command ${payload.tool} ${payload.action}`,
          tool: payload.tool,
        };

        setWorkstationLogs(prev => [newItem, ...prev]);
      }
    };

    const unsubscribe = sim.engine.on('CYBER_ACTIVITY_RECORDED', handleCyberActivity);
    return () => {
      unsubscribe();
    };
  }, [sim]);

  // Active activity definition and runtime
  const activeActivityId = director?.activeActivityId ?? 'act_story_aster_investigation';
  const activeRuntime = director?.activities[activeActivityId];
  const activeDef: ActivityDefinition | undefined =
    AUTHORED_ACTIVITIES[activeActivityId];

  const toggleObjectiveExpand = (objId: string) => {
    setExpandedObjectiveIds(prev => {
      const next = new Set(prev);
      if (next.has(objId)) {
        next.delete(objId);
      } else {
        next.add(objId);
      }
      return next;
    });
  };

  const handleAccept = (activityId: string) => {
    if (!sim) return;
    const res = sim.engine.dispatch({
      type: 'AcceptActivity',
      activityId,
    });
    if (res.success) {
      setActionFeedback(`Accepted "${AUTHORED_ACTIVITIES[activityId]?.title ?? activityId}". Switched to Active Workspace.`);
      setActiveTab('active');
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleResolve = () => {
    if (!sim || !activeActivityId) return;
    const res = sim.engine.dispatch({
      type: 'ResolveActivity',
      activityId: activeActivityId,
    });
    if (res.success) {
      setActionFeedback(res.message);
    } else {
      setActionFeedback(`Cannot resolve activity: ${res.message}`);
    }
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleAbandon = () => {
    if (!sim || !activeActivityId) return;
    const res = sim.engine.dispatch({
      type: 'AbandonActivity',
      activityId: activeActivityId,
    });
    if (res.success) {
      setActionFeedback(`Activity abandoned safely. Returned to opportunity pool.`);
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleGenerateProcedural = () => {
    if (!sim) return;
    const playerLevel = state?.career?.currentLevel ?? 1;
    const careerPath = state?.career?.currentPathId;
    const count = (director?.completedHistory.length ?? 0) + 1;
    const proceduralDef = generateProceduralContract(count, playerLevel, careerPath);
    (AUTHORED_ACTIVITIES as Record<string, ActivityDefinition>)[proceduralDef.id] = proceduralDef;
    setActionFeedback(`New Commercial Contract generated: "${proceduralDef.title}"`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const getActivityTypeBadgeColor = (type: ActivityType) => {
    switch (type) {
      case 'STORY_MISSION':
        return '#00e5ff'; // cyan
      case 'DEFENSIVE_OPERATION':
        return '#10b981'; // emerald
      case 'RED_TEAM_ASSESSMENT':
        return '#f43f5e'; // rose
      case 'CYBER_CONTRACT':
        return '#f59e0b'; // amber
      case 'INVESTIGATION':
        return '#8b5cf6'; // violet
      case 'CAREER_ASSIGNMENT':
        return '#38bdf8'; // sky
      default:
        return '#94a3b8'; // slate
    }
  };

  const isCedarline = workstationId.includes('cedarline');
  const nodeLabel = isCedarline
    ? 'cedarline-sec-ws04.corp.local (10.0.4.15)'
    : 'lagos-rig-dev01.local (192.168.1.104)';

  return (
    <div
      className="activity-app-container"
      role="region"
      aria-label="Activity Director and Career Progression"
      data-testid="activity-app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* App Header & Navigation Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#0d1322',
          borderBottom: '1px solid #1e293b',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e5ff',
              fontWeight: 700,
            }}
          >
            🎯
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#f8fafc',
                margin: 0,
              }}
            >
              ACTIVITY DIRECTOR & CAREER HUB
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Cyberlife M20 // Node: {nodeLabel} // Player: {state?.player.name ?? 'Babatunde Vance'}
            </div>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            backgroundColor: '#070b14',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            gap: '2px',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
            data-testid="tab-active-mission"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'active' ? '#1e293b' : 'transparent',
              color: activeTab === 'active' ? '#00e5ff' : '#94a3b8',
              transition: 'all 150ms ease',
            }}
          >
            Active Mission
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'opportunities'}
            onClick={() => setActiveTab('opportunities')}
            data-testid="tab-opportunities"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'opportunities' ? '#1e293b' : 'transparent',
              color: activeTab === 'opportunities' ? '#00e5ff' : '#94a3b8',
              transition: 'all 150ms ease',
            }}
          >
            Opportunities ({director?.recommendedActivityIds.length ?? 0})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
            data-testid="tab-career-goals"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'goals' ? '#1e293b' : 'transparent',
              color: activeTab === 'goals' ? '#00e5ff' : '#94a3b8',
              transition: 'all 150ms ease',
            }}
          >
            Career & Goals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
            data-testid="tab-audit-log"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'audit' ? '#1e293b' : 'transparent',
              color: activeTab === 'audit' ? '#00e5ff' : '#94a3b8',
              transition: 'all 150ms ease',
            }}
          >
            Audit Log & History
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          role="status"
          data-testid="action-feedback-banner"
          style={{
            padding: '8px 18px',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
            color: '#00e5ff',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>ℹ️</span>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Tab Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE MISSION WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === 'active' && (
          <div data-testid="panel-active-mission" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeDef && activeRuntime ? (
              <>
                {/* Header Card */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${getActivityTypeBadgeColor(activeDef.type)}20`,
                          color: getActivityTypeBadgeColor(activeDef.type),
                          border: `1px solid ${getActivityTypeBadgeColor(activeDef.type)}40`,
                        }}
                      >
                        {activeDef.type.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#1e293b',
                          color: '#94a3b8',
                        }}
                      >
                        SOURCE: {activeDef.source}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: activeRuntime.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: activeRuntime.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        STATUS: {activeRuntime.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Est. Payout: <strong style={{ color: '#10b981' }}>₦{(activeDef.reward.payoutKobo / 100).toLocaleString()}</strong> | Career XP: <strong style={{ color: '#38bdf8' }}>+{activeDef.reward.careerXp}</strong>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
                      {activeDef.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                      {activeDef.description}
                    </p>
                  </div>

                  {/* Narrative Context Callout (Mr. Robot tone) */}
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      borderLeft: '3px solid #00e5ff',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.82rem',
                      fontStyle: 'italic',
                      color: '#cbd5e1',
                    }}
                  >
                    "{activeDef.narrativeContext}"
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Engagement Objectives Progress</span>
                      <strong style={{ color: '#00e5ff' }}>{activeRuntime.progressPercentage}% Complete</strong>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#070b14', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${activeRuntime.progressPercentage}%`,
                          backgroundColor: activeRuntime.progressPercentage === 100 ? '#10b981' : '#00e5ff',
                          transition: 'width 250ms ease-out',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Objectives Checklist Card */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '16px 20px',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
                    Active Engagement Objectives
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeRuntime.objectives.map((obj, idx) => {
                      const isExpanded = expandedObjectiveIds.has(obj.id);
                      return (
                        <div
                          key={obj.id}
                          style={{
                            padding: '12px 14px',
                            backgroundColor: obj.isCompleted ? 'rgba(16, 185, 129, 0.05)' : '#070b14',
                            border: `1px solid ${obj.isCompleted ? 'rgba(16, 185, 129, 0.3)' : '#1e293b'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  backgroundColor: obj.isCompleted ? '#10b981' : '#1e293b',
                                  color: obj.isCompleted ? '#05090f' : '#94a3b8',
                                  fontWeight: 700,
                                }}
                              >
                                {obj.isCompleted ? '✓' : idx + 1}
                              </span>
                              <strong style={{ fontSize: '0.88rem', color: obj.isCompleted ? '#10b981' : '#f8fafc' }}>
                                {obj.title}
                              </strong>
                              {obj.isOptional && (
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', backgroundColor: '#1e293b', padding: '1px 6px', borderRadius: '3px' }}>
                                  OPTIONAL
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleObjectiveExpand(obj.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#00e5ff',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              {isExpanded ? 'Hide Details' : 'Forensic Guidance'}
                            </button>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#94a3b8', paddingLeft: '30px' }}>
                            {obj.description}
                          </div>

                          {obj.actionPrompt && (
                            <div style={{ fontSize: '0.78rem', color: '#38bdf8', paddingLeft: '30px' }}>
                              Action: {obj.actionPrompt}
                            </div>
                          )}

                          {isExpanded && obj.hint && (
                            <div
                              style={{
                                marginTop: '6px',
                                marginLeft: '30px',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(0, 229, 255, 0.06)',
                                borderLeft: '2px solid #00e5ff',
                                fontSize: '0.78rem',
                                color: '#cbd5e1',
                              }}
                            >
                              💡 <strong>Technical Hint:</strong> {obj.hint}
                              {obj.explanation && <div style={{ marginTop: '4px', color: '#94a3b8' }}>{obj.explanation}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Controls & Resolution Bar */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResolve}
                      data-testid="btn-resolve-activity"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#00e5ff',
                        color: '#05090f',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      Verify Objectives & Resolve Activity
                    </button>

                    <button
                      type="button"
                      onClick={handleAbandon}
                      data-testid="btn-abandon-activity"
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        color: '#f43f5e',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      Abandon Activity
                    </button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Failure safe guard: Abandoning an activity safely returns it to the pool without penalizing your career ladder.
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#0f172a',
                  border: '1px dashed #1e293b',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '8px' }}>
                  No Active Engagement Selected
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                  The Activity Director has prioritized several recommendations for your career level. Browse available opportunities and accept an engagement.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('opportunities')}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#00e5ff',
                    color: '#05090f',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Browse Available Opportunities
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OPPORTUNITIES & DIRECTOR RECOMMENDATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'opportunities' && (
          <div data-testid="panel-opportunities" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Rationale Banner */}
            <div
              style={{
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#00e5ff' }}>
                  Opportunity Director Feed
                </strong>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Curated recommendations based on: Role: <strong>{state?.career?.roleTitle ?? 'Trainee Analyst'}</strong>, Active Factions, and Lagos Island security telemetry.
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateProcedural}
                data-testid="btn-generate-procedural"
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                }}
              >
                + Request On-Demand Contract
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['ALL', 'PRIMARY', 'RECOMMENDED', 'CAREER', 'OPTIONAL'] as const).map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setOpportunityFilter(filter)}
                  data-testid={`filter-${filter.toLowerCase()}`}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: opportunityFilter === filter ? '#00e5ff' : '#0f172a',
                    color: opportunityFilter === filter ? '#05090f' : '#94a3b8',
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Opportunities Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
              {Object.values(AUTHORED_ACTIVITIES)
                .filter(act => {
                  if (opportunityFilter === 'PRIMARY') return act.priority === 'PRIMARY_OBJECTIVE';
                  if (opportunityFilter === 'RECOMMENDED') return act.priority === 'RECOMMENDED';
                  if (opportunityFilter === 'CAREER') return act.type === 'CAREER_ASSIGNMENT';
                  if (opportunityFilter === 'OPTIONAL') return act.priority === 'OPTIONAL';
                  return true;
                })
                .map(act => {
                  const runtime = director?.activities[act.id];
                  const isCurrentActive = director?.activeActivityId === act.id;
                  const isCompleted = runtime?.status === 'COMPLETED';

                  return (
                    <div
                      key={act.id}
                      data-testid={`opportunity-card-${act.id}`}
                      style={{
                        backgroundColor: '#0f172a',
                        border: `1px solid ${isCurrentActive ? '#00e5ff' : isCompleted ? '#1e293b' : '#334155'}`,
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              backgroundColor: `${getActivityTypeBadgeColor(act.type)}20`,
                              color: getActivityTypeBadgeColor(act.type),
                            }}
                          >
                            {act.type.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {act.source}
                          </span>
                        </div>

                        <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>
                          {act.title}
                        </strong>

                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                          {act.description}
                        </p>

                        {act.whyRecommended && (
                          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontStyle: 'italic' }}>
                            💡 {act.whyRecommended}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ₦{(act.reward.payoutKobo / 100).toLocaleString()} | +{act.reward.careerXp} XP
                        </div>

                        {isCurrentActive ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00e5ff' }}>
                            ACTIVE ENGAGEMENT
                          </span>
                        ) : isCompleted && !act.isRepeatable ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                            ✓ COMPLETED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAccept(act.id)}
                            data-testid={`btn-accept-${act.id}`}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#00e5ff',
                              color: '#05090f',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Accept Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CAREER PROGRESSION & LONG-TERM GOALS */}
        {/* ========================================================================= */}
        {activeTab === 'goals' && (
          <div data-testid="panel-career-goals" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Career Standing Overview */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Current Role</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#00e5ff' }}>
                  {state?.career?.roleTitle ?? 'Trainee Analyst'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {state?.career?.employer ?? 'Cedarline Solutions'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Career Level & Standing</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  Tier {state?.career?.currentLevel ?? 1}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                  {state?.career?.xp ?? 0} Career XP Earned
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Liquid Balance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981' }}>
                  ₦{((state?.player.moneyKobo ?? 250_000) / 100).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Integer safe kobo ledger
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Freelance Reputation</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f59e0b' }}>
                  {state?.bountyHub?.reputation.score ?? 120} pts
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Tier: {state?.bountyHub?.reputation.tier ?? 'ROOKIE'}
                </div>
              </div>
            </div>

            {/* Long-Term Career Goals */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
                Long-Term Professional Milestones
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {director?.longTermGoals.map(goal => {
                  const pct = Math.round((goal.currentProgress / goal.maxProgress) * 100);
                  return (
                    <div
                      key={goal.id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#070b14',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.88rem', color: goal.isCompleted ? '#10b981' : '#f8fafc' }}>
                          {goal.title} {goal.isCompleted && '✓'}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                          {goal.currentProgress} / {goal.maxProgress} ({pct}%)
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 8px 0' }}>
                        {goal.description}
                      </p>
                      <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: goal.isCompleted ? '#10b981' : '#8b5cf6',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                        Reward: {goal.unlockedReward}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Cybersecurity Skills Matrix */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
                Core Cybersecurity Competencies (9 Disciplines)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {Object.entries(SKILL_DEFINITIONS).map(([skillId, def]) => {
                  const skillState = state?.skills?.[skillId as SkillId];
                  const level = skillState?.level ?? 1;
                  const xp = skillState?.xp ?? 0;

                  return (
                    <div
                      key={skillId}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#070b14',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{def.name}</strong>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            backgroundColor: 'rgba(0, 229, 255, 0.15)',
                            color: '#00e5ff',
                            borderRadius: '3px',
                          }}
                        >
                          LVL {level}
                        </span>
                      </div>

                      <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(xp / XP_PER_LEVEL) * 100}%`, backgroundColor: '#00e5ff' }} />
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {xp} / {XP_PER_LEVEL} XP to next level
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUDIT LOG & SETTLEMENT HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div data-testid="panel-audit-log" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Completed Activities Settlement History */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
                Completed Engagements & Settlement Ledger
              </h4>

              {director?.completedHistory.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  No historical engagements logged yet. Complete activities to build your verifiable record.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {director?.completedHistory.map((rec, i) => (
                    <div
                      key={`${rec.activityId}_${i}`}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#070b14',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{rec.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.feedbackNotes}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            backgroundColor: rec.outcome === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: rec.outcome === 'COMPLETED' ? '#10b981' : '#f43f5e',
                          }}
                        >
                          {rec.outcome}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                          +₦{(rec.payoutKobo / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workstation Live Audit Timeline (Preserving Original Feature) */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Workstation Console & Tool Audit Stream
                </h4>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {['ALL', 'TOOL', 'SECURITY', 'SYSTEM'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLogFilterCategory(cat)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: logFilterCategory === cat ? '#1e293b' : 'transparent',
                        color: logFilterCategory === cat ? '#00e5ff' : '#64748b',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {workstationLogs
                  .filter(item => logFilterCategory === 'ALL' || item.category === logFilterCategory)
                  .map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#070b14',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '2px',
                              backgroundColor: item.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                              color: item.status === 'SUCCESS' ? '#10b981' : '#94a3b8',
                            }}
                          >
                            {item.status}
                          </span>
                          <strong style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{item.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          {item.details}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.timestamp}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
