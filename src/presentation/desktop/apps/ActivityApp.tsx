/**
 * Cyberlife — Security Activity Application Component
 *
 * Displays a real-time chronological timeline of simulated workstation events,
 * cybersecurity tool executions, and security audit telemetry.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches players that in a modern Security Operations Center (SOC),
 * all analyst actions and system triggers are timestamped and recorded
 * to provide an immutable audit trail.
 */

import React, { useState, useEffect } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import type { SimulationEvent } from '@/simulation';

export interface ActivityItem {
  id: string;
  timestamp: string;
  category: 'TOOL' | 'SYSTEM' | 'SECURITY';
  status: 'SUCCESS' | 'INFO' | 'NOTICE' | 'DENIED' | 'ERROR';
  title: string;
  details: string;
  tool?: string;
}

export interface ActivityAppProps {
  workstationId?: string;
}

export const ActivityApp: React.FC<ActivityAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
}) => {
  const sim = useOptionalSimulation();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Baseline simulated activities
  const [activities, setActivities] = useState<ActivityItem[]>(() => [
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
      details:
        'SIEM collector mon-siem-01 verified SHA-256 hash on morning evidence snapshot EVD-2026-001.',
    },
  ]);

  // Listen to authoritative simulation events
  useEffect(() => {
    if (!sim) return;

    const handleEvent = (event: SimulationEvent) => {
      if (event.type === 'CYBER_ACTIVITY_RECORDED') {
        const payload = event.payload;
        const simTime = sim.state.time.calendar.timeString ?? '08:00 AM';

        const newItem: ActivityItem = {
          id: payload.activityId ?? `act-${Date.now()}`,
          timestamp: simTime,
          category: 'TOOL',
          status: payload.success ? 'SUCCESS' : 'DENIED',
          title: `Tool Executed: ${payload.tool.toUpperCase()}`,
          details: payload.summary ?? `Executed command ${payload.tool} ${payload.action}`,
          tool: payload.tool,
        };

        setActivities(prev => [newItem, ...prev]);
      }
    };

    const unsubscribe = sim.engine.on('CYBER_ACTIVITY_RECORDED', handleEvent);
    return () => {
      unsubscribe();
    };
  }, [sim]);

  const filtered = activities.filter(item => {
    if (filterCategory === 'ALL') return true;
    return item.category === filterCategory;
  });

  const isCedarline = workstationId.includes('cedarline');
  const nodeLabel = isCedarline
    ? 'cedarline-sec-ws04.corp.local (10.0.4.15)'
    : 'lagos-rig-dev01.local (192.168.1.104)';

  return (
    <div
      className="activity-app-container"
      role="region"
      aria-label="Security Activity Log"
      data-testid="activity-app-container"
    >
      {/* Activity Header */}
      <div className="activity-header">
        <div className="activity-title-group">
          <div className="activity-badge-icon" aria-hidden="true">
            📊
          </div>
          <div>
            <h2 className="activity-main-title">Security Activity Monitor</h2>
            <div className="activity-sub-title">Node: {nodeLabel}</div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="activity-filter-pills" role="tablist">
          {['ALL', 'TOOL', 'SECURITY', 'SYSTEM'].map(cat => (
            <button
              key={cat}
              type="button"
              className={`activity-filter-btn ${filterCategory === cat ? 'filter-active' : ''}`}
              onClick={() => setFilterCategory(cat)}
              data-testid={`activity-filter-${cat.toLowerCase()}`}
            >
              {cat === 'ALL' ? 'All Activities' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="activity-safety-notice">
        <span aria-hidden="true">🛡️</span>
        <span>
          <strong>Audit Trail:</strong> In-game actions (network discovery, service scans, log
          queries, evidence reviews) are recorded in this simulated activity timeline.
        </span>
      </div>

      {/* Activity Timeline List */}
      <div
        className="activity-list-scroll"
        role="feed"
        aria-label="Activity timeline"
        data-testid="activity-list-scroll"
      >
        {filtered.length === 0 ? (
          <div className="activity-empty-state">
            No activity records match the selected category.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`activity-card status-${item.status.toLowerCase()}`}
              data-testid="activity-card"
            >
              <div className="activity-card-header">
                <div className="activity-card-left">
                  <span className={`activity-status-pill status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                  <span className="activity-category-tag">{item.category}</span>
                  <strong className="activity-card-title">{item.title}</strong>
                </div>
                <span className="activity-time-text">{item.timestamp}</span>
              </div>
              <div className="activity-card-body">{item.details}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
